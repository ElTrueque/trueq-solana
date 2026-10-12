import { readFile } from 'node:fs/promises';
import { Reader, base58Encode, flattenInstructions, sha256 } from './lib.mjs';

export const METEORA = Object.freeze({
  program: 'cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG',
  pool: '7wtmy7VHBzU6pmG3K8EB25mrsyTYEBfGRBgefBAEXakt',
  position: 'A7yHQXA9bu6tKxM259rVX4cYiqF5M7qGtPrY2Lzg9FpQ',
  nft: 'HEQATttj2drSJs1L7jYdA6X8jFh57opNrGqpX6eKkZ9w',
  nftAccount: '6a1GMa4nNjJiScrUNRQ5XRqGrVHh3sSgWcZsuX7HcrRw',
  tokenA: '3m4etpgjNhFduBznEtQo56u5rKpXEgcYbZzV7ijdiq8W',
  tokenB: 'So11111111111111111111111111111111111111112',
  vaultA: '3WjecsMXPyANLppM3QiseYTxayGB9RJke9a8KMZsgpA7',
  vaultB: '3CZZdGeYzwtR2NHzK4R8mTfGuFQegY3XT3RsJEWYS5xn',
  creator: 'EBTS1qQjvfbxCXXcYAXbjVGjEYyGotUpuV98eTtBgtej',
  creation: 'V1W9SzR9vLUXepxGtJYzqSi1VPpKQVs3Uj1jrXZMcZLKrkV5vNHUA3874Mni38Me2XA3pVcKFsm1Lxupbupu1ig',
  activation: '1791817200',
  tokenProgram: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
});
const idlBytes = await readFile(new URL('./vendor/meteora/cp_amm.json', import.meta.url));
export const idlSha256 = sha256(idlBytes).toString('hex');
export const idl = JSON.parse(idlBytes);

// The official IDL includes every explicit padding field in these fixed-size
// bytemuck/C layouts. Reading sequentially is the same layout used by Anchor's
// coder; no guessed offsets and no network-supplied schema.
export function decodeIdlType(reader, type) {
  if (type === 'u8') return reader.u8();
  if (type === 'u16') return reader.u16();
  if (type === 'u32') return reader.u32();
  if (type === 'u64') return reader.u64();
  if (type === 'u128') { const b = reader.bytes(16); return (b.readBigUInt64LE() + (b.readBigUInt64LE(8) << 64n)).toString(); }
  if (type === 'pubkey') return reader.key();
  if (type === 'bool') return reader.bool();
  if (type?.array) return Array.from({ length: type.array[1] }, () => decodeIdlType(reader, type.array[0]));
  if (type?.option) return reader.option(() => decodeIdlType(reader, type.option));
  if (type?.defined) {
    const def = idl.types.find(t => t.name === type.defined.name);
    if (!def || def.type.kind !== 'struct') throw new Error('Unsupported IDL type');
    return Object.fromEntries(def.type.fields.map(field => [field.name, decodeIdlType(reader, field.type)]));
  }
  throw new Error(`Unsupported IDL type: ${JSON.stringify(type)}`);
}
export function decodeAccount(data, name) {
  const r = new Reader(data), account = idl.accounts.find(a => a.name === name);
  if (!account || !r.bytes(8).equals(Buffer.from(account.discriminator))) throw new Error(`Wrong ${name} discriminator`);
  const value = decodeIdlType(r, { defined: { name } });
  if (r.offset !== r.data.length) throw new Error(`Unexpected ${name} account size: consumed ${r.offset}, got ${r.data.length}`);
  return value;
}
export function decodeTimeFee(pool) {
  const r = new Reader(pool.pool_fees.base_fee.base_fee_info.data);
  const out = decodeIdlType(r, { defined: { name: 'PodAlignedFeeTimeScheduler' } });
  if (r.offset !== 32) throw new Error('Unexpected fee layout');
  return out;
}
export function feeNumeratorAfter(seconds, fee) {
  if (fee.base_fee_mode !== 0 || BigInt(fee.period_frequency) <= 0n) throw new Error('Not a linear time fee');
  let periods = BigInt(Math.max(0, Math.floor(seconds))) / BigInt(fee.period_frequency);
  if (periods > BigInt(fee.number_of_period)) periods = BigInt(fee.number_of_period);
  return BigInt(fee.cliff_fee_numerator) - periods * BigInt(fee.reduction_factor);
}
function tokenAccount(value) {
  if (!value || value.owner !== METEORA.tokenProgram || value.executable) throw new Error('Vault not owned by SPL Token');
  const b = Buffer.from(value.data[0], 'base64');
  if (b.length !== 165 || b[108] !== 1) throw new Error('Uninitialized or nonstandard token account');
  return { mint: base58Encode(b.subarray(0, 32)), owner: base58Encode(b.subarray(32, 64)), amount: b.readBigUInt64LE(64).toString() };
}
export function checkPool(pool, position, check) {
  const fee = decodeTimeFee(pool);
  check('DAMM v2: TRUEQ / wrapped SOL mints', pool.token_a_mint === METEORA.tokenA && pool.token_b_mint === METEORA.tokenB);
  check('DAMM v2: expected vaults', pool.token_a_vault === METEORA.vaultA && pool.token_b_vault === METEORA.vaultB);
  check('DAMM v2: expected creator', pool.creator === METEORA.creator);
  check('DAMM v2: activation is 2026-10-12 15:00 UTC timestamp', pool.activation_type === 1 && pool.activation_point === METEORA.activation);
  check('DAMM v2: enabled pool, no whitelisted pre-opening vault', pool.pool_status === 0 && pool.whitelisted_vault === '11111111111111111111111111111111');
  check('DAMM v2: linear fee, 300 one-second periods', fee.base_fee_mode === 0 && fee.number_of_period === 300 && fee.period_frequency === '1');
  check('DAMM v2: fee 10% -> 1%, reduction 0.03 percentage points/second', fee.cliff_fee_numerator === '100000000' && fee.reduction_factor === '300000' && feeNumeratorAfter(0, fee) === 100000000n && feeNumeratorAfter(300, fee) === 10000000n);
  check('DAMM v2: dynamic fee disabled', pool.pool_fees.dynamic_fee.initialized === 0);
  check('DAMM v2: fees collected only in token B (wSOL)', pool.collect_fee_mode === 1);
  check('DAMM v2: protocol share is 20% of trading fees', pool.pool_fees.protocol_fee_percent === 20);
  check('DAMM v2: position belongs to pool and NFT', position.pool === METEORA.pool && position.nft_mint === METEORA.nft);
  check('DAMM v2: no free or temporarily vested position liquidity', position.unlocked_liquidity === '0' && position.vested_liquidity === '0');
  check('DAMM v2: permanently locked position equals entire pool liquidity', BigInt(pool.liquidity) > 0n && position.permanent_locked_liquidity === pool.liquidity && pool.permanent_lock_liquidity === pool.liquidity, pool.liquidity);
  const initialPrice = Number(pool.pool_fees.init_sqrt_price) ** 2 / 2 ** 128 / 1000;
  check('DAMM v2: initial price 0.000179 SOL/TRUEQ', Math.abs(initialPrice - 0.000179) < 1e-15, initialPrice);
  check('DAMM v2: range begins at initial price', pool.sqrt_min_price === pool.pool_fees.init_sqrt_price);
  check('DAMM v2: range extends to protocol maximum', pool.sqrt_max_price === '79226673521066979257578248091');
  return { fee, initialPrice };
}
export function checkPoolCreation(tx, check) {
  check('Pool creation: requested successful transaction', tx?.transaction?.signatures?.[0] === METEORA.creation && tx.meta?.err === null);
  if (!tx?.transaction || tx.meta?.err !== null) throw new Error('Pool creation receipt missing or failed');
  const { keys, instructions } = flattenInstructions(tx);
  const signer = keys.slice(0, tx.transaction.message.header.numRequiredSignatures);
  check('Pool creation: creator signed', signer.includes(METEORA.creator));
  const initDef = idl.instructions.find(i => i.name === 'initialize_customizable_pool');
  const init = instructions.filter(i => i.program === METEORA.program && i.data.subarray(0, 8).equals(Buffer.from(initDef.discriminator)));
  check('Pool creation: exactly one DAMM v2 customizable pool initialization', init.length === 1 && init[0].accounts.includes(METEORA.pool) && init[0].accounts.includes(METEORA.position));
  const expectedAccounts = { creator: METEORA.creator, position_nft_mint: METEORA.nft, position_nft_account: METEORA.nftAccount, payer: METEORA.creator, pool: METEORA.pool, position: METEORA.position, token_a_mint: METEORA.tokenA, token_b_mint: METEORA.tokenB, token_a_vault: METEORA.vaultA, token_b_vault: METEORA.vaultB, token_a_program: METEORA.tokenProgram, token_b_program: METEORA.tokenProgram };
  check('Pool creation: initialization account bindings match', init.length === 1 && Object.entries(expectedAccounts).every(([name, address]) => init[0].accounts[initDef.accounts.findIndex(a => a.name === name)] === address));
  const lockDef = idl.instructions.find(i => i.name === 'permanent_lock_position');
  const locks = instructions.filter(i => i.program === METEORA.program && i.data.subarray(0, 8).equals(Buffer.from(lockDef.discriminator)));
  check('Pool creation: permanent lock instruction for this position', locks.length === 1 && locks[0].accounts.includes(METEORA.position) && locks[0].accounts.includes(METEORA.pool));
  let initParams = null, lockAmount = null;
  if (init.length === 1 && locks.length === 1) {
    const initReader = new Reader(init[0].data.subarray(8)), lockReader = new Reader(locks[0].data.subarray(8));
    initParams = decodeIdlType(initReader, initDef.args[0].type);
    lockAmount = decodeIdlType(lockReader, lockDef.args[0].type);
    if (initReader.offset !== initReader.data.length || lockReader.offset !== lockReader.data.length) throw new Error('Unexpected pool instruction size');
  }
  check('Pool creation: original liquidity locked in full', initParams !== null && lockAmount === initParams.liquidity && BigInt(lockAmount) > 0n);
  const balance = (list, account, mint) => list?.find(b => keys[b.accountIndex] === account && b.mint === mint)?.uiTokenAmount.amount;
  const a = balance(tx.meta.postTokenBalances, METEORA.vaultA, METEORA.tokenA), b = balance(tx.meta.postTokenBalances, METEORA.vaultB, METEORA.tokenB);
  check('Pool creation: 150,000 TRUEQ and 1 lamport of wSOL rounding dust', a === '150000000000' && b === '1');
  check('Pool creation predates scheduled activation', Number.isSafeInteger(tx.blockTime) && tx.blockTime < Number(METEORA.activation));
  return { slot: tx.slot, blockTime: tx.blockTime, initialTokenARaw: a, initialTokenBRaw: b, initParams, permanentLockLiquidity: lockAmount };
}
export async function verifyMeteora({ rpc, check, record, loadTransaction }) {
  if (!check('Meteora: official IDL matches pinned SHA-256 and program', idlSha256 === '7f5e5f5e9cab57cd208575dc53359676550e41ee0c19fc822560fe1062fd3ac5' && idl.address === METEORA.program)) throw new Error('Meteora IDL mismatch');
  const accounts = await rpc('getMultipleAccounts', [[METEORA.pool, METEORA.position, METEORA.vaultA, METEORA.vaultB], { commitment: 'finalized', encoding: 'base64' }]);
  const [p, pos, va, vb] = accounts.value;
  check('Pool and position owned by Meteora DAMM v2', p?.owner === METEORA.program && pos?.owner === METEORA.program && p.executable === false && pos.executable === false);
  if (!p || !pos) throw new Error('Pool or position not returned');
  const pool = decodeAccount(Buffer.from(p.data[0], 'base64'), 'Pool'), position = decodeAccount(Buffer.from(pos.data[0], 'base64'), 'Position');
  const parameters = checkPool(pool, position, check);
  const vaultA = tokenAccount(va), vaultB = tokenAccount(vb);
  check('Pool vault token accounts contain the correct mints and authority', vaultA.mint === METEORA.tokenA && vaultB.mint === METEORA.tokenB && vaultA.owner === 'HLnpSz9h2S4hiLQ43rnSD9XkcUThA7B8hQMKmDaiTLcC' && vaultA.owner === vaultB.owner);
  const tx = await loadTransaction(METEORA.creation), creation = checkPoolCreation(tx, check);
  await record('meteora-pool', { checkedAt: new Date().toISOString(), finalizedContextSlot: accounts.context.slot, poolAddress: METEORA.pool, positionAddress: METEORA.position, accounts, pool, position, ...parameters, vaultA, vaultB });
  await record('meteora-creation', { signature: METEORA.creation, transaction: tx, decoded: creation });
}

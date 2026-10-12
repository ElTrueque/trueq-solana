import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { checkPool, checkPoolCreation, decodeAccount, decodeTimeFee, feeNumeratorAfter, METEORA } from './meteora.mjs';
import { checkAirdrop, AIRDROP_RECEIPTS } from './airdrop.mjs';
import { base58Decode, base58Encode, findProgramAddress } from './lib.mjs';

const evidence = JSON.parse(await readFile(new URL('../evidence/meteora-pool.json', import.meta.url)));
const receipt = JSON.parse(await readFile(new URL('../evidence/meteora-creation.json', import.meta.url))).transaction;
const checks = callback => { const rows = []; callback((label, ok) => rows.push({ label, ok: ok === true })); return rows; };

test('Official IDL decodes both exact account layouts and live evidence passes', () => {
  const pool = decodeAccount(Buffer.from(evidence.accounts.value[0].data[0], 'base64'), 'Pool');
  const position = decodeAccount(Buffer.from(evidence.accounts.value[1].data[0], 'base64'), 'Position');
  assert.deepEqual(pool, evidence.pool); assert.deepEqual(position, evidence.position);
  assert.ok(checks(check => checkPool(pool, position, check)).every(x => x.ok));
});
test('Rejects truncated accounts, unexpected extension and wrong discriminator', () => {
  const bytes = Buffer.from(evidence.accounts.value[0].data[0], 'base64');
  assert.throws(() => decodeAccount(bytes.subarray(0, bytes.length - 1), 'Pool'));
  assert.throws(() => decodeAccount(Buffer.concat([bytes, Buffer.alloc(1)]), 'Pool'));
  const wrong = Buffer.from(bytes); wrong[0] ^= 1;
  assert.throws(() => decodeAccount(wrong, 'Pool'));
});
test('Fee schedule is 10%, 5.5%, 1% at 0,150,300 seconds and stays at 1%', () => {
  const fee = decodeTimeFee(evidence.pool);
  assert.equal(feeNumeratorAfter(0, fee), 100000000n);
  assert.equal(feeNumeratorAfter(150, fee), 55000000n);
  assert.equal(feeNumeratorAfter(300, fee), 10000000n);
  assert.equal(feeNumeratorAfter(1000, fee), 10000000n);
});
test('Wrong mints, activation, collection mode, dynamic fee and protocol fee are failures', () => {
  for (const mutate of [p => p.token_a_mint = METEORA.tokenB, p => p.activation_point = '1791817201', p => p.collect_fee_mode = 0, p => p.pool_fees.dynamic_fee.initialized = 1, p => p.pool_fees.protocol_fee_percent = 0]) {
    const pool = structuredClone(evidence.pool); mutate(pool);
    assert.ok(checks(c => checkPool(pool, evidence.position, c)).some(x => !x.ok));
  }
});
test('Partial lock, unlocked liquidity and incorrect NFT fail', () => {
  for (const mutate of [p => p.permanent_locked_liquidity = '1', p => p.unlocked_liquidity = '1', p => p.nft_mint = METEORA.nftAccount]) {
    const position = structuredClone(evidence.position); mutate(position);
    assert.ok(checks(c => checkPool(evidence.pool, position, c)).some(x => !x.ok));
  }
});
test('Creation receipt proves exact initial deposits and full lock', () => {
  assert.ok(checks(c => checkPoolCreation(receipt, c)).every(x => x.ok));
  const wrong = structuredClone(receipt); wrong.meta.postTokenBalances.find(x => x.mint === METEORA.tokenA && x.uiTokenAmount.amount === '150000000000').uiTokenAmount.amount = '149999999999';
  assert.ok(checks(c => checkPoolCreation(wrong, c)).some(x => !x.ok));
});
test('Failed pool creation and unrelated receipt are not accepted', () => {
  const failed = structuredClone(receipt); failed.meta.err = { InstructionError: [0, 'Custom'] };
  assert.throws(() => checkPoolCreation(failed, () => {}));
  const wrong = structuredClone(receipt); wrong.transaction.signatures[0] = 'another';
  assert.ok(checks(c => checkPoolCreation(wrong, c)).some(x => !x.ok));
});

// Entirely synthetic recipients: no real airdrop recipient is stored in tests.
const ATA = 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL';
const ata = owner => findProgramAddress([base58Decode(owner), base58Decode(METEORA.tokenProgram), base58Decode(METEORA.tokenA)], ATA).address;
function syntheticAirdrop() {
  let remain = 160000000700n;
  return [6, 5].map((count, batch) => {
    const keys = [METEORA.creator, ata(METEORA.creator), METEORA.tokenA, METEORA.tokenProgram];
    const instructions = [], postTokenBalances = [], preTokenBalances = [];
    let total = 0n;
    for (let n = 0; n < count; n++) {
      const owner = base58Encode(Buffer.alloc(32, 50 + batch * 6 + n)), destination = ata(owner);
      const amount = batch === 1 && n === 4 ? 999999995n : 900000000n;
      const data = Buffer.alloc(10); data[0] = 12; data.writeBigUInt64LE(amount, 1); data[9] = 6;
      const index = keys.push(destination) - 1;
      instructions.push({ programIdIndex: 3, accounts: [1, 2, index, 0], data: base58Encode(data) });
      postTokenBalances.push({ accountIndex: index, mint: METEORA.tokenA, owner, programId: METEORA.tokenProgram, uiTokenAmount: { amount: amount.toString(), decimals: 6 } }); total += amount;
    }
    const creatorBalance = amount => ({ accountIndex: 1, mint: METEORA.tokenA, owner: METEORA.creator, programId: METEORA.tokenProgram, uiTokenAmount: { amount: amount.toString(), decimals: 6 } });
    preTokenBalances.push(creatorBalance(remain)); remain -= total; postTokenBalances.push(creatorBalance(remain));
    return { slot: 455984925 + batch, blockTime: 1791794597 + batch, transaction: { signatures: [AIRDROP_RECEIPTS[batch]], message: { header: { numRequiredSignatures: 1 }, accountKeys: keys, instructions } }, meta: { err: null, preTokenBalances, postTokenBalances } };
  });
}
test('Airdrop aggregate verifier passes and never returns recipient addresses', () => {
  const txs = syntheticAirdrop(), rows = [];
  const summary = checkAirdrop(txs, (l, ok) => rows.push(ok)); assert.ok(rows.every(Boolean));
  assert.equal(summary.amountRaw, '9999999995'); assert.equal(summary.recipientCount, 11);
  for (const tx of txs) for (const b of tx.meta.postTokenBalances) if (b.owner !== METEORA.creator) assert.ok(!JSON.stringify(summary).includes(b.owner));
  assert.ok(!Object.hasOwn(summary, 'transactions'));
});
test('Airdrop rejects execution after opening, amount mismatch and escrow call', () => {
  for (const mutate of [ts => ts[0].blockTime = 1791817200, ts => ts[0].meta.postTokenBalances[0].uiTokenAmount.amount = '1', ts => ts[0].transaction.message.accountKeys[3] = METEORA.program]) {
    const txs = syntheticAirdrop(); mutate(txs); assert.ok(checks(c => checkAirdrop(txs, c)).some(x => !x.ok));
  }
});

// Read-only Jupiter Lock verification. Account field order is taken from the
// pinned official IDL in vendor/jup-lock-idl.json. The pinned upstream modes.ts
// linked in vendor/jup-lock-sources.json defines 0 as None.
import { readFileSync } from 'node:fs';
import { base58Decode, base58Encode, Reader, findProgramAddress, flattenInstructions, sha256 } from './lib.mjs';

export const JUPITER = Object.freeze({
  program: 'LocpQgucEQHbqNABEYvBvwoxCPsSbG91A1QaQhQQqjn',
  escrow: '4gKfvsvnjQoheN3wRAWcqUQderhfBajgcu7hh41Ho5vp',
  tokenAccount: 'DTLeW1SJMChaJNxQ2R44coYriXG87mvsSfRJDXPfoHBL',
  mint: '3m4etpgjNhFduBznEtQo56u5rKpXEgcYbZzV7ijdiq8W',
  creator: 'EBTS1qQjvfbxCXXcYAXbjVGjEYyGotUpuV98eTtBgtej',
  signature: 'SSLdZ5HAhqpUvzmJKZCfbWYTWTu69iS169ExcDARqPAwyg38yAZqpP3mXbUL3wTtjrfV5ApFQF95k6LotukpfsS',
  lockedRaw: '799999999300', amountPerPeriodRaw: '1095890410', numberOfPeriods: '730', frequency: '86400',
  cliff: '1799766000', firstDailyRelease: '2027-01-13T15:00:00.000Z', finalDailyRelease: '2029-01-11T15:00:00.000Z',
  lockUrl: 'https://lock.jup.ag/escrow/4gKfvsvnjQoheN3wRAWcqUQderhfBajgcu7hh41Ho5vp',
});
const TOKEN = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
const ATA = 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL';
const idlBytes = readFileSync(new URL('./vendor/jup-lock-idl.json', import.meta.url));
const IDL_SHA256 = '0c350e7420809a1d07645929ba0d84d1645b9c97bec3b043a83f605a0e9f6074';
const IDL = JSON.parse(idlBytes);
const accountSpec = IDL.accounts.find(x => x.name === 'VestingEscrow');
const structSpec = IDL.types.find(x => x.name === 'VestingEscrow');
const paramSpec = IDL.types.find(x => x.name === 'CreateVestingEscrowParameters');
const createSpec = IDL.instructions.find(x => x.name === 'create_vesting_escrow_v2');
const modeNames = ['None', 'Only creator', 'Only recipient', 'Creator or recipient'];
const iso = seconds => new Date(Number(BigInt(seconds) * 1000n)).toISOString();
const totalRaw = escrow => BigInt(escrow.cliff_unlock_amount) + BigInt(escrow.amount_per_period) * BigInt(escrow.number_of_period);

function readField(r, type) {
  if (type === 'pubkey') return r.key();
  if (type === 'u8') return r.u8();
  if (type === 'u64') return r.u64();
  if (type === 'u128') return BigInt(`0x${Buffer.from(r.bytes(16)).reverse().toString('hex')}`).toString();
  if (type?.array) return Array.from({ length: type.array[1] }, () => readField(r, type.array[0]));
  throw new Error('Unsupported field in pinned Jupiter IDL');
}
function readStruct(r, fields) { return Object.fromEntries(fields.map(f => [f.name, readField(r, f.type)])); }
function modeValidity(value) {
  if (!Number.isInteger(value) || value < 0 || value >= modeNames.length) throw new Error('Unknown Jupiter authorization mode');
}

export function decodeVestingEscrow(data) {
  const r = new Reader(data);
  if (!r.bytes(8).equals(Buffer.from(accountSpec.discriminator))) throw new Error('Invalid VestingEscrow discriminator');
  const value = readStruct(r, structSpec.type.fields);
  if (r.offset !== r.data.length) throw new Error('Unexpected VestingEscrow size');
  modeValidity(value.cancel_mode); modeValidity(value.update_recipient_mode);
  if (value.token_program_flag !== 0 && value.token_program_flag !== 1) throw new Error('Unknown Jupiter token program flag');
  if (BigInt(value.frequency) === 0n || BigInt(value.number_of_period) === 0n) throw new Error('Invalid vesting frequency/periods');
  if (BigInt(value.total_claimed_amount) > totalRaw(value)) throw new Error('Claimed amount exceeds scheduled amount');
  return value;
}

export function decodeCreateVestingEscrowV2(data) {
  const r = new Reader(data);
  if (!r.bytes(8).equals(Buffer.from(createSpec.discriminator))) throw new Error('Invalid CreateVestingEscrowV2 discriminator');
  const result = readStruct(r, paramSpec.type.fields);
  modeValidity(result.cancel_mode); modeValidity(result.update_recipient_mode);
  // TRUEQ is a standard SPL token. The historical creation passed Some with
  // an empty slices vector; None is equivalent and needs no remaining accounts.
  const remaining = r.u8();
  if (remaining > 1 || (remaining === 1 && r.u32() !== 0)) throw new Error('Unexpected remaining_accounts_info for TRUEQ');
  if (r.offset !== r.data.length) throw new Error('Unexpected CreateVestingEscrowV2 size');
  return result;
}

export function decodeEscrowToken(data) {
  const b = Buffer.from(data);
  if (b.length !== 165) throw new Error('Unexpected SPL Token account size');
  for (const offset of [72, 109, 129]) if (b.readUInt32LE(offset) > 1) throw new Error('Invalid SPL Token account COption');
  return { mint: base58Encode(b.subarray(0, 32)), owner: base58Encode(b.subarray(32, 64)), amount: b.readBigUInt64LE(64).toString(),
    delegate: b.readUInt32LE(72) ? base58Encode(b.subarray(76, 108)) : null, state: b[108],
    native: b.readUInt32LE(109) === 1, delegatedAmount: b.readBigUInt64LE(121).toString(),
    closeAuthority: b.readUInt32LE(129) ? base58Encode(b.subarray(133, 165)) : null };
}

export function analyzeJupiterCreation(tx, escrow) {
  if (!tx || !tx.meta || tx.meta.err !== null) throw new Error('Jupiter creation is missing or failed');
  if (tx.transaction.signatures[0] !== JUPITER.signature) throw new Error('Unexpected Jupiter transaction signature');
  const { keys, instructions } = flattenInstructions(tx);
  const creates = instructions.filter(ix => ix.location.startsWith('outer:') && ix.program === JUPITER.program && ix.data.subarray(0, 8).equals(Buffer.from(createSpec.discriminator)));
  if (creates.length !== 1) throw new Error('Expected exactly one Jupiter create instruction');
  const create = creates[0], args = decodeCreateVestingEscrowV2(create.data);
  const accounts = Object.fromEntries(createSpec.accounts.map((a, i) => [a.name, create.accounts[i]]));
  const required = { base: escrow.base, escrow: JUPITER.escrow, token_mint: JUPITER.mint, escrow_token: JUPITER.tokenAccount,
    sender: JUPITER.creator, recipient: JUPITER.creator, token_program: TOKEN, system_program: '11111111111111111111111111111111', program: JUPITER.program };
  const accountBindings = Object.entries(required).every(([k, v]) => accounts[k] === v);
  const signerKeys = keys.slice(0, tx.transaction.message.header.numRequiredSignatures);
  const signedByCreatorAndBase = signerKeys.includes(JUPITER.creator) && signerKeys.includes(escrow.base);
  const paramsMatchState = Object.keys(args).every(k => args[k] === escrow[k]);
  const outer = create.location.split(':')[1];
  const transfers = instructions.filter(ix => ix.location.startsWith(`inner:${outer}:`) && ix.program === TOKEN && ix.data.length === 10 && ix.data[0] === 12);
  const transfer = transfers.length === 1 ? transfers[0] : null;
  const transferMatches = !!transfer && transfer.accounts.length === 4 &&
    transfer.accounts[0] === accounts.sender_token && transfer.accounts[1] === JUPITER.mint &&
    transfer.accounts[2] === JUPITER.tokenAccount && transfer.accounts[3] === JUPITER.creator &&
    transfer.data[9] === 6 && transfer.data.readBigUInt64LE(1).toString() === JUPITER.lockedRaw;
  const pre = tx.meta.preTokenBalances ?? [], post = tx.meta.postTokenBalances ?? [];
  const getBalance = (list, address) => list.find(b => keys[b.accountIndex] === address && b.mint === JUPITER.mint);
  const preCreator = getBalance(pre, accounts.sender_token), postCreator = getBalance(post, accounts.sender_token);
  const preEscrow = getBalance(pre, JUPITER.tokenAccount), postEscrow = getBalance(post, JUPITER.tokenAccount);
  const balanceFields = [preCreator, postCreator, postEscrow].every(x => x && x.uiTokenAmount.decimals === 6 && x.programId === TOKEN);
  const historicalBalances = balanceFields && !preEscrow && preCreator.owner === JUPITER.creator && postCreator.owner === JUPITER.creator &&
    postEscrow.owner === JUPITER.escrow && preCreator.uiTokenAmount.amount === '960000000000' &&
    postCreator.uiTokenAmount.amount === '160000000700' && postEscrow.uiTokenAmount.amount === JUPITER.lockedRaw;
  return { slot: tx.slot, blockTime: tx.blockTime, createdAtUtc: iso(tx.blockTime), version: tx.version,
    instruction: createSpec.name, accountBindings, signedByCreatorAndBase, paramsMatchState, transferMatches, historicalBalances,
    parameters: args, tokenTransferRaw: transfer?.data.readBigUInt64LE(1).toString() ?? null,
    creatorBalanceImmediatelyAfterRaw: postCreator?.uiTokenAmount.amount ?? null,
    note: 'Creator balance is historical at this receipt, not a promise about the current wallet balance.' };
}

export async function verifyJupiter({ rpc, check, record = async () => {}, loadTransaction }) {
  const idlIntact = sha256(idlBytes).toString('hex') === IDL_SHA256;
  check('Jupiter: official IDL matches its pinned SHA-256', idlIntact);
  if (!idlIntact) throw new Error('Jupiter IDL checksum mismatch');
  check('Jupiter: pinned IDL identifies the official program', IDL.address === JUPITER.program);
  const response = await rpc('getMultipleAccounts', [[JUPITER.escrow, JUPITER.tokenAccount], { encoding: 'base64', commitment: 'finalized' }]);
  await record('jupiter-accounts', response);
  const [escrowAccount, tokenAccount] = response?.value ?? [];
  const accountOwners = escrowAccount?.owner === JUPITER.program && !escrowAccount.executable && tokenAccount?.owner === TOKEN && !tokenAccount.executable;
  check('Jupiter: escrow and token account program owners', accountOwners);
  if (!accountOwners) throw new Error('Unexpected Jupiter account owner or missing account');
  const escrow = decodeVestingEscrow(Buffer.from(escrowAccount.data[0], 'base64'));
  const token = decodeEscrowToken(Buffer.from(tokenAccount.data[0], 'base64'));
  check('Jupiter: mint, creator and recipient', escrow.token_mint === JUPITER.mint && escrow.creator === JUPITER.creator && escrow.recipient === JUPITER.creator);
  const pda = findProgramAddress([Buffer.from('escrow'), base58Decode(escrow.base)], JUPITER.program);
  check('Jupiter: escrow PDA and bump', pda.address === JUPITER.escrow && pda.bump === escrow.escrow_bump);
  const ata = findProgramAddress([base58Decode(JUPITER.escrow), base58Decode(TOKEN), base58Decode(JUPITER.mint)], ATA);
  check('Jupiter: escrow token ATA and authority', ata.address === JUPITER.tokenAccount && token.mint === JUPITER.mint && token.owner === JUPITER.escrow);
  check('Jupiter: token account initialized without delegate/close authority', token.state === 1 && token.delegate === null && token.closeAuthority === null && !token.native && token.delegatedAmount === '0' && escrow.token_program_flag === 0);
  check('Jupiter: no cancellation and no recipient changes', escrow.cancel_mode === 0 && escrow.update_recipient_mode === 0 && escrow.cancelled_at === '0', { cancelMode: modeNames[escrow.cancel_mode], updateRecipientMode: modeNames[escrow.update_recipient_mode] });
  const scheduleMatches = escrow.cliff_time === JUPITER.cliff && escrow.vesting_start_time === JUPITER.cliff && escrow.cliff_unlock_amount === '0' &&
    escrow.frequency === JUPITER.frequency && escrow.amount_per_period === JUPITER.amountPerPeriodRaw && escrow.number_of_period === JUPITER.numberOfPeriods;
  check('Jupiter: exact cliff and 730 daily release parameters', scheduleMatches);
  const total = totalRaw(escrow), remaining = total - BigInt(escrow.total_claimed_amount);
  check('Jupiter: original scheduled amount = 799,999.9993 TRUEQ', total.toString() === JUPITER.lockedRaw);
  const firstRelease = iso(BigInt(escrow.cliff_time) + BigInt(escrow.frequency));
  const lastRelease = iso(BigInt(escrow.cliff_time) + BigInt(escrow.frequency) * BigInt(escrow.number_of_period));
  check('Jupiter: first release Jan 13 2027 and final release Jan 11 2029 at 15:00 UTC', firstRelease === JUPITER.firstDailyRelease && lastRelease === JUPITER.finalDailyRelease);
  // Claims legitimately reduce the current balance; unsolicited deposits can
  // increase it. Require full backing of everything still owed by the schedule.
  check('Jupiter: current balance covers all scheduled tokens not yet claimed', BigInt(token.amount) >= remaining, { balanceRaw: token.amount, claimedRaw: escrow.total_claimed_amount, remainingRaw: remaining.toString() });
  check('Jupiter: rounding remainder is 0.0007 TRUEQ', 800000000000n - total === 700n);
  const transaction = await loadTransaction(JUPITER.signature);
  const receipt = analyzeJupiterCreation(transaction, escrow);
  for (const [label, result] of [
    ['Jupiter receipt: expected instruction accounts', receipt.accountBindings],
    ['Jupiter receipt: signed by creator and escrow base', receipt.signedByCreatorAndBase],
    ['Jupiter receipt: creation parameters match current escrow', receipt.paramsMatchState],
    ['Jupiter receipt: SPL TransferChecked of 799,999.9993 TRUEQ', receipt.transferMatches],
    ['Jupiter receipt: escrow deposit and creator balance after vesting', receipt.historicalBalances],
  ]) check(label, result);
  const decoded = { program: JUPITER.program, escrow: JUPITER.escrow, tokenAccount: JUPITER.tokenAccount,
    observedAccountSlot: response.context.slot, idlSha256: sha256(idlBytes).toString('hex'), ...escrow,
    cancelModeMeaning: modeNames[escrow.cancel_mode], updateRecipientModeMeaning: modeNames[escrow.update_recipient_mode],
    cliffUtc: iso(escrow.cliff_time), firstReleaseUtc: firstRelease, finalReleaseUtc: lastRelease, originalScheduledAmountRaw: total.toString(),
    tokenAccountCurrent: token, remainingScheduledAmountRaw: remaining.toString(), extraDepositsRaw: (BigInt(token.amount) - remaining).toString(),
    originalAllocationTargetRaw: '800000000000', roundingRemainderRaw: '700', receipt, lockUrl: JUPITER.lockUrl };
  await record('jupiter-decoded', decoded);
  return decoded;
}

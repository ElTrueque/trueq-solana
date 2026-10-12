import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { base58Decode, base58Encode } from './lib.mjs';
import { JUPITER, decodeVestingEscrow, decodeCreateVestingEscrowV2, decodeEscrowToken, analyzeJupiterCreation, verifyJupiter } from './jupiter.mjs';

const read = path => JSON.parse(readFileSync(new URL(path, import.meta.url)));
const accounts = read('../evidence/jupiter-accounts-rpc.json').result;
const transaction = read('../evidence/jupiter-creation-rpc.json').result;
const escrowBytes = Buffer.from(accounts.value[0].data[0], 'base64');
const tokenBytes = Buffer.from(accounts.value[1].data[0], 'base64');
const creationBytes = base58Decode(transaction.transaction.message.instructions[2].data);
const escrow = decodeVestingEscrow(escrowBytes);
const copy = x => structuredClone(x);

test('Jupiter: pinned IDL decodes the real 296-byte escrow and exact daily schedule', () => {
  assert.equal(escrowBytes.length, 296);
  assert.equal(escrow.token_mint, JUPITER.mint);
  assert.equal(escrow.recipient, JUPITER.creator);
  assert.equal(escrow.cancel_mode, 0);
  assert.equal(escrow.update_recipient_mode, 0);
  assert.equal(escrow.cliff_time, '1799766000');
  assert.equal(escrow.frequency, '86400');
  assert.equal(escrow.amount_per_period, '1095890410');
  assert.equal(escrow.number_of_period, '730');
  assert.equal(decodeEscrowToken(tokenBytes).amount, '799999999300');
  assert.deepEqual(decodeCreateVestingEscrowV2(creationBytes), {
    vesting_start_time: '1799766000', cliff_time: '1799766000', frequency: '86400', cliff_unlock_amount: '0',
    amount_per_period: '1095890410', number_of_period: '730', update_recipient_mode: 0, cancel_mode: 0,
  });
});

test('Jupiter: corrupt discriminator, size, modes and impossible accounting are rejected', () => {
  for (const n of [0, 7, 135, 168, 295]) assert.throws(() => decodeVestingEscrow(escrowBytes.subarray(0, n)));
  assert.throws(() => decodeVestingEscrow(Buffer.concat([escrowBytes, Buffer.from([0])])));
  for (const change of [b => b[0] ^= 1, b => b[137] = 4, b => b[138] = 255, b => b[139] = 3,
    b => b.writeBigUInt64LE(0n, 152), b => b.writeBigUInt64LE(800000000000n, 184)]) {
    const b = Buffer.from(escrowBytes); change(b); assert.throws(() => decodeVestingEscrow(b));
  }
  const ix = Buffer.from(creationBytes); ix[0] ^= 1; assert.throws(() => decodeCreateVestingEscrowV2(ix));
  const remaining = Buffer.from(creationBytes); remaining[remaining.length - 1] = 1;
  assert.throws(() => decodeCreateVestingEscrowV2(remaining));
  assert.throws(() => decodeEscrowToken(tokenBytes.subarray(0, 164)));
  const token = Buffer.from(tokenBytes); token.writeUInt32LE(2, 72); assert.throws(() => decodeEscrowToken(token));
});

test('Jupiter receipt: correct receipt passes; wrong amount, destination, signer or signature does not', () => {
  const good = analyzeJupiterCreation(transaction, escrow);
  for (const property of ['accountBindings', 'signedByCreatorAndBase', 'paramsMatchState', 'transferMatches', 'historicalBalances']) assert.equal(good[property], true, property);
  assert.equal(good.creatorBalanceImmediatelyAfterRaw, '160000000700');
  const wrongAmount = copy(transaction);
  const transfer = wrongAmount.meta.innerInstructions.find(x => x.index === 2).instructions[1];
  const data = base58Decode(transfer.data); data.writeBigUInt64LE(1n, 1); transfer.data = base58Encode(data);
  assert.equal(analyzeJupiterCreation(wrongAmount, escrow).transferMatches, false);
  const wrongDestination = copy(transaction); wrongDestination.transaction.message.instructions[2].accounts[3] = 3;
  assert.equal(analyzeJupiterCreation(wrongDestination, escrow).accountBindings, false);
  const noBaseSignature = copy(transaction); noBaseSignature.transaction.message.header.numRequiredSignatures = 1;
  assert.equal(analyzeJupiterCreation(noBaseSignature, escrow).signedByCreatorAndBase, false);
  const failed = copy(transaction); failed.meta.err = { InstructionError: [2, 'Custom'] };
  assert.throws(() => analyzeJupiterCreation(failed, escrow));
  const wrongSignature = copy(transaction); wrongSignature.transaction.signatures[0] = 'incorrect';
  assert.throws(() => analyzeJupiterCreation(wrongSignature, escrow));
});

test('Jupiter full verifier accepts real receipt and accounts, without any write RPC', async () => {
  const checks = [], calls = [];
  await verifyJupiter({ rpc: async (method, params) => { calls.push(method); assert.equal(method, 'getMultipleAccounts'); assert.equal(params[1].commitment, 'finalized'); return accounts; },
    check: (label, pass) => checks.push({ label, pass }), loadTransaction: async signature => { assert.equal(signature, JUPITER.signature); return transaction; } });
  assert.equal(calls.length, 1);
  assert.ok(checks.length >= 15);
  assert.deepEqual(checks.filter(x => !x.pass), []);
});

test('Jupiter current balance follows claims and allows surplus; an underfunded escrow fails', async () => {
  const changed = copy(accounts), b = Buffer.from(escrowBytes), t = Buffer.from(tokenBytes);
  const claimed = 1095890410n; b.writeBigUInt64LE(claimed, 184); t.writeBigUInt64LE(799999999300n - claimed, 64);
  changed.value[0].data[0] = b.toString('base64'); changed.value[1].data[0] = t.toString('base64');
  const run = async () => { const checks = []; await verifyJupiter({ rpc: async () => changed, check: (label, pass) => checks.push({ label, pass }), loadTransaction: async () => transaction }); return checks; };
  assert.deepEqual((await run()).filter(x => !x.pass), []);
  t.writeBigUInt64LE(799999999300n - claimed + 99n, 64); changed.value[1].data[0] = t.toString('base64');
  assert.deepEqual((await run()).filter(x => !x.pass), []);
  t.writeBigUInt64LE(799999999300n - claimed - 1n, 64); changed.value[1].data[0] = t.toString('base64');
  assert.deepEqual((await run()).filter(x => !x.pass).map(x => x.label), ['Jupiter: current balance covers all scheduled tokens not yet claimed']);
});

test('Jupiter owner mismatch and recipient changes cannot be reported as valid', async () => {
  const changed = copy(accounts); changed.value[0].owner = JUPITER.creator; const failures = [];
  await assert.rejects(() => verifyJupiter({ rpc: async () => changed, check: (l, pass) => { if (!pass) failures.push(l); }, loadTransaction: async () => transaction }));
  assert.equal(failures.length, 1);
  const b = Buffer.from(escrowBytes); b[8] ^= 1; const altered = copy(accounts); altered.value[0].data[0] = b.toString('base64');
  const checks = []; await verifyJupiter({ rpc: async () => altered, check: (l, pass) => checks.push({ l, pass }), loadTransaction: async () => transaction });
  assert.equal(checks.find(x => x.l === 'Jupiter: mint, creator and recipient').pass, false);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { base58Decode, base58Encode, sha256, rawCidSha256, decodeMint, flattenInstructions, makeRpc } from './lib.mjs';
import { EXPECTED, metadataAddress, creatorTokenAccount, verifyCreation, verifyBurn } from './verify.mjs';

const creation = JSON.parse(await readFile(new URL('../evidence/creation.json', import.meta.url))).transaction;
const burn = JSON.parse(await readFile(new URL('../evidence/burn.json', import.meta.url))).transaction;
const copy = object => structuredClone(object);
function inspect(fn, value) { const checks = []; fn(value, (label, ok) => checks.push({ label, ok })); return checks; }
function mutateToken(tx, tag, mutate) {
  const ix = tx.transaction.message.instructions.find(ix => base58Decode(ix.data)[0] === tag && tx.transaction.message.accountKeys[ix.programIdIndex] === EXPECTED.tokenProgram);
  ix.data = base58Encode(mutate(Buffer.from(base58Decode(ix.data))));
}
test('base58 round trips, including zero padding and invalid input', () => {
  for (const b of [Buffer.alloc(32), Buffer.from([0, 0, 5, 255]), base58Decode(EXPECTED.mint)]) assert.deepEqual(base58Decode(base58Encode(b)), b);
  assert.throws(() => base58Decode('0bad'));
});
test('metadata and associated token PDA agree with on-chain receipt', () => {
  assert.equal(metadataAddress, 'DgsVYg3v9negh4eGEEDAcmbkn927qBiQxsqFvat1JYbB');
  assert.equal(creatorTokenAccount, 'Dgjb2C1Ae1K7i5YCbnSTB85pLAbngfUNbpzACyxjvpbK');
  assert.ok(flattenInstructions(creation).keys.includes(metadataAddress));
});
test('CID binds exact metadata bytes, including whitespace', async () => {
  const bytes = await readFile(new URL('../metadata/trueq-solana-metadata.json', import.meta.url));
  assert.ok(rawCidSha256(EXPECTED.metadataCid).equals(sha256(bytes)));
  assert.ok(!rawCidSha256(EXPECTED.metadataCid).equals(sha256(Buffer.concat([bytes, Buffer.from('\n')]))));
  assert.throws(() => rawCidSha256('QmInvalid'));
});
test('SPL mint decoder rejects wrong layout and malformed authority option', () => {
  assert.throws(() => decodeMint(Buffer.alloc(81)));
  const b = Buffer.alloc(82); b.writeUInt32LE(2); assert.throws(() => decodeMint(b));
});
test('RPC wrapper forbids transaction submission, simulation and funding', async () => {
  const rpc = makeRpc('http://127.0.0.1:1');
  for (const method of ['sendTransaction', 'sendRawTransaction', 'requestAirdrop', 'simulateTransaction']) await assert.rejects(rpc(method, []), /not read-only allowlisted/);
});
test('finalized creation and burn receipts satisfy all semantic checks', () => {
  for (const row of [...inspect(verifyCreation, creation), ...inspect(verifyBurn, burn)]) assert.equal(row.ok, true, row.label);
});
test('a different mint amount is rejected', () => {
  const tx = copy(creation); mutateToken(tx, 7, b => { b.writeBigUInt64LE(999n, 1); return b; });
  assert.ok(inspect(verifyCreation, tx).some(c => !c.ok && c.label.includes('minted')));
});
test('a retained mint authority is rejected', () => {
  const tx = copy(creation); mutateToken(tx, 6, b => Buffer.concat([Buffer.from([b[0], b[1], 1]), base58Decode(EXPECTED.creator)]));
  assert.ok(inspect(verifyCreation, tx).some(c => !c.ok && c.label.includes('revoked')));
});
test('a freeze authority at initialization is rejected', () => {
  const tx = copy(creation); mutateToken(tx, 20, b => Buffer.concat([b.subarray(0, 34), Buffer.from([1]), base58Decode(EXPECTED.creator)]));
  assert.ok(inspect(verifyCreation, tx).some(c => !c.ok && c.label.includes('InitializeMint2')));
});
test('mutable metadata at creation is rejected', () => {
  const tx = copy(creation); const ix = tx.transaction.message.instructions.find(ix => tx.transaction.message.accountKeys[ix.programIdIndex] === EXPECTED.metadataProgram);
  const bytes = base58Decode(ix.data); bytes[bytes.length - 2] = 1; ix.data = base58Encode(bytes);
  assert.ok(inspect(verifyCreation, tx).some(c => !c.ok && c.label.includes('Immutable metadata')));
});
test('extra outer instruction is rejected', () => {
  const tx = copy(creation); tx.transaction.message.instructions.push(copy(tx.transaction.message.instructions[5]));
  assert.ok(inspect(verifyCreation, tx).some(c => !c.ok && c.label.includes('six documented')));
});
test('incorrect burned amount and failed execution are rejected', () => {
  const tx = copy(burn); mutateToken(tx, 15, b => { b.writeBigUInt64LE(1n, 1); return b; }); tx.meta.err = { InstructionError: [0, 'Custom'] };
  const rows = inspect(verifyBurn, tx);
  assert.ok(rows.some(c => !c.ok && c.label.includes('BurnChecked')));
  assert.ok(rows.some(c => !c.ok && c.label.includes('successful execution')));
});
test('missing or wrong receipt is not accepted', () => {
  const checks = []; assert.throws(() => verifyCreation(null, (label, ok) => checks.push({ label, ok })));
  assert.ok(checks.some(c => !c.ok));
  const tx = copy(burn); tx.transaction.signatures[0] = EXPECTED.creation;
  assert.ok(inspect(verifyBurn, tx).some(c => !c.ok && c.label.includes('requested transaction')));
});

import { createHash } from 'node:crypto';

const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
export const sha256 = data => createHash('sha256').update(data).digest();
export function base58Decode(text) {
  if (typeof text !== 'string' || !text.length) throw new Error('Invalid base58');
  let n = 0n;
  for (const c of text) { const d = ALPHABET.indexOf(c); if (d < 0) throw new Error('Invalid base58'); n = n * 58n + BigInt(d); }
  let hex = n.toString(16); if (hex.length % 2) hex = `0${hex}`;
  const payload = n === 0n ? Buffer.alloc(0) : Buffer.from(hex, 'hex');
  let zeros = 0; while (text[zeros] === '1') zeros++;
  return Buffer.concat([Buffer.alloc(zeros), payload]);
}
export function base58Encode(bytes) {
  const b = Buffer.from(bytes); let n = b.length ? BigInt(`0x${b.toString('hex')}`) : 0n; let out = '';
  while (n) { out = ALPHABET[Number(n % 58n)] + out; n /= 58n; }
  let z = 0; while (z < b.length && b[z] === 0) z++;
  return '1'.repeat(z) + out;
}
const P = (1n << 255n) - 19n;
const mod = n => ((n % P) + P) % P;
function pow(a, e) { let r = 1n; for (a = mod(a); e; e >>= 1n, a = mod(a * a)) if (e & 1n) r = mod(r * a); return r; }
const D = mod(-121665n * pow(121666n, P - 2n));
export function isEd25519Point(bytes) {
  if (bytes.length !== 32) return false;
  const copy = Buffer.from(bytes), sign = copy[31] >> 7; copy[31] &= 127;
  const y = BigInt(`0x${Buffer.from(copy).reverse().toString('hex')}`);
  if (y >= P) return false;
  const y2 = mod(y * y), denominator = mod(D * y2 + 1n);
  if (denominator === 0n) return false;
  const x2 = mod((y2 - 1n) * pow(denominator, P - 2n));
  if (x2 === 0n) return sign === 0;
  return pow(x2, (P - 1n) / 2n) === 1n;
}
export function findProgramAddress(seeds, program) {
  const id = base58Decode(program); if (id.length !== 32 || seeds.some(s => s.length > 32)) throw new Error('Invalid PDA seeds');
  for (let bump = 255; bump >= 0; bump--) {
    const hash = sha256(Buffer.concat([...seeds.map(Buffer.from), Buffer.from([bump]), id, Buffer.from('ProgramDerivedAddress')]));
    if (!isEd25519Point(hash)) return { address: base58Encode(hash), bump };
  }
  throw new Error('No PDA bump');
}
export class Reader {
  constructor(data) { this.data = Buffer.from(data); this.offset = 0; }
  bytes(n) { if (n < 0 || this.offset + n > this.data.length) throw new Error('Truncated Borsh data'); const r = this.data.subarray(this.offset, this.offset + n); this.offset += n; return r; }
  u8() { return this.bytes(1)[0]; }
  bool() { const b = this.u8(); if (b > 1) throw new Error('Invalid boolean'); return b === 1; }
  u16() { return this.bytes(2).readUInt16LE(); }
  u32() { return this.bytes(4).readUInt32LE(); }
  u64() { return this.bytes(8).readBigUInt64LE().toString(); }
  key() { return base58Encode(this.bytes(32)); }
  string() { return this.bytes(this.u32()).toString('utf8').replace(/\0+$/g, ''); }
  option(read) { const v = this.u8(); if (v > 1) throw new Error('Invalid option'); return v ? read() : null; }
}
export function decodeMetadataData(reader) {
  return {
    name: reader.string(), symbol: reader.string(), uri: reader.string(), sellerFeeBasisPoints: reader.u16(),
    creators: reader.option(() => Array.from({ length: reader.u32() }, () => ({ address: reader.key(), verified: reader.bool(), share: reader.u8() }))),
  };
}
export function decodeMetadata(bytes) {
  const r = new Reader(bytes);
  const key = r.u8(), updateAuthority = r.key(), mint = r.key(), data = decodeMetadataData(r);
  return { key, updateAuthority, mint, ...data, primarySaleHappened: r.bool(), isMutable: r.bool() };
}
export function decodeCreateMetadataV3(bytes) {
  const r = new Reader(bytes); if (r.u8() !== 33) throw new Error('Not CreateMetadataAccountV3');
  const data = decodeMetadataData(r);
  const collection = r.option(() => ({ verified: r.bool(), key: r.key() }));
  const uses = r.option(() => ({ useMethod: r.u8(), remaining: r.u64(), total: r.u64() }));
  const isMutable = r.bool();
  const collectionDetails = r.option(() => ({ variant: r.u8(), size: r.u64() }));
  if (r.offset !== r.data.length) throw new Error('Unexpected CreateMetadataAccountV3 bytes');
  return { ...data, collection, uses, isMutable, collectionDetails };
}
export function decodeMint(bytes) {
  const b = Buffer.from(bytes); if (b.length !== 82) throw new Error('Not an SPL Token mint');
  const authority = offset => { const flag = b.readUInt32LE(offset); if (flag > 1) throw new Error('Invalid mint COption'); return flag ? base58Encode(b.subarray(offset + 4, offset + 36)) : null; };
  return { mintAuthority: authority(0), supply: b.readBigUInt64LE(36).toString(), decimals: b[44], isInitialized: b[45] === 1, freezeAuthority: authority(46) };
}
export function flattenInstructions(tx) {
  const keys = [...tx.transaction.message.accountKeys, ...(tx.meta?.loadedAddresses?.writable ?? []), ...(tx.meta?.loadedAddresses?.readonly ?? [])].map(k => typeof k === 'string' ? k : k.pubkey);
  const one = (ix, location) => { if (!Number.isInteger(ix.programIdIndex) || !keys[ix.programIdIndex]) throw new Error('Invalid instruction program index'); return { program: keys[ix.programIdIndex], accounts: ix.accounts.map(i => { if (!keys[i]) throw new Error('Invalid instruction account index'); return keys[i]; }), data: ix.data ? base58Decode(ix.data) : Buffer.alloc(0), location }; };
  const result = [];
  tx.transaction.message.instructions.forEach((ix, i) => {
    result.push(one(ix, `outer:${i}`));
    for (const inner of (tx.meta?.innerInstructions ?? []).filter(v => v.index === i)) inner.instructions.forEach((x, j) => result.push(one(x, `inner:${i}:${j}`)));
  });
  return { keys, instructions: result };
}
export function rawCidSha256(cid) {
  if (!cid.startsWith('b')) throw new Error('Expected base32 CIDv1');
  const alphabet = 'abcdefghijklmnopqrstuvwxyz234567'; let bits = 0, value = 0; const out = [];
  for (const c of cid.slice(1)) { const n = alphabet.indexOf(c); if (n < 0) throw new Error('Invalid base32 CID'); value = (value << 5) | n; bits += 5; while (bits >= 8) { bits -= 8; out.push((value >> bits) & 255); } }
  if (bits && (value & ((1 << bits) - 1))) throw new Error('Invalid CID trailing bits');
  const b = Buffer.from(out);
  if (b.length !== 36 || !b.subarray(0, 4).equals(Buffer.from([1, 0x55, 0x12, 0x20]))) throw new Error('Expected CIDv1 / raw / sha2-256 / 32 bytes');
  return b.subarray(4);
}
export function decodeTokenInstruction(ix) {
  const b = ix.data, tag = b[0];
  if (tag === 20) { if (b.length !== 35 && b.length !== 67) throw new Error('Invalid InitializeMint2'); const option = b[34]; if (option > 1 || b.length !== (option ? 67 : 35)) throw new Error('Invalid freeze option'); return { kind: 'InitializeMint2', decimals: b[1], authority: base58Encode(b.subarray(2, 34)), freezeAuthority: option ? base58Encode(b.subarray(35)) : null }; }
  if (tag === 7) { if (b.length !== 9) throw new Error('Invalid MintTo'); return { kind: 'MintTo', amount: b.readBigUInt64LE(1).toString() }; }
  if (tag === 6) { if (b.length !== 3 && b.length !== 35) throw new Error('Invalid SetAuthority'); const option = b[2]; if (option > 1 || b.length !== (option ? 35 : 3)) throw new Error('Invalid authority option'); return { kind: 'SetAuthority', authorityType: b[1], newAuthority: option ? base58Encode(b.subarray(3)) : null }; }
  if (tag === 15) { if (b.length !== 10) throw new Error('Invalid BurnChecked'); return { kind: 'BurnChecked', amount: b.readBigUInt64LE(1).toString(), decimals: b[9] }; }
  return { kind: `Token instruction ${tag}` };
}
export const READ_ONLY_RPC_METHODS = new Set(['getAccountInfo', 'getMultipleAccounts', 'getTransaction', 'getSignatureStatuses', 'getSlot', 'getGenesisHash']);
export function makeRpc(endpoint = 'https://api.mainnet-beta.solana.com') {
  const url = new URL(endpoint); if (!['https:', 'http:'].includes(url.protocol)) throw new Error('RPC must be HTTP(S)');
  let id = 0;
  return async (method, params) => {
    if (!READ_ONLY_RPC_METHODS.has(method)) throw new Error(`RPC method is not read-only allowlisted: ${method}`);
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const response = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: ++id, method, params }), signal: AbortSignal.timeout(30_000) });
        if ([429, 502, 503, 504].includes(response.status) && attempt < 4) { await new Promise(r => setTimeout(r, 1500 * (attempt + 1))); continue; }
        if (!response.ok) throw new Error(`RPC ${method} HTTP ${response.status}`);
        const body = await response.json();
        if (body.error) throw new Error(`RPC ${method} error code ${body.error.code}`);
        if (!Object.hasOwn(body, 'result')) throw new Error(`RPC ${method} missing result`);
        return body.result;
      } catch (e) { if (attempt < 4 && ['TypeError', 'TimeoutError'].includes(e.name)) { await new Promise(r => setTimeout(r, 1500 * (attempt + 1))); continue; } throw new Error(`RPC ${method} failed: ${e.message.replace(/https?:\/\/\S+/g, '[endpoint]')}`); }
    }
  };
}

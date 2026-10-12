import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve } from 'node:path';
import { base58Decode, findProgramAddress, sha256, rawCidSha256, decodeMint, decodeMetadata, decodeCreateMetadataV3, decodeTokenInstruction, flattenInstructions, makeRpc } from './lib.mjs';

export const EXPECTED = Object.freeze({
  mint: '3m4etpgjNhFduBznEtQo56u5rKpXEgcYbZzV7ijdiq8W',
  creator: 'EBTS1qQjvfbxCXXcYAXbjVGjEYyGotUpuV98eTtBgtej',
  tokenProgram: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
  metadataProgram: 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
  associatedTokenProgram: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
  name: 'el-trueque.com', symbol: 'TRUEQ',
  metadataCid: 'bafkreieli2cx46ryv6evklow6ks2fwr6vig47qlm5mbzm7fnwc2gl5ndbq',
  uri: 'https://ipfs.io/ipfs/bafkreieli2cx46ryv6evklow6ks2fwr6vig47qlm5mbzm7fnwc2gl5ndbq',
  imageCid: 'bafybeihbhqcpnlgrkrtoir5xepsokhqbuuafina7fwx5isttoj7yth5cha',
  creation: '23xF9gJfbjjUDvVnspKLbHxGsZzZWPzQyBuSyVqaTRDE3XmQL8hYDxADPZaub7iPG2Lvw4mTup6Q5gNjJ9JzdHBr',
  burn: '4xMth4F4kb1DzmgTLDFobpUFUzEzeFhnDE71TnrcazpwURDJAaoEaGNnr5R4aazYfYAknW8EGptCtbPsdn7kN8PU',
  originalSupply: '1000000000000', burnAmount: '40000000000', supply: '960000000000', decimals: 6,
  genesisHash: '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d',
});
export const metadataAddress = findProgramAddress([Buffer.from('metadata'), base58Decode(EXPECTED.metadataProgram), base58Decode(EXPECTED.mint)], EXPECTED.metadataProgram).address;
export const creatorTokenAccount = findProgramAddress([base58Decode(EXPECTED.creator), base58Decode(EXPECTED.tokenProgram), base58Decode(EXPECTED.mint)], EXPECTED.associatedTokenProgram).address;

function tokenBalance(tx, direction, account) {
  const { keys } = flattenInstructions(tx), index = keys.indexOf(account);
  const matches = (tx.meta?.[`${direction}TokenBalances`] ?? []).filter(b => b.accountIndex === index && b.mint === EXPECTED.mint);
  if (matches.length !== 1) throw new Error(`Missing or duplicate ${direction} token balance`);
  return matches[0];
}
export function verifyTransactionBasics(tx, signature, check) {
  check(`${signature.slice(0, 8)}: receipt exists`, tx !== null && typeof tx === 'object');
  if (!tx) throw new Error('Transaction not returned by finalized RPC');
  check(`${signature.slice(0, 8)}: requested transaction`, tx.transaction?.signatures?.[0] === signature);
  check(`${signature.slice(0, 8)}: successful execution`, tx.meta !== null && tx.meta?.err === null);
  check(`${signature.slice(0, 8)}: positive confirmed slot`, Number.isSafeInteger(tx.slot) && tx.slot > 0);
}
export function verifyCreation(tx, check) {
  verifyTransactionBasics(tx, EXPECTED.creation, check);
  const { keys, instructions } = flattenInstructions(tx);
  const signers = keys.slice(0, tx.transaction.message.header.numRequiredSignatures);
  check('Creation signed by creator and mint', signers.includes(EXPECTED.creator) && signers.includes(EXPECTED.mint));
  const outer = instructions.filter(ix => ix.location.startsWith('outer:'));
  check('Creation has the six documented outer instructions', outer.length === 6 && outer.map(ix => ix.program).join(',') === ['11111111111111111111111111111111', EXPECTED.tokenProgram, EXPECTED.metadataProgram, EXPECTED.associatedTokenProgram, EXPECTED.tokenProgram, EXPECTED.tokenProgram].join(','));
  const token = outer.filter(ix => ix.program === EXPECTED.tokenProgram).map(ix => ({ ...ix, decoded: decodeTokenInstruction(ix) }));
  const init = token.filter(ix => ix.decoded.kind === 'InitializeMint2' && ix.accounts[0] === EXPECTED.mint);
  check('Exactly one InitializeMint2: 6 decimals, creator authority, no freeze', init.length === 1 && init[0].decoded.decimals === 6 && init[0].decoded.authority === EXPECTED.creator && init[0].decoded.freezeAuthority === null);
  const minted = token.filter(ix => ix.decoded.kind === 'MintTo');
  check('Exactly 1,000,000 TRUEQ minted to creator ATA', minted.length === 1 && minted[0].accounts[0] === EXPECTED.mint && minted[0].accounts[1] === creatorTokenAccount && minted[0].accounts[2] === EXPECTED.creator && minted[0].decoded.amount === EXPECTED.originalSupply);
  const revoked = token.filter(ix => ix.decoded.kind === 'SetAuthority');
  check('Mint authority revoked in creation', revoked.length === 1 && revoked[0].accounts[0] === EXPECTED.mint && revoked[0].accounts[1] === EXPECTED.creator && revoked[0].decoded.authorityType === 0 && revoked[0].decoded.newAuthority === null);
  check('MintTo precedes revocation', minted.length === 1 && revoked.length === 1 && outer.indexOf(outer.find(ix => ix.location === minted[0].location)) < outer.indexOf(outer.find(ix => ix.location === revoked[0].location)));
  const system = outer.filter(ix => ix.program === '11111111111111111111111111111111' && ix.data.length === 52 && ix.data.readUInt32LE() === 0 && ix.accounts[1] === EXPECTED.mint);
  check('Mint account allocated to official SPL Token program', system.length === 1 && system[0].accounts[0] === EXPECTED.creator && system[0].data.readBigUInt64LE(12) === 82n && system[0].data.subarray(20).equals(base58Decode(EXPECTED.tokenProgram)));
  const ata = outer.filter(ix => ix.program === EXPECTED.associatedTokenProgram && ix.accounts[1] === creatorTokenAccount);
  check('Creator associated token account created', ata.length === 1 && ata[0].accounts[0] === EXPECTED.creator && ata[0].accounts[2] === EXPECTED.creator && ata[0].accounts[3] === EXPECTED.mint && ata[0].accounts[5] === EXPECTED.tokenProgram);
  const metadata = outer.filter(ix => ix.program === EXPECTED.metadataProgram && ix.data[0] === 33);
  let metadataDecoded = null;
  if (metadata.length === 1) metadataDecoded = decodeCreateMetadataV3(metadata[0].data);
  check('Immutable metadata created in same transaction', metadata.length === 1 && metadata[0].accounts[0] === metadataAddress && metadata[0].accounts[1] === EXPECTED.mint && metadata[0].accounts[2] === EXPECTED.creator && metadata[0].accounts[3] === EXPECTED.creator && metadataDecoded?.name === EXPECTED.name && metadataDecoded?.symbol === EXPECTED.symbol && metadataDecoded?.uri === EXPECTED.uri && metadataDecoded?.isMutable === false);
  const post = tokenBalance(tx, 'post', creatorTokenAccount);
  check('Creation balance effect: creator holds 1,000,000 TRUEQ', post.owner === EXPECTED.creator && post.programId === EXPECTED.tokenProgram && post.uiTokenAmount.decimals === 6 && post.uiTokenAmount.amount === EXPECTED.originalSupply);
  return { slot: tx.slot, blockTime: tx.blockTime, signers, creatorTokenAccount, metadataAddress, tokenInstructions: token.map(ix => ({ location: ix.location, accounts: ix.accounts, ...ix.decoded })), metadataInstruction: metadataDecoded };
}
export function verifyBurn(tx, check) {
  verifyTransactionBasics(tx, EXPECTED.burn, check);
  const { keys, instructions } = flattenInstructions(tx);
  const signer = keys.slice(0, tx.transaction.message.header.numRequiredSignatures);
  check('Burn signed by creator', signer.includes(EXPECTED.creator));
  const burns = instructions.filter(ix => ix.program === EXPECTED.tokenProgram && ix.data[0] === 15).map(ix => ({ ...ix, decoded: decodeTokenInstruction(ix) }));
  check('BurnChecked: exactly 40,000 TRUEQ, 6 decimals', burns.length === 1 && burns[0].accounts[0] === creatorTokenAccount && burns[0].accounts[1] === EXPECTED.mint && burns[0].accounts[2] === EXPECTED.creator && burns[0].decoded.amount === EXPECTED.burnAmount && burns[0].decoded.decimals === 6);
  const pre = tokenBalance(tx, 'pre', creatorTokenAccount), post = tokenBalance(tx, 'post', creatorTokenAccount);
  check('Burn balance effect: 1,000,000 -> 960,000 TRUEQ', pre.uiTokenAmount.amount === EXPECTED.originalSupply && post.uiTokenAmount.amount === EXPECTED.supply && pre.owner === EXPECTED.creator && post.owner === EXPECTED.creator && BigInt(pre.uiTokenAmount.amount) - BigInt(post.uiTokenAmount.amount) === BigInt(EXPECTED.burnAmount));
  return { slot: tx.slot, blockTime: tx.blockTime, creatorTokenAccount, before: pre.uiTokenAmount.amount, after: post.uiTokenAmount.amount, burned: EXPECTED.burnAmount, instructions: burns.map(ix => ({ location: ix.location, accounts: ix.accounts, ...ix.decoded })) };
}

export async function main(argv = process.argv.slice(2)) {
  const allowed = new Set(['--write-evidence', '--help']);
  if (argv.some(arg => !allowed.has(arg))) throw new Error('Usage: node verify/verify.mjs [--write-evidence]');
  if (argv.includes('--help')) { console.log('Read-only Solana mainnet verification. Node 20+. node verify/verify.mjs [--write-evidence]. Optional SOLANA_RPC_URL replaces the public RPC; never printed or saved. No signing or sending code.'); return 0; }
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const checks = [];
  const check = (label, ok, details) => { const row = { label, ok: ok === true, ...(details === undefined ? {} : { details }) }; checks.push(row); console.log(`${row.ok ? 'OK' : 'FALLA'} | ${label}${details === undefined ? '' : ` | ${typeof details === 'string' ? details : JSON.stringify(details)}`}`); return row.ok; };
  const record = async (name, value) => { if (!/^[a-zA-Z0-9_-]+$/.test(name)) throw new Error('Invalid evidence name'); if (argv.includes('--write-evidence')) { await mkdir(resolve(root, 'evidence'), { recursive: true }); await writeFile(resolve(root, 'evidence', `${name}.json`), JSON.stringify(value, null, 2) + '\n'); } };
  const rpc = makeRpc(process.env.SOLANA_RPC_URL);
  const loadTransaction = signature => rpc('getTransaction', [signature, { commitment: 'finalized', encoding: 'json', maxSupportedTransactionVersion: 1 }]);
  const section = async (label, fn) => { try { await fn(); } catch (error) { check(label, false, error.message); } };
  const startedAt = new Date().toISOString();
  await section('Mainnet identity and live mint', async () => {
    const genesisHash = await rpc('getGenesisHash', []);
    if (!check('Solana mainnet genesis hash', genesisHash === EXPECTED.genesisHash, genesisHash)) throw new Error('Wrong network');
    const result = await rpc('getAccountInfo', [EXPECTED.mint, { commitment: 'finalized', encoding: 'base64' }]);
    if (!result?.value) throw new Error('Mint account absent');
    const mint = decodeMint(Buffer.from(result.value.data[0], 'base64'));
    check('Mint owned by official SPL Token program', result.value.owner === EXPECTED.tokenProgram && result.value.executable === false);
    check('Mint initialized with 6 decimals', mint.isInitialized && mint.decimals === 6);
    check('No mint authority', mint.mintAuthority === null);
    check('No freeze authority', mint.freezeAuthority === null);
    check('Current supply: 960,000 TRUEQ', mint.supply === EXPECTED.supply, mint.supply);
    await record('mint', { checkedAt: new Date().toISOString(), address: EXPECTED.mint, finalizedContextSlot: result.context.slot, account: result.value, decoded: mint });
  });
  await section('Metaplex metadata', async () => {
    const result = await rpc('getAccountInfo', [metadataAddress, { commitment: 'finalized', encoding: 'base64' }]);
    if (!result?.value) throw new Error('Metadata account absent');
    const metadata = decodeMetadata(Buffer.from(result.value.data[0], 'base64'));
    check('Metadata account: expected PDA and Metaplex owner', result.value.owner === EXPECTED.metadataProgram && result.value.executable === false && metadata.key === 4 && metadata.mint === EXPECTED.mint, metadataAddress);
    check('Metadata name and symbol', metadata.name === EXPECTED.name && metadata.symbol === EXPECTED.symbol);
    check('Metadata URI matches published raw CID', metadata.uri === EXPECTED.uri);
    check('Metadata is immutable', metadata.isMutable === false);
    await record('metadata-account', { checkedAt: new Date().toISOString(), address: metadataAddress, finalizedContextSlot: result.context.slot, account: result.value, decoded: metadata });
  });
  await section('Metadata file and IPFS', async () => {
    const local = await readFile(resolve(root, 'metadata/trueq-solana-metadata.json'));
    const digest = sha256(local), expectedDigest = rawCidSha256(EXPECTED.metadataCid);
    check('Metadata file: 815 bytes', local.length === 815);
    check('Metadata CIDv1 raw SHA-256 matches exact local bytes', digest.equals(expectedDigest), digest.toString('hex'));
    const data = JSON.parse(local);
    check('Metadata JSON name and symbol', data.name === EXPECTED.name && data.symbol === EXPECTED.symbol);
    check('Metadata image uses the specified IPFS CID', typeof data.image === 'string' && (data.image === `ipfs://${EXPECTED.imageCid}` || data.image === `https://ipfs.io/ipfs/${EXPECTED.imageCid}`));
    const attempts = []; let remote = null, gateway = null;
    for (const url of [EXPECTED.uri, `https://gateway.pinata.cloud/ipfs/${EXPECTED.metadataCid}`, `https://ipfs.filebase.io/ipfs/${EXPECTED.metadataCid}`]) {
      try {
        const response = await fetch(url, { signal: AbortSignal.timeout(20_000) });
        attempts.push({ gateway: new URL(url).hostname, httpStatus: response.status });
        if (!response.ok) continue;
        if (Number(response.headers.get('content-length')) > 1_000_000) throw new Error('Oversized metadata response');
        remote = Buffer.from(await response.arrayBuffer()); gateway = new URL(url).hostname; break;
      } catch (error) { attempts.push({ gateway: new URL(url).hostname, error: error.name }); }
    }
    check('IPFS metadata bytes equal the included file', remote !== null && remote.equals(local), remote === null ? 'No public gateway available; local CID check is independent' : gateway);
    await record('metadata-cid', { checkedAt: new Date().toISOString(), cid: EXPECTED.metadataCid, codec: 'raw', multihash: 'sha2-256', size: local.length, sha256: digest.toString('hex'), gateway, gatewayBytesEqual: remote?.equals(local) ?? false, attempts });
  });
  await section('Creation receipt and instructions', async () => { const tx = await loadTransaction(EXPECTED.creation); const decoded = verifyCreation(tx, check); await record('creation', { signature: EXPECTED.creation, transaction: tx, decoded }); });
  await section('Burn receipt and instructions', async () => { const tx = await loadTransaction(EXPECTED.burn); const decoded = verifyBurn(tx, check); await record('burn', { signature: EXPECTED.burn, transaction: tx, decoded }); });
  await section('Jupiter Lock escrow', async () => { const { verifyJupiter } = await import('./jupiter.mjs'); await verifyJupiter({ rpc, check, record, loadTransaction }); });
  await section('Meteora DAMM v2 pool and permanent lock', async () => { const { verifyMeteora } = await import('./meteora.mjs'); await verifyMeteora({ rpc, check, record, loadTransaction }); });
  await section('Direct airdrop receipts (aggregate only)', async () => { const { verifyAirdrop } = await import('./airdrop.mjs'); await verifyAirdrop({ check, record, loadTransaction }); });
  const summary = { startedAt, finishedAt: new Date().toISOString(), commitment: 'finalized', readOnly: true, checks, passed: checks.filter(c => c.ok).length, failed: checks.filter(c => !c.ok).length };
  await record('verification', summary);
  console.log(`\n${summary.failed === 0 ? 'OK' : 'FALLA'} | ${summary.passed} passed; ${summary.failed} failed.`);
  return summary.failed ? 1 : 0;
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().then(code => { process.exitCode = code; }).catch(error => { console.error(`FALLA | ${error.message}`); process.exitCode = 1; });
}

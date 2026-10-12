// TRUEQ on Solana: the exact instructions the console signs with Phantom. Shared by the Node simulation and the browser page.
// Plain SPL Token program (no Token-2022), 6 decimals, no freeze authority, Metaplex metadata created immutable (is_mutable =
// false), 1,000,000 TRUEQ minted to the creator and the mint authority revoked in the same transaction.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory;
  else root.TrueqBuilders = factory;
})(typeof self !== 'undefined' ? self : this, function (web3) {
  const {PublicKey, SystemProgram, TransactionInstruction} = web3;
  const TOKEN = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
  const ATA_PROGRAM = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');
  const METADATA = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');
  const RENT = new PublicKey('SysvarRent111111111111111111111111111111111');
  const DECIMALS = 6, SUPPLY = 1000000n * 10n ** 6n, BURN = 40000n * 10n ** 6n;
  const NAME = 'el-trueque.com', SYMBOL = 'TRUEQ';

  const u8 = n => Uint8Array.of(n);
  const u16 = n => { const b = new Uint8Array(2); new DataView(b.buffer).setUint16(0, n, true); return b; };
  const u32 = n => { const b = new Uint8Array(4); new DataView(b.buffer).setUint32(0, n, true); return b; };
  const u64 = n => { const b = new Uint8Array(8); new DataView(b.buffer).setBigUint64(0, BigInt(n), true); return b; };
  const str = s => { const b = new TextEncoder().encode(s); return concat(u32(b.length), b); };
  function concat(...parts) { const out = new Uint8Array(parts.reduce((a, p) => a + p.length, 0)); let o = 0; for (const p of parts) { out.set(p, o); o += p.length; } return out; }
  const meta = (pubkey, isSigner, isWritable) => ({pubkey, isSigner, isWritable});

  const ata = (owner, mint) => PublicKey.findProgramAddressSync([owner.toBuffer(), TOKEN.toBuffer(), mint.toBuffer()], ATA_PROGRAM)[0];
  const metadataPda = mint => PublicKey.findProgramAddressSync([new TextEncoder().encode('metadata'), METADATA.toBuffer(), mint.toBuffer()], METADATA)[0];

  function validateUri(uri) {
    if (!/^https:\/\/ipfs\.io\/ipfs\/(bafk[a-z2-7]{50,60}|Qm[1-9A-HJ-NP-Za-km-z]{44})$/.test(uri)) throw Error('URI must be https://ipfs.io/ipfs/<CID>');
    if (new TextEncoder().encode(uri).length > 200) throw Error('URI too long');
    return uri;
  }

  // Instruction list of the creation transaction. `rentMint` is the rent-exempt minimum for an 82-byte mint account.
  function createTokenInstructions({payer, mint, uri, rentMint}) {
    validateUri(uri);
    const owner = payer, ownerAta = ata(owner, mint), md = metadataPda(mint);
    return [
      SystemProgram.createAccount({fromPubkey: payer, newAccountPubkey: mint, lamports: rentMint, space: 82, programId: TOKEN}),
      // InitializeMint2: decimals, mint authority = creator, freeze authority = None.
      new TransactionInstruction({programId: TOKEN, keys: [meta(mint, false, true)], data: concat(u8(20), u8(DECIMALS), owner.toBytes(), u8(0))}),
      // Metaplex CreateMetadataAccountV3: name, symbol, uri, 0% royalty, no creators/collection/uses, is_mutable = false.
      new TransactionInstruction({programId: METADATA, keys: [
        meta(md, false, true), meta(mint, false, false), meta(owner, true, false), meta(payer, true, true),
        meta(owner, true, false), meta(SystemProgram.programId, false, false), meta(RENT, false, false)],
        data: concat(u8(33), str(NAME), str(SYMBOL), str(uri), u16(0), u8(0), u8(0), u8(0), u8(0), u8(0))}),
      // Associated token account of the creator (idempotent).
      new TransactionInstruction({programId: ATA_PROGRAM, keys: [
        meta(payer, true, true), meta(ownerAta, false, true), meta(owner, false, false), meta(mint, false, false),
        meta(SystemProgram.programId, false, false), meta(TOKEN, false, false)], data: u8(1)}),
      // MintTo 1,000,000 TRUEQ.
      new TransactionInstruction({programId: TOKEN, keys: [meta(mint, false, true), meta(ownerAta, false, true), meta(owner, true, false)], data: concat(u8(7), u64(SUPPLY))}),
      // SetAuthority(MintTokens -> None): nobody can ever mint again.
      new TransactionInstruction({programId: TOKEN, keys: [meta(mint, false, true), meta(owner, true, false)], data: concat(u8(6), u8(0), u8(0))})
    ];
  }

  // BurnChecked 40,000 TRUEQ from the creator's account (the supply drops to 960,000).
  function burnInstruction({owner, mint}) {
    return new TransactionInstruction({programId: TOKEN, keys: [meta(ata(owner, mint), false, true), meta(mint, false, true), meta(owner, true, false)], data: concat(u8(15), u64(BURN), u8(DECIMALS))});
  }

  return {TOKEN, METADATA, ATA_PROGRAM, DECIMALS, SUPPLY, BURN, NAME, SYMBOL, ata, metadataPda, validateUri, createTokenInstructions, burnInstruction};
});

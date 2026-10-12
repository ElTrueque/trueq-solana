# Historical creation console / Consola histórica de creación

## English

These are the **four original files**, preserved byte for byte from the owner's `trueq-consola.zip` (SHA-256 `16e1cfa6c30ce2003c33b24f06b20949a5a5418acec1c32428adb3cba8f2d4a0`). Their individual digests are in [SHA256SUMS](SHA256SUMS).

This directory records the local page supplied by the owner as the page used to create and burn TRUEQ. The source and the on-chain receipts are separate evidence: matching the transaction instructions can verify what happened on-chain, but a receipt alone cannot prove which browser page the signer opened.

**This is historical signing software, not the read-only verifier.** Its buttons can request Phantom signatures and send transactions. It does not need to be opened or executed to verify the existing token. Use the repository's `verify/` script for read-only checks. In particular, do not repeat creation or burning on the assumption that these buttons are harmless verification steps.

| File | Role |
| --- | --- |
| `index.html` | Spanish local interface; connects to the expected public creator address in Phantom; simulates, requests signatures and checks transaction status. |
| `trueq-builders.js` | Builds the explicit creation and burn instructions described below. |
| `serve.mjs` | Serves only the four allowed files on `127.0.0.1:8787`; it is not an RPC proxy. |
| `web3.iife.min.js` | Original IIFE distribution from `@solana/web3.js` version **1.98.0**. |

### Creation transaction

`createTokenInstructions` returns these six instructions in this order:

1. System Program `CreateAccount`: fund and allocate an **82-byte mint** owned by the original SPL Token program, `TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA`.
2. SPL Token `InitializeMint2`: **6 decimals**, creator as initial mint authority, **no freeze authority**.
3. Metaplex `CreateMetadataAccountV3`: name **el-trueque.com**, symbol **TRUEQ**, the documented IPFS URI, zero seller fee basis points, no creators/collection/uses, and **`is_mutable = false`**. The metadata update-authority field is the creator; immutable metadata must not be confused with an empty update-authority field.
4. Associated Token Program: idempotently create the creator's associated token account.
5. SPL Token `MintTo`: **1,000,000 TRUEQ** (`1,000,000,000,000` base units) into that account.
6. SPL Token `SetAuthority`: revoke the **mint authority**, setting it to `None` in the same transaction.

The page generates a mint keypair in browser memory and signs the new mint-account creation with it. Phantom signs as the creator/payer. No mint private key, wallet private key, recovery phrase or keystore is embedded in the supplied files. Only the public mint address is written to local storage.

### Burn transaction

`burnInstruction` builds one SPL Token **`BurnChecked`** instruction for **40,000 TRUEQ** (`40,000,000,000` base units), with 6 decimals, from the creator's associated token account. The intended remaining supply is **960,000 TRUEQ**. This was a separate Phantom-signed transaction. The receipt and the mint's current supply are checked independently by `verify/`.

The console does **not** create a Jupiter vesting escrow, a Meteora pool, a liquidity lock or an airdrop. Those operations need their own public receipts and checks.

### Dependency provenance and publication review

The vendored library is compared byte for byte with both:

- [npm's version 1.98.0 tarball](https://registry.npmjs.org/@solana/web3.js/-/web3.js-1.98.0.tgz), file `package/lib/index.iife.min.js`;
- [jsDelivr's version 1.98.0 IIFE](https://cdn.jsdelivr.net/npm/@solana/web3.js@1.98.0/lib/index.iife.min.js).

The upstream license is preserved as [web3-LICENSE](web3-LICENSE). The hashes, timestamp, upstream comparisons and scoped safety checks are recorded in [console-audit.json](../evidence/console-audit.json). The only RPC address in the first-party console is the keyless public endpoint `https://solana-rpc.publicnode.com`. The historical files are not modified to change their UI, behavior or wording.

## Español

Estos son los **cuatro archivos originales**, conservados byte por byte del ZIP entregado por el dueño. Sus huellas individuales están en [SHA256SUMS](SHA256SUMS). Se publica la página que el dueño identifica como la utilizada; un recibo permite comprobar las instrucciones ejecutadas, pero por sí solo no demuestra qué página abrió el firmante.

**Es una consola histórica que firma y envía operaciones, no el verificador de solo lectura.** No hace falta abrirla ni ejecutarla para comprobar TRUEQ. Usa el script de `verify/`; no repitas la creación o la quema para verificar el token existente.

La creación reúne seis instrucciones en una transacción: crear la cuenta SPL de 82 bytes; inicializar el mint con 6 decimales y sin congelamiento; crear los metadatos inmutables; crear de forma idempotente la cuenta del creador; acuñar 1.000.000 TRUEQ; y revocar la autoridad de acuñación. El campo de autoridad de actualización de los metadatos contiene al creador, pero `is_mutable = false`: la inmutabilidad no significa que dicho campo esté vacío.

La quema es otra transacción, con una instrucción `BurnChecked` de 40.000 TRUEQ; deja 960.000 TRUEQ de supply. Phantom firma por el creador. La clave del mint nuevo se genera en memoria durante la creación; no se incluye ninguna clave en estos archivos. El almacenamiento local guarda únicamente la dirección pública del mint.

La consola no crea el vesting de Jupiter, la pool de Meteora, el bloqueo de liquidez ni el airdrop. Sus recibos y verificaciones son independientes. El servidor es local, solo expone los cuatro archivos permitidos y no actúa como proxy RPC.

La biblioteca incluida corresponde a `@solana/web3.js` **1.98.0** y se compara con npm y jsDelivr. La licencia del proveedor se conserva en `web3-LICENSE`; la evidencia de comparación y revisión está en `evidence/console-audit.json`. Los cuatro originales se publican sin cambiar su código ni sus textos.

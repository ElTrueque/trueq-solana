# TRUEQ on Solana

[Español](README.es.md)

Public launch record for **el-trueque.com (TRUEQ)** on Solana mainnet. This repository contains the original token-creation console, the exact metadata JSON, transaction receipts, and a read-only verifier.

**TRUEQ has no custom token contract to verify.** Its mint belongs to the official SPL Token program, `TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA`. The original console called that program and Metaplex Token Metadata; the vesting uses Jupiter Lock. This repository does not deploy a new program.

## Launch record

The initial mint was **1,000,000 TRUEQ**, with **6 decimals**. A subsequent `BurnChecked` instruction burned **40,000 TRUEQ**, leaving **960,000 TRUEQ** at the recorded verification. Both mint authority and freeze authority are absent. Metaplex metadata is immutable.

| Allocation | Share of initial supply | Record |
| --- | ---: | --- |
| Vesting | 80% / 800,000 TRUEQ target | **799,999.9993 TRUEQ** deposited into Jupiter Lock; **0.0007 TRUEQ** rounding remainder stayed with the creator |
| Meteora pool | 15% / 150,000 TRUEQ | **Pending** — pool receipt and address will be added after execution |
| Burn | 4% / 40,000 TRUEQ | **Executed**, separate on-chain burn receipt below |
| NFT-holder airdrop | 1% / 10,000 TRUEQ | **Pending** — distribution and lock receipts will be added later |

Percentages refer to the **original 1,000,000**, not the post-burn supply. Immediately after the vesting deposit, the creator held **160,000.0007 TRUEQ**: the planned pool and airdrop allocations plus the rounding remainder. That is a historical balance, not a guarantee of the wallet's current balance.

## Addresses and receipts

| Item | Address / transaction |
| --- | --- |
| TRUEQ mint | [`3m4etpgjNhFduBznEtQo56u5rKpXEgcYbZzV7ijdiq8W`](https://solscan.io/token/3m4etpgjNhFduBznEtQo56u5rKpXEgcYbZzV7ijdiq8W) |
| Creator / vesting recipient | [`EBTS1qQjvfbxCXXcYAXbjVGjEYyGotUpuV98eTtBgtej`](https://solscan.io/account/EBTS1qQjvfbxCXXcYAXbjVGjEYyGotUpuV98eTtBgtej) |
| SPL Token program | [`TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA`](https://solscan.io/account/TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA) |
| Creation transaction | [`23xF9g…JzdHBr`](https://solscan.io/tx/23xF9gJfbjjUDvVnspKLbHxGsZzZWPzQyBuSyVqaTRDE3XmQL8hYDxADPZaub7iPG2Lvw4mTup6Q5gNjJ9JzdHBr) |
| Burn transaction | [`4xMth4…N8PU`](https://solscan.io/tx/4xMth4F4kb1DzmgTLDFobpUFUzEzeFhnDE71TnrcazpwURDJAaoEaGNnr5R4aazYfYAknW8EGptCtbPsdn7kN8PU) |
| Jupiter Lock program | [`LocpQgucEQHbqNABEYvBvwoxCPsSbG91A1QaQhQQqjn`](https://solscan.io/account/LocpQgucEQHbqNABEYvBvwoxCPsSbG91A1QaQhQQqjn) |
| Vesting escrow | [`4gKfvsvnjQoheN3wRAWcqUQderhfBajgcu7hh41Ho5vp`](https://solscan.io/account/4gKfvsvnjQoheN3wRAWcqUQderhfBajgcu7hh41Ho5vp) · [Jupiter Lock](https://lock.jup.ag/escrow/4gKfvsvnjQoheN3wRAWcqUQderhfBajgcu7hh41Ho5vp) |
| Escrow token account | [`DTLeW1SJMChaJNxQ2R44coYriXG87mvsSfRJDXPfoHBL`](https://solscan.io/account/DTLeW1SJMChaJNxQ2R44coYriXG87mvsSfRJDXPfoHBL) |
| Vesting transaction | [`SSLdZ5…kpfsS`](https://solscan.io/tx/SSLdZ5HAhqpUvzmJKZCfbWYTWTu69iS169ExcDARqPAwyg38yAZqpP3mXbUL3wTtjrfV5ApFQF95k6LotukpfsS) |

## Vesting schedule

- No release at the cliff: **2027-01-12 15:00 UTC**.
- **1,095.89041 TRUEQ per day**, 730 daily periods; first release **2027-01-13 15:00 UTC**, final scheduled release **2029-01-11 15:00 UTC**.
- Total scheduled amount: **799,999.9993 TRUEQ** (`799999999300` base units).
- Recipient: the creator wallet listed above.
- Cancellation and recipient changes are disabled according to the escrow modes and the public Jupiter Lock IDL/source included with the verifier.

The verifier checks the actual account data and receipt, rather than treating this description or the Lock UI as proof. A claimed balance can change later; the original deposited allocation and schedule remain separate historical facts.

## Exact metadata and console

- Name: `el-trueque.com`; symbol: `TRUEQ`.
- Metadata URI: [`https://ipfs.io/ipfs/bafkreieli2cx46ryv6evklow6ks2fwr6vig47qlm5mbzm7fnwc2gl5ndbq`](https://ipfs.io/ipfs/bafkreieli2cx46ryv6evklow6ks2fwr6vig47qlm5mbzm7fnwc2gl5ndbq).
- Image CID: [`bafybeihbhqcpnlgrkrtoir5xepsokhqbuuafina7fwx5isttoj7yth5cha`](https://ipfs.io/ipfs/bafybeihbhqcpnlgrkrtoir5xepsokhqbuuafina7fwx5isttoj7yth5cha).
- [`metadata/trueq-solana-metadata.json`](metadata/trueq-solana-metadata.json) preserves all **815 bytes**, including whitespace and the original description. Its SHA-256 is `8b46857e7a38af89552dd6f2a5a2da3eaa0dcfc16ceb03967cadb0b465f5a30c`; the verifier compares it with the raw SHA-256 CID.
- [`console/`](console/) preserves the four original console files byte for byte. The owner's original ZIP SHA-256 is `16e1cfa6c30ce2003c33b24f06b20949a5a5418acec1c32428adb3cba8f2d4a0`. See its file checksums and instruction explanation.

The console is an archive of a transaction-building application that requested signatures from Phantom. **It is not the read-only verifier.** No wallet is needed for the verification command below. A receipt proves what executed on-chain; it cannot independently prove which browser application a signer used. The console's provenance is the owner's supplied archive, with its exact hashes preserved.

## Verify independently

See [`verify/`](verify/) for the read-only program and pinned Jupiter Lock decoding references. Run from the repository root using Node.js 22 or later:

```sh
node verify/verify.mjs
```

To run the local positive and negative tests: `node --test`. To refresh the dated evidence files: `node verify/verify.mjs --write-evidence`. No dependencies need installing. The pre-publication run on **2026-10-12** passed **53 checks**; all **19 local tests** passed.

Each check prints `OK` or `FALLA`; a failed check produces a nonzero exit status. Only public, read-only Solana RPC methods and public IPFS requests are used. The verifier does not load keys, connect a wallet, sign or submit transactions. RPC or gateway errors must not be interpreted as successful checks.

The recorded public evidence is in [`evidence/`](evidence/). It is a dated RPC snapshot, not a replacement for running the verifier or an independent audit of SPL Token, Metaplex or Jupiter Lock. Later burns or vesting claims can change balances/supply; compare the historical receipts and report any current-state differences instead of rewriting the original record.

## Pending launch steps

The following are **plans, not completed operations certified by this commit**:

1. Meteora DAMM v2: 150,000 TRUEQ, single-sided against SOL, intended starting price USD 0.02 per TRUEQ, opening **2026-10-12 15:00 UTC**, opening fee decreasing from 50% to 1% over the first hour, fees in SOL only, and permanently locked liquidity. Pool address, exact parameters and lock receipts will be added in a later commit.
2. Airdrop: 10,000 TRUEQ to 11 NFT-holder wallets after opening, with a lock. Recipient addresses and execution receipts are deliberately not included yet.

The original immutable metadata mentions allocations and policies. That wording does not replace the missing pool or airdrop receipts. Future transactions will be documented separately. This record does not change the website, bots, Fast Launch program or any other contract.

# TRUEQ on Solana

[Español](README.es.md)

Public launch record for **el-trueque.com (TRUEQ)** on Solana mainnet. This repository contains the original token-creation console, the exact metadata JSON, transaction receipts, and a read-only verifier.

**TRUEQ has no custom token contract to verify.** Its mint belongs to the official SPL Token program, `TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA`. The original console called that program and Metaplex Token Metadata; the vesting uses Jupiter Lock. This repository does not deploy a new program.

## Launch record

The initial mint was **1,000,000 TRUEQ**, with **6 decimals**. A subsequent `BurnChecked` instruction burned **40,000 TRUEQ**, leaving **960,000 TRUEQ** at the recorded verification. Both mint authority and freeze authority are absent. Metaplex metadata is immutable.

| Allocation | Share of initial supply | Record |
| --- | ---: | --- |
| Vesting | 80% / 800,000 TRUEQ target | **799,999.9993 TRUEQ** deposited into Jupiter Lock; **0.0007 TRUEQ** rounding remainder stayed with the creator |
| Meteora pool | 15% / 150,000 TRUEQ | **Created**, with all original liquidity permanently locked; scheduled opening **2026-10-12 15:00 UTC** |
| Burn | 4% / 40,000 TRUEQ | **Executed**, separate on-chain burn receipt below |
| NFT-holder airdrop | 1% / 10,000 TRUEQ target | **9,999.999995 TRUEQ sent directly to 11 wallets before opening, without a lock**; two public receipts below |

Percentages refer to the **original 1,000,000**, not the post-burn supply. Immediately after the vesting deposit, the creator held **160,000.0007 TRUEQ**: the planned pool and airdrop allocations plus the rounding remainder. That is a historical balance, not a guarantee of the wallet's current balance.

After the direct airdrop and pool creation, the creator's recorded balance was **0.000705 TRUEQ**: 0.0007 from vesting rounding and 0.000005 from airdrop rounding. The updated record replaces the earlier launch plans: the actual opening fee is **10% to 1% over five minutes**, and the airdrop was sent **before opening without a lock**.

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
| DAMM v2 program | [`cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG`](https://solscan.io/account/cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG) |
| TRUEQ / SOL pool | [`7wtmy7VHBzU6pmG3K8EB25mrsyTYEBfGRBgefBAEXakt`](https://solscan.io/account/7wtmy7VHBzU6pmG3K8EB25mrsyTYEBfGRBgefBAEXakt) · [Meteora](https://www.meteora.ag/dammv2/7wtmy7VHBzU6pmG3K8EB25mrsyTYEBfGRBgefBAEXakt) |
| Pool creation and permanent lock | [`V1W9Sz…upu1ig`](https://solscan.io/tx/V1W9SzR9vLUXepxGtJYzqSi1VPpKQVs3Uj1jrXZMcZLKrkV5vNHUA3874Mni38Me2XA3pVcKFsm1Lxupbupu1ig) |
| Permanently locked position | [`A7yHQXA9bu6tKxM259rVX4cYiqF5M7qGtPrY2Lzg9FpQ`](https://solscan.io/account/A7yHQXA9bu6tKxM259rVX4cYiqF5M7qGtPrY2Lzg9FpQ) |
| Position NFT mint | [`HEQATttj2drSJs1L7jYdA6X8jFh57opNrGqpX6eKkZ9w`](https://solscan.io/token/HEQATttj2drSJs1L7jYdA6X8jFh57opNrGqpX6eKkZ9w) |
| Position NFT account | [`6a1GMa4nNjJiScrUNRQ5XRqGrVHh3sSgWcZsuX7HcrRw`](https://solscan.io/account/6a1GMa4nNjJiScrUNRQ5XRqGrVHh3sSgWcZsuX7HcrRw) |
| TRUEQ vault | [`3WjecsMXPyANLppM3QiseYTxayGB9RJke9a8KMZsgpA7`](https://solscan.io/account/3WjecsMXPyANLppM3QiseYTxayGB9RJke9a8KMZsgpA7) |
| wSOL vault | [`3CZZdGeYzwtR2NHzK4R8mTfGuFQegY3XT3RsJEWYS5xn`](https://solscan.io/account/3CZZdGeYzwtR2NHzK4R8mTfGuFQegY3XT3RsJEWYS5xn) |
| Airdrop batch 1 | [`2ooXve…KTYnucS`](https://solscan.io/tx/2ooXvethi7mvkG3EaTqPL84wZHi92e5BsVnhg7qdxd9fetuFZaU5pFNmQWSrUDntyYpkr6KoHfPkaKdb3KTYnucS) |
| Airdrop batch 2 | [`359QkV…fgds1zs`](https://solscan.io/tx/359QkVsJvdHtr4nmbgpBSFyae8zWgZMRxAY2UEJbpwSQBw3iicrVhtfqcr7UibeSBrqTEJL4w8wqK4ZAHfgds1zs) |

## Meteora pool: executed configuration

The pool was created before trading opened. Activation is timestamp **1791817200**, or **2026-10-12 15:00:00 UTC**. The verification snapshot was taken before that timestamp; it proves the configured opening time, not that a trade has already occurred.

- Token A is TRUEQ (6 decimals), token B is wrapped SOL (`So11111111111111111111111111111111111111112`, 9 decimals).
- Initial deposit: **150,000 TRUEQ**, plus **0.000000001 SOL** (one lamport of rounding dust). Economically this is a single-sided position, but the receipt does not contain an exact zero SOL deposit.
- Initial price: **0.000179 SOL per TRUEQ**. The range starts there and extends to the protocol maximum. A dollar equivalent varies with SOL/USD; it is not a fixed USD price on-chain.
- Linear time fee: **10% at opening, minus 0.03 percentage points each second for 300 seconds, ending at 1%**. Dynamic fees are disabled. The fee numerator is 100,000,000 initially and decreases by 300,000 per second against a 1,000,000,000 denominator.
- Fees are collected in **token B only (wSOL)**, `collect_fee_mode = 1`. **Meteora's protocol share is 20% of the trading fee**.
- Position `unlocked_liquidity = 0`, `vested_liquidity = 0`; `permanent_locked_liquidity = 1170678108210830785790960230130`, equal to the pool's total liquidity and permanent-lock counter. The creation transaction includes the full permanent-lock instruction.

The NFT mint and NFT token-account addresses are different; both are listed separately above. The verifier checks the pinned official Meteora IDL, exact account layouts, live fee parameters, opening time, original deposit and the permanent lock.

## Airdrop: executed direct transfers

Two successful transactions sent **9,999.999995 TRUEQ** into the associated token accounts of **11 distinct wallets**, before opening, **without a vesting or escrow instruction**. Batch 1 contains six transfers totaling 4,883.720928 TRUEQ; batch 2 contains five totaling 5,116.279067 TRUEQ. The recipient balance increases and creator debit match these transfers.

Only the two receipt links and aggregate totals are published here. The verifier reads public receipts in memory but neither prints nor stores the recipient list or raw airdrop receipts. This confirms token transfers; NFT eligibility and the owner's stated 43-NFT allocation basis are not established by those SPL Token receipts alone.

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

See [`verify/`](verify/) for the read-only program and pinned Jupiter Lock and Meteora decoding references. Run from the repository root using Node.js 22 or later:

```sh
node verify/verify.mjs
```

To run the local positive and negative tests: `node --test`. To refresh the dated evidence files: `node verify/verify.mjs --write-evidence`. No dependencies need installing. The updated run on **2026-10-12** passed **95 checks**; all **28 local tests** passed.

Each check prints `OK` or `FALLA`; a failed check produces a nonzero exit status. Only public, read-only Solana RPC methods and public IPFS requests are used. The verifier does not load keys, connect a wallet, sign or submit transactions. RPC or gateway errors must not be interpreted as successful checks.

The recorded public evidence is in [`evidence/`](evidence/). It is a dated RPC snapshot, not a replacement for running the verifier or an independent audit of SPL Token, Metaplex or Jupiter Lock. Later burns or vesting claims can change balances/supply; compare the historical receipts and report any current-state differences instead of rewriting the original record.

The original immutable metadata remains byte-for-byte unchanged even where it describes earlier launch plans. The executed records above take precedence for the opening fee and airdrop timing/lock. Future buybacks and burns require their own receipts; this commit does not claim they have happened. This record does not change the website, bots, Fast Launch program or any other contract.

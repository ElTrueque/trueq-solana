# Pinned official Meteora decoding reference

Source repository: [MeteoraAg/cp-amm-sdk](https://github.com/MeteoraAg/cp-amm-sdk), commit [`79ebbfe59a225e641a2f37cd03404f26de1b0c8e`](https://github.com/MeteoraAg/cp-amm-sdk/tree/79ebbfe59a225e641a2f37cd03404f26de1b0c8e).

These files are unchanged copies fetched on 2026-10-12:

| Included file | Original path |
| --- | --- |
| `cp_amm.json` | `src/idl/cp_amm.json` |
| `constants.ts` | `src/constants.ts` |
| `types.ts` | `src/types.ts` |
| `feeScheduler.ts` | `src/math/poolFees/baseFee/feeScheduler.ts` |
| `feeTimeScheduler.ts` | `src/math/poolFees/baseFee/feeTimeScheduler.ts` |
| `LICENSE` | `LICENSE` |

IDL SHA-256: `7f5e5f5e9cab57cd208575dc53359676550e41ee0c19fc822560fe1062fd3ac5`.

The verifier decodes the IDL's complete fixed `Pool` (1,112 bytes) and `Position` (408 bytes) layouts, including every explicit padding field. It rejects unknown size or discriminator. The `PodAlignedFeeTimeScheduler` layout decodes the fee's packed bytes. `types.ts` identifies mode `0` as linear time fees and collection mode `1` as token B only. `constants.ts` defines the fee denominator as 1,000,000,000 and the maximum square-root price. The fee source shows the capped linear subtraction for each elapsed period.

These TypeScript references are not executed or installed as dependencies. Only the pinned JSON IDL is used by the dependency-free verifier. The included upstream MIT license covers these upstream files.

import { flattenInstructions, findProgramAddress, base58Decode } from './lib.mjs';
import { METEORA } from './meteora.mjs';

export const AIRDROP_RECEIPTS = [
  '2ooXvethi7mvkG3EaTqPL84wZHi92e5BsVnhg7qdxd9fetuFZaU5pFNmQWSrUDntyYpkr6KoHfPkaKdb3KTYnucS',
  '359QkVsJvdHtr4nmbgpBSFyae8zWgZMRxAY2UEJbpwSQBw3iicrVhtfqcr7UibeSBrqTEJL4w8wqK4ZAHfgds1zs',
];
const ATA = 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL';
const accountFor = owner => findProgramAddress([base58Decode(owner), base58Decode(METEORA.tokenProgram), base58Decode(METEORA.tokenA)], ATA).address;

// Recipient addresses necessarily arrive in public RPC receipts, but stay only
// in process memory. Neither the public summary nor record() receives them.
export function checkAirdrop(transactions, check) {
  const owners = new Set(), destinations = new Set();
  let total = 0n, transfers = 0;
  const batches = [];
  for (let i = 0; i < AIRDROP_RECEIPTS.length; i++) {
    const tx = transactions[i], signature = AIRDROP_RECEIPTS[i];
    check(`Airdrop batch ${i + 1}: requested successful receipt`, tx?.transaction?.signatures?.[0] === signature && tx.meta?.err === null);
    if (!tx?.transaction || tx.meta?.err !== null) throw new Error('Airdrop receipt missing or failed');
    const { keys, instructions } = flattenInstructions(tx);
    check(`Airdrop batch ${i + 1}: creator signed`, keys.slice(0, tx.transaction.message.header.numRequiredSignatures).includes(METEORA.creator));
    check(`Airdrop batch ${i + 1}: sent before trading opened`, Number.isSafeInteger(tx.blockTime) && tx.blockTime < Number(METEORA.activation));
    const outer = instructions.filter(x => x.location.startsWith('outer:'));
    check(`Airdrop batch ${i + 1}: direct transfer, no lock/escrow program`, outer.every(x => [METEORA.tokenProgram, ATA, 'ComputeBudget111111111111111111111111111111', '11111111111111111111111111111111'].includes(x.program)));
    const tokenTransfers = outer.filter(x => x.program === METEORA.tokenProgram);
    let batchTotal = 0n, valid = tokenTransfers.length > 0, balanceEffects = true;
    for (const ix of tokenTransfers) {
      if (ix.data[0] !== 12 || ix.data.length !== 10 || ix.data[9] !== 6 || ix.accounts.length !== 4 || ix.accounts[0] !== accountFor(METEORA.creator) || ix.accounts[1] !== METEORA.tokenA || ix.accounts[3] !== METEORA.creator) { valid = false; continue; }
      const amount = ix.data.readBigUInt64LE(1), destination = ix.accounts[2];
      const post = tx.meta.postTokenBalances.find(b => keys[b.accountIndex] === destination && b.mint === METEORA.tokenA);
      const pre = tx.meta.preTokenBalances.find(b => keys[b.accountIndex] === destination && b.mint === METEORA.tokenA);
      if (amount <= 0n || !post || post.owner === METEORA.creator || post.programId !== METEORA.tokenProgram || post.uiTokenAmount.decimals !== 6 || destination !== accountFor(post.owner) || destinations.has(destination)) { valid = false; continue; }
      balanceEffects &&= BigInt(post.uiTokenAmount.amount) - BigInt(pre?.uiTokenAmount.amount ?? '0') === amount;
      owners.add(post.owner); destinations.add(destination); batchTotal += amount; transfers++;
    }
    const creatorPre = tx.meta.preTokenBalances.find(b => keys[b.accountIndex] === accountFor(METEORA.creator) && b.mint === METEORA.tokenA);
    const creatorPost = tx.meta.postTokenBalances.find(b => keys[b.accountIndex] === accountFor(METEORA.creator) && b.mint === METEORA.tokenA);
    check(`Airdrop batch ${i + 1}: TRUEQ TransferChecked into recipients' own associated accounts`, valid);
    check(`Airdrop batch ${i + 1}: recipient credits and creator debit match`, balanceEffects && !!creatorPre && !!creatorPost && BigInt(creatorPre.uiTokenAmount.amount) - BigInt(creatorPost.uiTokenAmount.amount) === batchTotal);
    total += batchTotal;
    batches.push({ signature, slot: tx.slot, blockTime: tx.blockTime, transferCount: tokenTransfers.length, amountRaw: batchTotal.toString() });
  }
  check('Airdrop: exactly 11 distinct recipient wallets', owners.size === 11 && transfers === 11);
  check('Airdrop: total 9,999.999995 TRUEQ', total === 9999999995n, total.toString());
  return { mint: METEORA.tokenA, amountRaw: total.toString(), amount: '9999.999995', decimals: 6, recipientCount: owners.size, transferCount: transfers, directTransfers: true, beforeActivation: METEORA.activation, batches, privacy: 'Only aggregate totals and public receipt signatures are stored; no recipient list or raw receipt is saved.' };
}
export async function verifyAirdrop({ loadTransaction, check, record }) {
  const txs = [];
  for (const signature of AIRDROP_RECEIPTS) txs.push(await loadTransaction(signature));
  const summary = checkAirdrop(txs, check);
  await record('airdrop-summary', { checkedAt: new Date().toISOString(), ...summary });
}

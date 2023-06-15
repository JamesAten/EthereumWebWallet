import { ethers, Wallet } from 'ethers';
import { CHAINS_CONFIG, goerli } from '../interfaces/Chain';

export async function sendToken(
    amount: number,
    from: string,
    to: string,
    privateKey: string,
) {

    const chain = CHAINS_CONFIG[goerli.chainId];

    console.log('chain: ', chain)

    // Create a provider using the Infura RPC URL for Goerli
    const provider = new ethers.providers.JsonRpcProvider(chain.rpcUrl);

    console.log('provider: ', provider)

    // Create a wallet instance from the sender's private key
    const wallet: Wallet = new ethers.Wallet(privateKey, provider);

    console.log('wallet: ', wallet);

    // Construct the transaction object
    const tx = {
        to,
        value: ethers.utils.parseEther(amount.toString()),
    };

    console.log('tx: ', tx);

    // Sign the transaction with the sender's wallet
    const transaction = await wallet.sendTransaction(tx);

    console.log('transaction: ', transaction);

    // Wait for the transaction to be mined
    const receipt = await transaction.wait();

    console.log('receipt: ', receipt);

    return {transaction, receipt};
}
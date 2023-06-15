import React, { useState, useEffect } from 'react';
// import { deployContract} from "../../utilities/ContractUtils";
import {Account} from "../interfaces/Account";
import {sendToken} from "../utilities/TranasctionUtils";
import {CHAINS_CONFIG, goerli} from "../interfaces/Chain";
import { ethers, Wallet } from 'ethers';
import { contractBytecode, contractABI } from '../interfaces/Contract';

type AccountTransactionsProps = {
    account: Account,
};
const Contract: React.FC<AccountTransactionsProps> = ({ account }) => {

    const privateKey = account.privateKey;

    const [walletBalance, setWalletBalance] = useState(0);
    const [contractAddress, setContractAddress] = useState('0x5219e3310429b2aB09e09aF2827cf8D3d498D6F3')
    const [ownerAddress, setOwnerAddress] = useState('');
    const [userAddressForAllowedToSpend, setUserAddressForAllowedToSpend] = useState('');
    const [userAddressForStipendValue, setUserAddressForStipendValue] = useState('');
    const [userAddressForSetStipend, setUserAddressForSetStipend] = useState('');
    const [isAllowedToSend, setIsAllowedToSend] = useState(false);
    const [stipendValue, setStipendValue] = useState(0)
    const [stipendAmount, setStipendAmount] = useState('');
    const [transactionHashForSetStipend, setTransactionHashForSetStipend] = useState('');

    const [recipientAddress, setRecipientAddress] = useState('');
    const [transferAmount, setTransferAmount] = useState('');
    const [transactionHashForTransfer, setTransactionHashForTransfer] = useState('');


    const chain = CHAINS_CONFIG[goerli.chainId];
    const provider = new ethers.providers.JsonRpcProvider(chain.rpcUrl);
    const contract = new ethers.Contract(contractAddress, contractABI, provider);
    const wallet: Wallet = new ethers.Wallet(privateKey, provider);

    const getWalletBalance = async () => {
        const balance = await contract.getBalance();
        setWalletBalance(balance);
    };

    const getContractOwner = async () => {
        const contract = new ethers.Contract(contractAddress, contractABI, provider);
        const owner = await contract.owner();
        setOwnerAddress(owner);
    };

    const checkIsAllowedToSend = async () => {
        if (!userAddressForAllowedToSpend) {
            alert('Please enter a valid user address.');
            return;
        }

        const contract = new ethers.Contract(contractAddress, contractABI, wallet);
        const allowed = await contract.isAllowedToSend(userAddressForAllowedToSpend);
        setIsAllowedToSend(allowed);
    };

    const checkStipendValue = async () => {
        if (!userAddressForStipendValue) {
            alert('Please enter a valid user address to check stipend value.');
            return;
        }

        const contract = new ethers.Contract(contractAddress, contractABI, wallet);
        const contractStipendValue = await contract.stipend(userAddressForStipendValue);
        console.log('contractStipendValue: ', contractStipendValue.toString())
        setStipendValue(contractStipendValue.toString());
    };

    const setStipend = async () => {
        if (!userAddressForSetStipend|| !stipendAmount) {
            alert('Please enter a valid user address and stipend amount.');
            return;
        }

        const contract = new ethers.Contract(contractAddress, contractABI, wallet);
        const tx = await contract.setStipend(userAddressForSetStipend, stipendAmount);
        await tx.wait();
        setTransactionHashForSetStipend(tx.hash);
        alert('Stipend set successfully!');
    };

    const transferFunds = async () => {

        console.log('transferFunds function called');

        if (!recipientAddress || !transferAmount) {
            alert('Please enter a valid recipient address and transfer amount.');
            return;
        }

        const contract = new ethers.Contract(contractAddress, contractABI, wallet);

        console.log('transferFunds - contract: ', contract)

        const tx = await contract.transfer(recipientAddress, transferAmount, {
            gasPrice: ethers.utils.parseUnits('10', 'gwei'), // Set the gas price in Gwei (adjust as needed)
            gasLimit: 300000, // Set the gas limit (adjust as needed)
        });

        console.log('transferFunds - tx: ', tx);

        await tx.wait();
        setTransactionHashForTransfer(tx.hash);

        console.log('transferFunds - transactionHashForTransfer')
        alert('Funds transferred successfully!');
    };

    async function deployContract() {
        // Create a wallet instance from the sender's private key
        const wallet: Wallet = new ethers.Wallet(privateKey, provider);
        console.log('wallet: ', wallet);

        const factory = new ethers.ContractFactory(contractABI, contractBytecode, wallet);
        console.log('factory: ', factory)

        const contract = await factory.deploy();
        console.log('contract: ', contract);

        const deployment = await contract.deployed();
        console.log('deployment:', deployment);

        setContractAddress(contract.address)
        console.log('contract.address: ', contract.address)

    }

    useEffect(() => {
        getWalletBalance();
        getContractOwner();
        setStipendValue(0)
    }, []);

    return (
        <div className='Contract container'>
            <h2 className="text-3xl font-bold underline">Smart Contract Wallet</h2>
            <button className="btn btn-primary rounded-pill px-3" onClick={deployContract}>
                Deploy Contract
            </button>

            <h4>Contract Address: <a  href={`${goerli.blockExplorerUrl}/address/${contractAddress}`} target="_blank" rel="noopener noreferrer">
              {contractAddress}
            </a></h4>

            <h5>
                Owner Address: <a href={`https://goerli.etherscan.io/address/${account.address}`} target="_blank" rel="noreferrer">
                {account.address}
                </a>
            </h5>

            <h5>Contract Balance: {ethers.utils.formatEther(walletBalance)} ETH</h5>

            <button
                className="btn btn-info rounded-pill px-3"
                type="button"
                onClick={getWalletBalance}>
                Refresh Wallet Balance
            </button>

            <div className="checkIsAllowedToSpendDiv container">
                <div className="form-group">
                    <input
                        className="form-control"
                        type="text"
                        placeholder="Account Address to Check Ability to Spend"
                        value={userAddressForAllowedToSpend}
                        onChange={(e) => setUserAddressForAllowedToSpend(e.target.value)}
                    />
                </div>
                <button className="btn btn-info rounded-pill px-3" onClick={checkIsAllowedToSend}>Check IsAllowedToSend</button>
                <p>Is Allowed to Send: {isAllowedToSend ? 'Yes' : 'No'}</p>

            </div>


            <input
                className="form-control"
                type="text"
                placeholder="Account Address to Check for Stipend Value"
                value={userAddressForStipendValue}
                onChange={(e) => setUserAddressForStipendValue(e.target.value)}
            />
            <button className="btn btn-info rounded-pill px-3" onClick={checkStipendValue}>Check Stipend Value</button>
            <p>Stipend Value: { stipendValue } wei</p>

            <input
                className="form-control"
                type="text"
                placeholder="Account to Set Stipend For"
                value={userAddressForSetStipend}
                onChange={(e) => setUserAddressForSetStipend(e.target.value)}
            />
            <input
                className="form-control"
                type="text"
                placeholder="Stipend Amount in Wei"
                value={stipendAmount}
                onChange={(e) => setStipendAmount(e.target.value)}
            />
            <button className="btn btn-primary rounded-pill px-3" onClick={setStipend}>Set Stipend</button>

            <div className="container contractTransferDiv form-group">
                <h2>Transfer Funds</h2>
                <div>
                    <input className="form-control" placeholder="Account Address of Recipient" type="text" value={recipientAddress} onChange={(e) => setRecipientAddress(e.target.value)} />
                </div>
                <div>
                    <input className="form-control" placeholder="Transfer Amount in Wei" type="text" value={transferAmount} onChange={(e) => setTransferAmount(e.target.value)} />
                </div>
                <button className="btn btn-primary rounded-pill px-3" onClick={transferFunds}>Transfer</button>
            </div>
        </div>
    )
};

export default Contract;
import React, {useEffect, useState} from 'react';
import { sendToken } from '../utilities/TranasctionUtils';
import { goerli } from '../interfaces/Chain';
import { Account } from '../interfaces/Account';
import AccountTransactions from './AccountTransactions';
import { ethers } from 'ethers';
import { toFixed } from '../utilities/AccountUtils';
import Contract from "./Contract";

interface AccountDetailProps {
    account: Account
}

const AccountDetail: React.FC<AccountDetailProps> = ({account}) => {
    const [toAddress, setToAddress] = useState('');
    const [amount, setAmount] = useState(0);
    const [balance, setBalance] = useState(account.balance)

    const [netResponse, setNetResponse] = useState<{ status: null | 'pending' | 'complete' | 'error', message: string | React.ReactElement }>({
        status: null,
        message: '',
    });

    const fetchData = async () => {
        const provider = new ethers.providers.JsonRpcProvider(goerli.rpcUrl);
        let accountBalance = await provider.getBalance(account.address);
        setBalance((String(toFixed(ethers.utils.formatEther(accountBalance)))));
    }

    useEffect(() => {
        const fetchData = async () => {
            const provider = new ethers.providers.JsonRpcProvider(goerli.rpcUrl);
            let accountBalance = await provider.getBalance(account.address);
            setBalance((String(toFixed(ethers.utils.formatEther(accountBalance)))));
        }
        fetchData();
    }, [account.address])


    function handleDestinationAddressChange(event: React.ChangeEvent<HTMLInputElement>) {
        setToAddress(event.target.value);
    }

    function handleAmountChange(event: React.ChangeEvent<HTMLInputElement>) {
        setAmount(Number.parseFloat(event.target.value));
    }

    async function transfer() {
        
        setNetResponse({
            status: 'pending',
            message: '',
        });

        try {
            const { receipt } = await sendToken(amount, account.address, toAddress, account.privateKey);

            if (receipt.status === 1) {
                setNetResponse({
                    status: 'complete',
                    message: <p>Transfer completed! <a href={`${goerli.blockExplorerUrl}/tx/${receipt.transactionHash}`} target="_blank" rel="noreferrer">
                        View transaction
                    </a></p>,
                });
                return receipt;
            } else {
                console.log(`Failed to send ${receipt}`);

                setNetResponse({
                    status: 'error',
                    message: JSON.stringify(receipt),
                });
                return { receipt };
            }
        } catch (error: any) {
            console.error({ error });

            setNetResponse({
                status: 'error',
                message: error.reason || JSON.stringify(error),
            });
        }
    }

    return (
        <div className='AccountDetail container'>
            <h4>
                Address: <a href={`https://goerli.etherscan.io/address/${account.address}`} target="_blank" rel="noreferrer">
                {account.address}
            </a><br/>
                Balance: {balance} ETH
            </h4>
            <button
                className="btn btn-info rounded-pill px-3"
                type="button"
                onClick={fetchData}>
                Refresh Account Info
            </button>
            <hr>
            </hr>
            <div className="container sendDiv">
                <h3>Send Eth</h3>
                <div className="form-group">
                    <label>Destination Address:</label>
                    <input
                        className="form-control"
                        type="text"
                        value={toAddress}
                        onChange={handleDestinationAddressChange}
                    />
                </div>

                <div className="form-group">
                    <label>Amount:</label>
                    <input
                        className="form-control"
                        type="number"
                        value={amount}
                        onChange={handleAmountChange}
                    />
                </div>

                <button
                    className="btn btn-primary rounded-pill px-3"
                    type="button"
                    onClick={transfer}
                    disabled={!amount || netResponse.status === 'pending'}
                >
                    Send {amount} ETH
                </button>

                {netResponse.status &&
                    <>
                        {netResponse.status === 'pending' && <p>Transfer is pending...</p>}
                        {netResponse.status === 'complete' && <p>{netResponse.message}</p>}
                        {netResponse.status === 'error' && <p>Error occurred while transferring tokens: {netResponse.message}</p>}
                    </>
                }
            </div>
            <hr>
            </hr>
            <AccountTransactions account={account} />
            <Contract account={account} />
        </div>

    )
}
export default AccountDetail;
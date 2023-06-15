import { ethers } from 'ethers';
import React, { useCallback, useEffect, useState } from 'react';
import { Account } from '../interfaces/Account';
import { goerli } from '../interfaces/Chain';
import { Transaction } from '../interfaces/Transaction';
import { TransactionService } from '../services/TransactionService';
import { shortAddress } from '../utilities/AccountUtils';

type AccountTransactionsProps = {
    account: Account,
};

const AccountTransactions: React.FC<AccountTransactionsProps> = ({ account }) => {

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [netResponse, setNetResponse] = useState<{ status: null | 'pending' | 'complete' | 'error', message: string | React.ReactElement }>({
        status: null,
        message: '',
    });

    const getTransactions = useCallback(
        () => {
            setNetResponse({
                status: 'pending',
                message: '',
            });
            TransactionService.getTransactions(account.address).then(response => {
                setTransactions(response.data.result);
            }).catch(error => {
                console.log({error})
                setNetResponse({
                    status: 'error',
                    message: JSON.stringify(error),
                });
            }).finally(()=>{
                setNetResponse({
                    status: 'complete',
                    message: '',
                });
            });
        },[account.address]
    ) ;

    useEffect(() => {
        getTransactions();
    }, [getTransactions]);

    return (
        <div className="AccountTransactions">

            <h2>Transactions</h2>
            <div className="TransactionsMetaData">
                {netResponse.status === "complete" && transactions.length === 0 && (
                    <p>This address does not have any transactions</p>
                )}
                <button type="button" className="btn btn-info rounded-pill px-3" onClick={getTransactions} disabled={netResponse.status==="pending"}>
                    Refresh Transactions
                </button>
                {/* Show the network response status and message */}
                {netResponse.status && (
                    <>
                        {netResponse.status === "pending" && (
                            <p className="text-info">Refreshing transactions...</p>
                        )}
                        {netResponse.status === "error" && (
                            <p className="text-danger">
                                Error occurred while transferring tokens: {netResponse.message}
                            </p>
                        )}
                    </>
                )}
            </div>
            <table className="table table-striped overflow-auto">
                <thead>
                <tr>
                    <th>Hash</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Value</th>
                    <th>Timestamp</th>
                </tr>
                </thead>
                <tbody>
                {transactions.map(transaction => (
                    <tr key={transaction.hash}>
                        <td>
                            <a
                                href={`${goerli.blockExplorerUrl}/tx/${transaction.hash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {shortAddress(transaction.hash)}
                            </a>
                        </td>
                        <td>
                            <a
                                href={`${goerli.blockExplorerUrl}/address/${transaction.from_address}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {shortAddress(transaction.from_address)}
                            </a>
                            {transaction.from_address.toLowerCase()===account.address.toLowerCase() ?
                                <span className="badge rounded-pill bg-warning">OUT</span>
                                :
                                <span className="badge rounded-pill bg-success">IN</span>
                            }
                        </td>
                        <td>
                            <a
                                href={`${goerli.blockExplorerUrl}/address/${transaction.to_address}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {shortAddress(transaction.to_address)}
                            </a>
                        </td>
                        <td>
                            {ethers.utils.formatEther(transaction.value)} ETH
                        </td>
                        <td>
                            {new Date(transaction.block_timestamp).toLocaleString()}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
            <hr>
            </hr>
        </div>
    );
};

export default AccountTransactions;
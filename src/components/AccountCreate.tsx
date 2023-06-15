import React, { useState, useCallback, useEffect } from 'react';
import { generateAccount } from '../utilities/AccountUtils'
import { Account } from '../interfaces/Account';
import AccountDetail from './AccountDetail'

const recoveryPhraseKeyIdentifier = 'recoveryPhrase';

const AccountCreate: React.FC = () => {

    const [seedPhrase, setSeedPhrase] = React.useState('');

    const [account, setAccount] = useState<Account | null>(null);

    const [showRecoverInput, setShowRecoverInput] = React.useState(false);

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        setSeedPhrase(event.target.value);
    }

    const handleKeyDown = async (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.keyCode === 13) {
            event.preventDefault();
            await recoverAccount(seedPhrase);
        }
    }

    const recoverAccount = useCallback(
        async (recoveryPhrase: string) => {
            const result = await generateAccount(recoveryPhrase);

            setAccount(result.account);

            if (localStorage.getItem(recoveryPhraseKeyIdentifier) !== recoveryPhrase) {
                localStorage.setItem(recoveryPhraseKeyIdentifier, recoveryPhrase);
            }
        }, []
    );

    async function createAccount() {
        // Call the generateAccount function with no arguments
        const result = await generateAccount();

        // Update the account state with the newly created account
        setAccount(result.account);

        const recoveryPhrase = result.seedPhrase
        if (localStorage.getItem(recoveryPhraseKeyIdentifier) !== recoveryPhrase) {
            localStorage.setItem(recoveryPhraseKeyIdentifier, recoveryPhrase);
        }
    }

    useEffect(() => {

        const localStorageRecoveryPhrase = localStorage.getItem(recoveryPhraseKeyIdentifier)
        if (localStorageRecoveryPhrase) {
            setSeedPhrase(localStorageRecoveryPhrase);
            recoverAccount(localStorageRecoveryPhrase);
        }
    }, [recoverAccount])

    return (
        <div className='AccountCreate container'>
            <h1>
                WebWallet
            </h1>
            <form onSubmit={event => event.preventDefault()}>
                <button type="button" className="btn btn-success rounded-pill px-3" onClick={createAccount}>
                    Create Account
                </button>

                <button type="button" className="btn btn-warning rounded-pill px-3"
                        onClick={() => showRecoverInput ? recoverAccount(seedPhrase) : setShowRecoverInput(true)}

                        disabled={showRecoverInput && !seedPhrase}
                >
                    Recover account
                </button>

                {showRecoverInput && (
                    <div >
                        <input type="text" placeholder='Seedphrase or private key for recovery'
                               value={seedPhrase} onChange={handleChange} onKeyDown={handleKeyDown} />
                    </div>
                )}
            </form>
            {account &&
                <>
                    <hr />
                    <AccountDetail account={account} />
                </>
            }
        </div>
    )
};

export default AccountCreate;
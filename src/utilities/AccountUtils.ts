import { Wallet } from 'ethers';
import { Account } from '../interfaces/Account';

export function generateAccount(seedPhrase: string = "", index: number = 0):
    { account: Account, seedPhrase: string } {
    let wallet: Wallet;

    if (seedPhrase === "") {
        seedPhrase = Wallet.createRandom().mnemonic.phrase;
    }

    wallet = (seedPhrase.includes(" ")) ? Wallet.fromMnemonic(seedPhrase, `m/44'/60'/0'/0/${index}`) :
        new Wallet(seedPhrase);

    const { address } = wallet;
    const account = { address, privateKey: wallet.privateKey, balance: "0" };

    return { account, seedPhrase: seedPhrase.includes(" ")? seedPhrase : "" };
}

export function shortAddress(str: string, numChars: number=4) {
    if(str){
        return `${str.substring(0, numChars)}...${str.substring(str.length - numChars)}`;
    }
}

export function toFixed( value: string, decimalPlaces: number = 2 ){
    if(value){
        return +parseFloat(value).toFixed( decimalPlaces );
    }

}
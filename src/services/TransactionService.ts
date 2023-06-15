import axios from 'axios';
import { goerli } from '../interfaces/Chain';

const API_KEY = process.env.REACT_APP_MORALIS_API_KEY;
export class TransactionService {

    static API_URL =  'https://deep-index.moralis.io/api/v2';
    static API_KEY = API_KEY

    static async getTransactions(address: string) {
        const options = {
            method: 'GET',
            url: `${TransactionService.API_URL}/${address}`,
            params: {chain: goerli.name.toLowerCase()},
            headers: {accept: 'application/json', 'X-API-Key': TransactionService.API_KEY}
        };

        const response = await axios.request(options);
        return response;
    }

}
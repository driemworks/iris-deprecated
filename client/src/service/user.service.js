import { loadUser } from "../state/actions";
import { IPFSDatabase } from "../db/ipfs.db";

import store from '../state/store/index';

import { aliasDirectory, contractDirectory } from "../constants";


export const UserService = {

    async loadUser(web3) {
        const accounts = await this.loadAccounts(web3);
        // default to first account
        const alias = await this.findAlias(accounts[0]);
        const contract = String.fromCharCode(... new Uint8Array(await this.findContracts(accounts[0])));
        console.log(contract);
        await store.dispatch(loadUser({
            alias          : alias,
            contract       : contract,
            accounts       : accounts,
            account        : accounts[0]
        }));
    },

    async loadAccounts(web3) {
        return await web3.eth.getAccounts();
        // let i = 1;
        // for (let account of accounts) {
        //     this.accountsSelector.push(
        //         { label: account, value: i }
        //     );
        //     i += 1;
        // }
    },

    async findAlias(account) {
        const dir = aliasDirectory(account) + 'data.txt';
        try {
          const filesResponse = await IPFSDatabase.readFile(dir);
          const content = String.fromCharCode(... new Uint8Array(filesResponse));
          const alias = content.split('=')[1];
          return alias;
        } catch (e) {
          return '';
        }
      },
    
      async findContracts(account) {
        const dir = contractDirectory(account) + 'contract.txt';
        try {
          return await IPFSDatabase.readFile(dir);
        } catch (e) {
          return '';
        }
      }
}

export default UserService;
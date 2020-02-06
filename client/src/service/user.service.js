import { loadUser } from "../state/actions";
import { IPFSDatabase } from "../db/ipfs.db";

import store from '../state/store/index';

export const UserService = {

    async loadUser(web3) {
        const accounts = await this.loadAccounts(web3);
        // default to first account
        const alias = await this.findAlias(accounts[0]);
        const contract = String.fromCharCode(... new Uint8Array(await this.findContracts(accounts[0])));
        console.log('contract ' + contract);
        await store.dispatch(loadUser({
            alias           : alias,
            contract       : contract,
            accounts        : accounts,
            account         : accounts[0]
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
        const dir = '/content/' + account + '/usr/data.txt';
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
        const dir = '/content/' + account + '/contract/contract.txt';
        try {
          return await IPFSDatabase.readFile(dir);
        } catch (e) {
          return '';
        }
      },
    
      async getEthereumBalance(account, web3) {
        return await web3.utils.fromWei(
          await web3.eth.getBalance(account), 'ether');
      }

}

export default UserService;
import truffleContract from '@truffle/contract';
import EncryptionKeys from '../contracts/EncryptionKeys.json';
import getWeb3 from '../utils/getWeb3';

export const ContractUtils = {
      /**
   * Deploy the encryption keys contract
   * @param {*} _gas 
   * @param {*} sharedA 
   * @param {*} sharedB 
   */
  async deployContract(_gas, web3, publicKey, privateKey, account) {
    console.log('deploying contract');
    const Contract = truffleContract(EncryptionKeys);
    Contract.setProvider(web3.currentProvider);
    return await Contract.new(publicKey, privateKey, { from: account });
  }
}
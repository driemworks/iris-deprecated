import {EncryptionUtils} from '../utils/encryption.utils';
import truffleContract from '@truffle/contract';
import EncryptionKeys from '../contracts/EncryptionKeys.json';
// import {ContractUtils} from '../utils/contract.utils';
import {IPFSDatabase} from '../db/ipfs.db';
import { box, randomBytes } from 'tweetnacl';
import {
  decodeUTF8,
  encodeUTF8,
  decodeBase64,
  encodeBase64
} from 'tweetnacl-util';

export const ContractService = {

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
        return await Contract.new(publicKey, privateKey, { from: account, gas: _gas });
    },

    /**
     * Retrieve a contract by address
     * @param {*} web3 
     * @param {*} contractAddress 
     */
    async getContractByAddress(web3, contractAddress) {
        const contract = truffleContract(EncryptionKeys);
        contract.setProvider(web3.currentProvider);
        return await contract.at(contractAddress);
    },

    /**
     * Generate encryption keys and deploy the contract 
     * Makes a single ethereum transaction - to deploy the contract
     * @param {*} web3 
     * @param {*} account 
     */
    async generateKeys(web3, account) {
        const gasPrice = 1000000;
        console.log('gas price ' +gasPrice);
        console.log('generating key pairs');
        const pairA = await EncryptionUtils.generateKeyPair();
        let publicKey = pairA.publicKey;
        let secretKey = pairA.secretKey;
        console.log('keys generated!')

        console.log('deploying contract for account: ' + account);
        const publicKeyAsString = encodeBase64(publicKey);
        const privateKeyAsString = encodeBase64(secretKey);
        const instance = await this.deployContract(gasPrice, web3, publicKeyAsString, 
            privateKeyAsString, account);
        const contractAddress = instance.address;
        console.log('deployed contract successfully ' + contractAddress);
        // this.props.action(contractAddress);
        // create ipfs file and upload
        const directory = '/content/' + account;
        // IPFSDatabase.deleteDirectory('/content/' + this.props.ethereumAccountId);
        // create directories
        IPFSDatabase.createDirectory(directory);
        IPFSDatabase.createDirectory(directory + '/contract');
        IPFSDatabase.createDirectory(directory + '/inbox');
        console.log('Creating contract file');
        await IPFSDatabase.addFile(directory + '/contract/', 
            Buffer.from(contractAddress), 'contract.txt', (err, res) => {
            console.log(JSON.stringify(res)); 
        });
        return contractAddress;
    },

    async createSharedKey(web3, secretAddress, publicAddress, 
        senderContractAddress, recipientContractAddress) {
        // sender secret key
        const senderContract = await this.getContract(web3, senderContractAddress);
        const secretKeySendingAccount = await senderContract.getPrivateKey( { from: secretAddress });

        // recipient public key
        const recipientContract = await this.getContract(web3, recipientContractAddress);
        const publicKeySelectedAccount = await recipientContract.getPublicKey({ from: publicAddress });

        const publicKeyRecipient = decodeBase64(publicKeySelectedAccount.logs[0].args['0']);
        const secretKeySender = decodeBase64(secretKeySendingAccount.logs[0].args['0']);
        // create shared key
        return box.before(publicKeyRecipient, secretKeySender);
    },
    
    async getContract(web3, address) {
        const contract = truffleContract(EncryptionKeys);
        contract.setProvider(web3.currentProvider);
        return await contract.at(address);
    }
}

export default ContractService;
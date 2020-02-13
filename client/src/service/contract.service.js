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

import { contractDirectory } from "../constants";


export const ContractService = {

    /**
     * Deploy the encryption keys contract
     * @param {*} _gas 
     * @param {*} sharedA 
     * @param {*} sharedB 
     */
    async deployContract(web3, publicKey, privateKey, account) {
        const Contract = truffleContract(EncryptionKeys);
        Contract.setProvider(web3.currentProvider);
        return Contract.new(publicKey, privateKey, { from: account });
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
        // const gasPrice = 1000000;
        const pairA = await EncryptionUtils.generateKeyPair();
        let publicKey = pairA.publicKey;
        let secretKey = pairA.secretKey;

        const publicKeyAsString = encodeBase64(publicKey);
        const privateKeyAsString = encodeBase64(secretKey);
        const instance = await this.deployContract(web3, publicKeyAsString, 
            privateKeyAsString, account);
        const contractAddress = instance.address;
        // create ipfs file and upload
        const directory = contractDirectory(account)
        // IPFSDatabase.deleteDirectory('/content/' + this.props.ethereumAccountId);
        // create directory
        IPFSDatabase.createDirectory(directory);
        await IPFSDatabase.addFile(directory, Buffer.from(contractAddress), 'contract.txt', 
            (err, res) => {
                console.log(JSON.stringify(res)); 
            }
        );
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
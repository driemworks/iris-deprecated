import {EncryptionUtils} from '../utils/encryption.utils';
import {ContractUtils} from '../utils/contract.utils';
import {IPFSDatabase} from '../db/ipfs.db';
import { box, randomBytes } from 'tweetnacl';
import {
  decodeUTF8,
  encodeUTF8,
  decodeBase64,
  encodeBase64
} from 'tweetnacl-util';

class ContractService {

    // encryptionKeysContract = null;

    // ContractService(encryptionKeysContract) {
    //     this.encryptionKeysContract = encryptionKeysContract;
    // }

    // async getPublicKey(callback) {
    //     return this.encryptionKeysContract.getPublicKey(callback);
    // }

    // async getSecretKey(userAddress, callback) {
    //     return this.encryptionKeysContract.getSecretKey(userAddress, callback);
    // }

    generateKeys = async(web3, account) => {
        console.log('generating key pairs');
        const pairA = await EncryptionUtils.generateKeyPair();
        let publicKey = pairA.publicKey;
        let secretKey = pairA.secretKey;
        console.log('keys generated!')

        console.log('deploying contract for account: ' + account);
        this.setState({ keysGenerated: true });
        const publicKeyAsString = encodeBase64(publicKey);
        const privateKeyAsString = encodeBase64(secretKey);
        const instance = await ContractUtils.deployContract(10000, web3, publicKeyAsString, 
            privateKeyAsString, account);
        const contractAddress = instance.address;
        console.log('deployed contract successfully ' + contractAddress);
        this.props.action(contractAddress);
        this.setState({ contractAddress });
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
    }
}

export default ContractService;
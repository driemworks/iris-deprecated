import { loadUser, setAddress } from "../state/actions";
import { IPFSDatabase } from "../db/ipfs.db";

import { box } from 'tweetnacl';
import { decodeBase64 } from 'tweetnacl-util';
import { inboxDirectory, uploadDirectory, localStorageConstants, HD_PATH_STRING } from '../constants';
import { EncryptionService } from '../service/encrypt.service';

import store from '../state/store/index';

import lightwallet from 'eth-lightwallet';
import passworder from 'browser-passworder';

export const UserService = {

    // async getEthUser(password) {
      // EthService.initVault(password);

      // try to get the mnemonic from localstorage
      // const safeSeedPhrase = localStorage.getItem(localStorageConstants.MNEMONIC);
      // let seedPhrase = '';
      // if (safeSeedPhrase) {
      //   // decrypt and use it with password to create vault
      //   seedPhrase = await passworder.decrypt(password, safeSeedPhrase);
      // } else {
      //   // generete mnemonic
      //   const bip39 = require('bip39');
      //   seedPhrase = bip39.generateMnemonic();
      //   // browser-passworder to encrypt it
      //   const safeSeedPhrase = await passworder.encrypt(password, seedPhrase);
      //   // add seed to local storage
      //   localStorage.setItem(localStorageConstants.MNEMONIC, safeSeedPhrase);
      // }
      // create vault with password
      // lightwallet.keystore.createVault({ 
      //   password: password, hdPathString: HD_PATH_STRING, seedPhrase: seedPhrase
      // }, async function(err, ks) {
      //   if (err) throw err;
      //   ks.keyFromPassword(password, async (err, pwDerivedKey) => {
      //     if (!ks.isDerivedKeyCorrect(pwDerivedKey)) {
      //       throw new Error('Incorrect derived key!');
      //     }
          
      //     ks.generateNewAddress(pwDerivedKey, 1);
      //     const address = ks.getAddresses()[0];
      //     const inboxDir = inboxDirectory(address);
      //     const uploadsDir = uploadDirectory(address);
      //     await IPFSDatabase.createDirectory(inboxDir);
      //     await IPFSDatabase.createDirectory(uploadsDir);
      //     store.dispatch(setAddress(address));
      //   });
      // });
    // },

    async initUserDirectories(address) {
      // only do this if directories DO NOT EXIST?
      // const inboxDir = inboxDirectory(address);
      // const uploadsDir = uploadDirectory(address);

      // await IPFSDatabase.createDirectory(inboxDir);
      // await IPFSDatabase.createDirectory(uploadsDir);
    },

  //   async findAlias(account) {
  //       const dir = aliasDirectory(account) + 'data.txt';
  //       try {
  //         const filesResponse = await IPFSDatabase.readFile(dir);
  //         const content = String.fromCharCode(...new Uint8Array(filesResponse));
  //         const alias = content.split('=')[1];
  //         return alias;
  //       } catch (e) {
  //         return '';
  //       }
  //     },
    
  //     async findContracts(account) {
  //       const dir = contractDirectory(account) + 'contract.txt';
  //       try {
  //         return await IPFSDatabase.readFile(dir);
  //       } catch (e) {
  //         return '';
  //       }
  //     },

  //     async decryptSecretKey(account) {
  //       const encryptedSecret = localStorage.getItem(localStorageConstants.PRIV_KEY)
  //       const publicKeySender = await IPFSDatabase.readFile(
  //               publicKeyDirectory(account) + 'public-key.txt');
  //       // base 64 key
  //       const rawIrisSecretKey = process.env.REACT_APP_API_KEY;
  //       // convert to base64 string
  //       const irisSecretKey = decodeBase64(rawIrisSecretKey);
  //       const sharedKey = box.before(publicKeySender, irisSecretKey);
  //       return EncryptionService.decrypt(sharedKey, encryptedSecret);
  //   },

  //   async loadPeers() {
  //     try {
  //       const aliasesFile = await IPFSDatabase.readFile(irisResources() + 'aliases.txt');
  //       const aliases = aliasesFile.toString().split('\n');
  //       // now remove empty item
  //       aliases.pop();
  //       let aliasArray = [];
  //       for (let alias of aliases) {
  //         const name = alias.split('|')[0];
  //         const account = alias.split('|')[1];
  //         aliasArray.push(
  //           {
  //             name: name,
  //             account: account
  //           }
  //         );
  //       }
  //       return aliasArray;
  //     } catch (e) {
  //       return [];
  //     }
  // }
}

export default UserService;
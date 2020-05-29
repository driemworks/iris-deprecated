import { localStorageConstants, HD_PATH_STRING } 
from "../constants";
import passworder from 'browser-passworder';
import lightwallet from 'eth-lightwallet';

import store from '../state/store/index';
import { setVaultVars } from '../state/actions/index';
import { ApiService } from './api.service';

export const EthService = {
    async initVault(password, username, invalidUsernameCallback) {
        // retrieve mnemonic from locat storage if exists
        // generate new one if it doesn't exist
        const seedPhrase = await getSeedPhrase(password);
        // create the lightwallet vault
        lightwallet.keystore.createVault({ 
            password: password, hdPathString: HD_PATH_STRING, seedPhrase: seedPhrase
          }, async (err, ks) => {
            if (err) throw err;
            ks.keyFromPassword(password, async (err, pwDerivedKey) => {
              if (!ks.isDerivedKeyCorrect(pwDerivedKey)) {
                throw new Error('Incorrect derived key!');
              }
              // get the ethereum address
              ks.generateNewAddress(pwDerivedKey, 1);
              const address = ks.getAddresses()[0];
              const isAliasVerified = await verifyAlias(ks, pwDerivedKey, username, address);
              
              if (isAliasVerified === true) {
                store.dispatch(setVaultVars(
                  {
                    ks           : ks,
                    pwDerivedKey : pwDerivedKey,
                    address      : address,
                    alias        : username
                  }
                ));
              } else {
                invalidUsernameCallback();
              }
            });
          });
    },
}

async function getSeedPhrase(password) {
    const safeSeedPhrase = localStorage.getItem(localStorageConstants.MNEMONIC);
    let seedPhrase = '';
    if (safeSeedPhrase) {
      // decrypt and use it with password to create vault
      seedPhrase = await passworder.decrypt(password, safeSeedPhrase);
    } else {
      // generete mnemonic
      const bip39 = require('bip39');
      seedPhrase = bip39.generateMnemonic();
      // browser-passworder to encrypt it
      const safeSeedPhrase = await passworder.encrypt(password, seedPhrase);
      // add seed to local storage
      localStorage.setItem(localStorageConstants.MNEMONIC, safeSeedPhrase);
    }
    return seedPhrase;
}

async function verifyAlias(ks, pwDerivedKey, alias, address) {
  // try to get the alias from IPFS
  const userData = await getUserData(address);
  const publicKey = lightwallet.encryption.addressToPublicEncKey(ks, pwDerivedKey, address);
  if (userData.length === 0) {
    // if alias does not exist, then create data file
    await createUserData(alias, address, publicKey);
    return true;
  } 
  return userData.publicKey === publicKey;
}

async function getUserData(address) {
  // retrieve the user-data json object
  const response = await ApiService.read('iris.resources', 'user-data.json');
  // if no users exist yet
  if (!response.data[0]) {
    return [];
  }
  // verify that the alias is mapped to the address in the json 
  return response.data[0].doc.filter((entry) => {
    return entry.address = address;
  })[0];
}

async function createUserData(username, address, publicKey) {
  const userData = {
    username: username,
    address: address,
    publicKey: publicKey
  };

  await ApiService.upload('iris.resources', 'user-data.json', userData);
}


export default EthService; 
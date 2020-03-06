import { localStorageConstants, HD_PATH_STRING } from "../constants";
import passworder from 'browser-passworder';
import lightwallet from 'eth-lightwallet';

import store from '../state/store/index';
import { setVaultVars } from '../state/actions/index';
import { inboxDirectory, uploadDirectory } from '../constants';
import { IPFSDatabase } from '../db/ipfs.db';

export const EthService = {

    async initVault(password) {
        // get encrypted seedphrase
        // const encryptedSeedPhrase = localStorage.getItem(localStorageConstants.MNEMONIC);
        // const seedPhrase = await passworder.decrypt(password, encryptedSeedPhrase);
        const seedPhrase = await getSeedPhrase(password);
        console.log(seedPhrase);
        // decrypt with password
        lightwallet.keystore.createVault({ 
            password: password, hdPathString: HD_PATH_STRING, seedPhrase: seedPhrase
          }, async (err, ks) => {
            if (err) throw err;
            ks.keyFromPassword(password, async (err, pwDerivedKey) => {
              if (!ks.isDerivedKeyCorrect(pwDerivedKey)) {
                throw new Error('Incorrect derived key!');
              }

              ks.generateNewAddress(pwDerivedKey, 1);
              const address = ks.getAddresses()[0];
              // setup ipfs dirs
              // const inboxDir = inboxDirectory(address);
              const uploadsDir = uploadDirectory(address);
              // await IPFSDatabase.createDirectory(inboxDir);
              await IPFSDatabase.createDirectory(uploadsDir);
              store.dispatch(setVaultVars(
                {
                  ks           : ks,
                  pwDerivedKey : pwDerivedKey,
                  address      : address
                }
              ));
              // callback(ks, pwDerivedKey, address);
            });
          });
    }

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

export default EthService;
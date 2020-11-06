import { localStorageConstants, HD_PATH_STRING } 
from "../constants";
import passworder from 'browser-passworder';
import lightwallet from 'eth-lightwallet';

import store from '../state/store/index';
import { setVaultVars } from '../state/actions/index';
import { MercuryApiService } from "./mercury.service";

export const EthService = {
    async initVault(password) {
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
              // sign message
              const rawMessage = Math.random().toString(36).substring(7);
              const signedMessage = lightwallet.signing.signMsg(
                ks, pwDerivedKey, rawMessage, address
              );
              await MercuryApiService.login(address, rawMessage, signedMessage);
              store.dispatch(setVaultVars(
                {
                  ks           : ks,
                  pwDerivedKey : pwDerivedKey,
                  address      : address
                }
              ));
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

export default EthService; 
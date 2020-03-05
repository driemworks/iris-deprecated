import { localStorageConstants, HD_PATH_STRING } from "../constants";
import passworder from 'browser-passworder';
import lightwallet from 'eth-lightwallet';

export const EthService = {

    async ethereumAccountFunction(password, callback) {
        // get encrypted seedphrase
        const encryptedSeedPhrase = localStorage.getItem(localStorageConstants.MNEMONIC);
        const seedPhrase = await passworder.decrypt(password, encryptedSeedPhrase);
        // decrypt with password
        lightwallet.keystore.createVault({ 
            password: password, hdPathString: HD_PATH_STRING, seedPhrase: seedPhrase
          }, function(err, ks) {
            if (err) throw err;
            ks.keyFromPassword(password, (err, pwDerivedKey) => {
              if (!ks.isDerivedKeyCorrect(pwDerivedKey)) {
                throw new Error('Incorrect derived key!');
              }

              ks.generateNewAddress(pwDerivedKey, 1);
              const address = ks.getAddresses()[0];
              callback(ks, pwDerivedKey, address);
            });
          });
    }

}

export default EthService;
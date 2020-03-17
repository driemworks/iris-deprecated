import { localStorageConstants, HD_PATH_STRING, irisResources, aliasDirectory } from "../constants";
import passworder from 'browser-passworder';
import lightwallet from 'eth-lightwallet';

import store from '../state/store/index';
import { setVaultVars } from '../state/actions/index';
import { uploadDirectory } from '../constants';
import { IPFSDatabase } from '../db/ipfs.db';

export const EthService = {

    async initVault(password, alias, invalidUsernameCallback) {
        const seedPhrase = await getSeedPhrase(password);
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

              const isAliasVerified = await verifyAlias(alias, address);

              if (isAliasVerified === true) {
                store.dispatch(setVaultVars(
                  {
                    ks           : ks,
                    pwDerivedKey : pwDerivedKey,
                    address      : address,
                    alias        : alias
                  }
                ));
              } else {
                invalidUsernameCallback();
              }
            });
          });
    },

    async encrypt(data, wallet, recipientAddresses) {

    },

    async decrypt(data) {

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

async function verifyAlias(alias, address) {
  // try to get the alias from IPFS
  const aliasString = await getAlias(address);
  if (aliasString === alias) {
    // if exists and valid, return true
    return true;
  } else if (aliasString === "") {
    // if alias does not exist, then create data file
    await createAliasFile(alias, address);
    // update alias file
    await updateMasterAliasList(alias, address);
    // create uploads directory
    const uploadsDir = uploadDirectory(address);
    await IPFSDatabase.createDirectory(uploadsDir);
    const emptyUploadData = Buffer.from(JSON.stringify([]));
    await IPFSDatabase.addFile(uploadsDir, emptyUploadData, 'upload-data.json');
    return true;
  } else {
    // if exists but not valid, return false
    return false;
  }
}

async function getAlias(address) {
  try {
    const aliasFileLoc = aliasDirectory(address) + 'data.txt';
    const aliasFile = await IPFSDatabase.readFile(aliasFileLoc);
    return String.fromCharCode(...new Uint8Array(aliasFile));
  } catch (err) {
    return "";
  }
}

async function createAliasFile(alias, address) {
  const aliasFileLoc = aliasDirectory(address);
  console.log('alias dir ' + aliasFileLoc);
  await IPFSDatabase.createDirectory(aliasFileLoc);
  await IPFSDatabase.addFile(aliasFileLoc, Buffer.from(alias), 'data.txt');
}

async function updateMasterAliasList(alias, address) {
  // try to read file
  const aliasDir = irisResources();
  const newLine = alias + '|' + address + '\n';
  try {
      let aliasMasterFile = await IPFSDatabase.readFile(aliasDir + 'aliases.txt');
      aliasMasterFile += newLine;
      await IPFSDatabase.deleteFile(aliasDir + 'aliases.txt');
      await IPFSDatabase.addFile(aliasDir, Buffer.from(aliasMasterFile), 'aliases.txt');
  } catch (e) {
      await IPFSDatabase.addFile(aliasDir, Buffer.from(newLine), 'aliases.txt');
  }
}

export default EthService;
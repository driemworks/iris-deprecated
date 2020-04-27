import { localStorageConstants, HD_PATH_STRING, irisResources, aliasDirectory, inboxDirectory } from "../constants";
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

              const isAliasVerified = await verifyAlias(ks, pwDerivedKey, alias, address);

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
  const aliasString = await getAlias(address);
  console.log('alias: ' + aliasString);
  if (aliasString === "") {
    const publicKey = lightwallet.encryption.addressToPublicEncKey(ks, pwDerivedKey, address);
    // if alias does not exist, then create data file
    await createUserData(alias, publicKey, address);
    // update alias file
    await updateMasterAliasList(alias, address);
    const emptyUploadData = Buffer.from(JSON.stringify([]));
    // create uploads directory
    await IPFSDatabase.createDirectory(uploadDirectory(address, ''));
    await IPFSDatabase.writeFile(uploadDirectory(address, 'upload-data.json'), emptyUploadData);
    // create inbox directory
    await IPFSDatabase.createDirectory(inboxDirectory(address, ''));
    await IPFSDatabase.writeFile(inboxDirectory(address, 'inbox-data.json'), emptyUploadData);
    return true;
  } else if (JSON.parse(aliasString).alias === alias) {
    return true;
  } else {
    // if exists but not valid, return false
    return false;
  }
}

async function getAlias(address) {
  try {
    const aliasFileLoc = aliasDirectory(address, 'data.json');
    const aliasFile = await IPFSDatabase.readFile(aliasFileLoc);
    return String.fromCharCode(...new Uint8Array(aliasFile));
  } catch (err) {
    return "";
  }
}

async function createUserData(alias, publicKey, address) {
  const jsonData = {
    alias: alias,
    publicKey: publicKey
  };
  await IPFSDatabase.createDirectory(aliasDirectory(address));
  await IPFSDatabase.writeFile(aliasDirectory(address, 'data.json'), Buffer.from(JSON.stringify(jsonData)));
}

async function updateMasterAliasList(alias, address) {
  // try to read file
  const aliasDir = irisResources('aliases.json');
  const newLine = alias + '|' + address + '\n';
  try {
      let aliasMasterFile = await IPFSDatabase.readFile(aliasDir);
      aliasMasterFile += newLine;
      await IPFSDatabase.deleteFile(aliasDir);
      await IPFSDatabase.writeFile(aliasDir, Buffer.from(aliasMasterFile));
  } catch (e) {
      await IPFSDatabase.writeFile(aliasDir, Buffer.from(newLine));
  }
}

export default EthService;
import { localStorageConstants, HD_PATH_STRING, 
         irisResources, aliasDirectory, 
         inboxDirectory, privateUploadDirectory, publicUploadDirectory } 
from "../constants";
import passworder from 'browser-passworder';
import lightwallet from 'eth-lightwallet';

import store from '../state/store/index';
import { setVaultVars } from '../state/actions/index';
import { IPFSDatabase } from '../db/ipfs.db';
import { OrbitDBService } from '../service/ipfs.db.service';
import ipfs from '../ipfs';

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
              const publicKey = lightwallet.encryption.addressToPublicEncKey(ks, pwDerivedKey, address);
              // retrieve the docstore for the given username
              const OrbitDB = require('orbit-db');
              const orbitdb = await OrbitDB.createInstance(ipfs);
              const docstore = await orbitdb.docstore(username, { indexBy: 'name' });
              await docstore.events.on('ready', (dbname, heads) => {
                console.log('hello I am ready');
                // // if user-data.json DNE => proceed (we have a new user)
                // const userDataDocument = await OrbitDBService.getById(docstore, 'upload-data.json');
                // if (userDataDocument.length === 0) {
                //   // create user data
                //   await createUserData(username, address, publicKey, docstore);
                //   console.log('creating new data');
                //   debugger;
                // } else {
                //   // verify public keys match
                //   console.log('xistsedata already' + userDataDocument);
                //   debugger;
                // }
              });
              docstore.load();
              
              // if user-data.json exists => validate if public keys match


              // const isAliasVerified = await verifyAlias(ks, pwDerivedKey, alias, address);

              // if (isAliasVerified === true) {
              //   store.dispatch(setVaultVars(
              //     {
              //       ks           : ks,
              //       pwDerivedKey : pwDerivedKey,
              //       address      : address,
              //       alias        : alias
              //     }
              //   ));
              // } else {
              //   invalidUsernameCallback();
              // }
            });
          });
    },
}

async function seedPhraseExists() {
  return localStorage.getItem(localStorageConstants.MNEMONIC) === '';
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
  if (aliasString === "") {
    const publicKey = lightwallet.encryption.addressToPublicEncKey(ks, pwDerivedKey, address);
    // if alias does not exist, then create data file
    await createUserData(alias, publicKey, address);
    // update alias file
    // await updateMasterAliasList(alias, address);
    const emptyUploadData = Buffer.from(JSON.stringify([]));
    // create uploads directory
    await IPFSDatabase.createDirectory(privateUploadDirectory(address, ''));
    await IPFSDatabase.writeFile(privateUploadDirectory(address, 'upload-data.json'), emptyUploadData);
    // create public uploads directory
    await IPFSDatabase.createDirectory(publicUploadDirectory(address, ''));
    await IPFSDatabase.writeFile(publicUploadDirectory(address, 'upload-data.json'), emptyUploadData);
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

async function createUserData(username, address, publicKey, docstore) {
  const userData = {
    username: username,
    address: address,
    publicKey: publicKey
  };
  // get docstore
  await OrbitDBService.put(docstore, [{ id: 'user-data.json', doc: JSON.stringify(userData) }]);

}


export default EthService; 
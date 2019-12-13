import React, { Component } from "react";
import ipfs from './ipfs';
import { If, Else, Elif } from 'rc-if-else';
import { box, randomBytes } from 'tweetnacl';
import {
  decodeUTF8,
  encodeUTF8,
  decodeBase64,
  encodeBase64
} from 'tweetnacl-util';
import { EncryptionUtils } from './encryption/encrypt.service';
import { IPFSDatabase } from './db/ipfs.db';

import EncryptionKeys from './contracts/EncryptionKeys.json';
import getWeb3 from "./utils/getWeb3";
import truffleContract from '@truffle/contract';
import ProgressBar from 'react-bootstrap/ProgressBar'
import Select from 'react-select';

import "./App.css";
const pullToPromise = require('pull-to-promise');

class App extends Component {

  fileSize = 0;
  accountsSelector = [];
  contractMap = [];

  constructor(props) {
    super(props);
    this.state = { 
      defaultAccount: "",
      storageValue: 0,
      ipfsNodeId: "",
      ipfsHash: "",
      file: null,
      ipfsMessage: "",
      ipfsDataType: "",
      receivedIPFS: "",
      dirHash: "",
      ipfsPeers: null,
      pairA: null,
      pairB: null,
      sharedA: null,
      sharedB: null,
      encryptedMessage: null,
      web3: null,
      accounts: null,
      contract: null,
      keysGenerated: true,
      now: 0,
      uploadingFile: false,
      selectedAccount: "",
      inbox: []
    };
  }

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();
      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();
      let i = 1;
      accounts.forEach(account => {
        // generate keys for each account
        // and deploy the contract for each
        this.generateKeys(account);
        this.accountsSelector.push(
          {label: account, value: i}
        );
        i += 1;
        console.log('contract map ' + JSON.stringify(this.contractMap));
      });
      
      this.setState({ web3: web3, accounts: accounts, defaultAccount: accounts[0] });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }

    // QmPeq9vPMCE93T1Jxcd2N9cbA7wu8FmyVTEg7LTwB2wHEo
    const identity = await ipfs.id();
    this.setState({ipfsNodeId: identity.id});
    const dirName = '/content/' + this.state.defaultAccount + '/inbox';
    await IPFSDatabase.deleteDirectory(dirName);
    await IPFSDatabase.createDirectory(dirName);
    // bind functions
    this.progress = this.progress.bind(this);
    // this.selectAccount = this.selectAccount.bind(this);
  };

  /**
   * Deploy the encryption keys contract
   * @param {*} _gas 
   * @param {*} sharedA 
   * @param {*} sharedB 
   */
  async deployContract(_gas, publicKey, privateKey, account) {
    const Contract = truffleContract(EncryptionKeys);
    // const Contract = this.web3.contract(EncryptionKeys.abi);
    Contract.setProvider(this.state.web3.currentProvider);
    await Contract.new(publicKey, privateKey, 
      { from: account })
      .then(instance => {
        const address = instance.address;
        this.contractMap.push({ address: account, contractAddress: address });
    }).catch(err => {
      console.log('Contract failed to deploy ', JSON.stringify(err));
    });
  }

  /**
   * Upload a file
   * @param event 
   */
  async captureFile(event) {
    event.stopPropagation();
    event.preventDefault();

    // this.setState({ uploadingFile: true });
    const file = await event.target.files[0];
    // const uploadFileSize = event.target.files[0].size;
    // console.log('file size ' + uploadFileSize);
    this.setState({ uploadingFile: true, file: file });

    let reader = new window.FileReader();
    reader.readAsArrayBuffer(file);
    reader.onloadend = () => {
      this.convertToBuffer(reader); 
    }

    this.setState({uploadFileName: file.name, uploadingFile: false });
  }

  /**
   * convert the reader to a buffer and set the state
   */
  convertToBuffer = async(reader) => {
    console.log('sending from account ' + this.state.defaultAccount);
    console.log('sending TO account ' + this.state.selectedAccount);
    const buffer = await Buffer.from(reader.result);
    // get the hash from the contractMap array
    const recipientContractAddress = await this.findContractAddressForAccount(this.state.selectedAccount);
    const senderContractAddress = await this.findContractAddressForAccount(this.state.defaultAccount);
    
    if (recipientContractAddress !== '' && senderContractAddress !== '') {
      const sharedEncryptionKey = await this.createSharedKeyEncryption(
        senderContractAddress, recipientContractAddress
      );
      // // encrypt the buffer
      const encrypted = EncryptionUtils.encrypt(sharedEncryptionKey, buffer);
      this.setState({encryptedMessage: encrypted});
      this.setState({buffer});
    } else {
      alert('Could not find a public/private keys for the specified account');
    }
  }

  findContractAddressForAccount = (account) => {
    let address = '';
    this.contractMap.forEach(entry => {
      if (entry.address === account) {
        address = entry.contractAddress;
      }
    });
    return address;
  } 

  async getContract(address) {
    const contract = truffleContract(EncryptionKeys);
    contract.setProvider(this.state.web3.currentProvider);
    return await contract.at(address);
  }

  async createSharedKeyEncryption(senderContractAddress, recipientContractAddress) {
    // sender secret key
    const senderContract = await this.getContract(senderContractAddress);
    const secretKeySendingAccount = await senderContract.getPrivateKey(
      { from: this.state.defaultAccount }
    );

    // recipient public key
    const recipientContract = await this.getContract(recipientContractAddress);
    const publicKeySelectedAccount = await recipientContract.getPublicKey(
      { from: this.state.selectedAccount }
    );

    const publicKeyRecipient = decodeBase64(publicKeySelectedAccount.logs[0].args['0']);
    const secretKeySender = decodeBase64(secretKeySendingAccount.logs[0].args['0']);
    // create shared key
    return box.before(
      publicKeyRecipient,
      secretKeySender
    );
  }

  async createSharedKeyDecryption(senderContractAddress, recipientContractAddress) {
    // sender public key
    const senderContract = await this.getContract(senderContractAddress);
    const publicKeySendingAccount = await senderContract.getPublicKey(
      { from: this.state.defaultAccount }
    );

    // recipient secret key
    const recipientContract = await this.getContract(recipientContractAddress);
    const secretKeySelectedAccount = await recipientContract.getPrivateKey(
      { from: this.state.selectedAccount }
    );

    const secretKeyRecipient = decodeBase64(secretKeySelectedAccount.logs[0].args['0']);
    const publicKeySender = decodeBase64(publicKeySendingAccount.logs[0].args['0']);
    // create shared key
    return box.before(
      publicKeySender,
      secretKeyRecipient
    );
  }

  /**
   * Add the uploaded file to IPFS
   */
  async onIPFSSubmit(event) {
    event.preventDefault();
    const dir = '/content/' + this.state.defaultAccount + '/inbox/';
    console.log('adding file to directory ' + dir);
    const res = await IPFSDatabase.addFile(
      '/content/' + this.state.defaultAccount + '/inbox/', 
      this.state.encryptedMessage,
      this.state.uploadFileName
    );
    console.log('ipfs upload response ' + JSON.stringify(res));
    // await ipfs.add(
    //   {
    //     path: '/tmp/' + this.state.uploadFileName,
    //     content: this.state.encryptedMessage
    //   }, { progress: this.progress }, async (err, res) => {
    //     const ipfsHash = res[1].hash;
    //     const contract = await this.getContract(
    //       await this.findContractAddressForAccount(this.state.defaultAccount)
    //     );
    //     await contract.addToInbox(ipfsHash, {from:this.state.defaultAccount});
    //     this.setState({ipfsHash: ipfsHash});
    //     this.readInbox(this.state.defaultAccount);
    //   }
    // );
    
  }

  progress(progress) {
    console.log('progress ' + progress + ' of ' + this.state.file.size * 10);
    console.log('progress ' + progress/(this.state.file.size * 10));
    // console.log(this.fileSize);
  }

  async retrieveIPFS() {
    // event.preventDefault();
    const dir = '/content/' + this.state.defaultAccount + '/inbox/';
    console.log('reading from directory ' + dir);
    const stream = await IPFSDatabase.readFilesInDirectory(dir);
    const files = await pullToPromise.any(stream);
    console.log('files ' + JSON.stringify(files));
    // console.log('DIR CONTENT ' + JSON.stringify(dirContent));
    // const files = await ipfs.get(this.state.ipfsHash);
    // const files = await IPFSDatabase.readFile('', )
    // for (const res of files) {
    //   if (res.content) {
    //     const path = res.path;
    //     const type = path.split(".")[1];
    //     this.setState({ipfsDataType: type});
        
    //     const content = res.content;

    //     // get decryption key
    //     const recipientContractAddress = this.findContractAddressForAccount(this.state.selectedAccount);
    //     const senderContractAddress = this.findContractAddressForAccount(this.state.defaultAccount);
    //     const sharedDecryptionKey = await this.createSharedKeyDecryption(senderContractAddress, recipientContractAddress);

    //     const decryptedContent = EncryptionUtils.decrypt(sharedDecryptionKey, content); 
    //     const message = String.fromCharCode(...new Uint8Array(decryptedContent.data));
    //     // if (type === "txt") {
    //     //    this.setState({ipfsMessage: message});
    //     // } else if (type === "jpg") {
    //     //   // convert byte array to base64
    //     //   const base64String = btoa(message);
    //     //   const msgString = 'data:image/jpg;base64, ' + base64String;
    //     //   this.setState({ipfsMessage: msgString});
    //     // }
    //   }
    // };
  }

  generateKeys = async(account) => {
    const pairA = await EncryptionUtils.generateKeyPair();
    let publicKey = pairA.publicKey;
    let secretKey = pairA.secretKey;

    this.setState({ keysGenerated: true });
    const publicKeyAsString = encodeBase64(publicKey);
    const privateKeyAsString = encodeBase64(secretKey);
    this.deployContract(10000, publicKeyAsString, privateKeyAsString, account);
  }

  selectAccount(account) {
    this.setState({selectedAccount: account });
  }

  async setDefaultAccount(account) {
    console.log('setting default account ' + account.label);
    this.setState({ defaultAccount: account.label });
    // this.readInbox(this.state.defaultAccount);
    // const dirContent = await IPFSDatabase.readDirectory(
    //   '/content/' + this.state.defaultAccount + '/inbox'
    // );
    await this.retrieveIPFS();
    // console.log('DIR CONTENT ' + JSON.stringify(dirContent));
  }

  async readInbox(account) {
    const address = await this.findContractAddressForAccount(this.state.defaultAccount);
    console.log('address ' + address);
    const senderContract = await this.getContract(address);
    const inbox = await senderContract.readInbox({from: this.state.defaultAccount});
    console.log('INBOX ' + JSON.stringify(inbox.logs[0].args['0']));
    this.setState({inbox: inbox.logs[0].args['0']});
  }

  render() {
    if (!this.state.ipfsNodeId) {
      return (
        <div>
          <p>You are not connected to an IPFS daemon. Make sure you have an IPFS daemon running locally.</p>
          <p>Try running ipfs daemon in a terminal.</p>
        </div>
      );
    }
    const type = this.state.ipfsDataType;
    const data = this.state.ipfsMessage;
    const accounts = this.state.accounts;
    return (
      <div className="App">
        <div className="header">
          <div className="left ipfs-account">
            <p className="hash-text">Your node id: {this.state.ipfsNodeId}</p>
          </div>
          <div className="right ethereum-account-selector">
            <p className="hash-text">Selected ethereum account:</p>
            <Select className="dropdown"
                    options={this.accountsSelector}
                    onChange={this.setDefaultAccount.bind(this)}>
             </Select>
          </div>

        </div>
        <div>
          <If condition={this.state.keysGenerated === false}>
            <button onClick={() => this.generateKeys(this.state.defaultAccount)}>
              Generate Encryption Keys
            </button>
            <Else>
              <div className="app-container">
                <div className="ipfs-inbox-container">
                  IPFS Inbox
                  <If condition={this.state.inbox === null}>
                    <p>You have no messages in your inbox.</p>
                    <Else>
                      <ul>
                          {this.state.inbox.map((item, key) => (
                            <li key={key}>
                              <div>
                                {item}
                                <button>
                                  Download
                                </button>
                                <button>
                                  Delete
                                </button>
                              </div>
                            </li>
                          ))}
                      </ul>
                  </Else>
                  </If>
                </div>
                <div className="ipfs-messaging-container">
                  <h2>Securely send a file to an account</h2>
                  <div>
                    <If condition={this.state.accounts !== null}>
                      <h4>Select recipients</h4>
                        {this.state.accounts.map(account =>
                          <div>
                            <button onClick={() => {this.selectAccount(account)}}>
                              {account}
                            </button>
                          </div>
                        )}
                    </If>
                  </div>
                  <h4>
                    Selected recipient:
                  </h4>
                  <p>
                    {this.state.selectedAccount}
                  </p>
                  <If condition={this.state.selectedAccount !== ''}>
                    <form id="ipfs-hash-form" className="scep-form" onSubmit={this.onIPFSSubmit.bind(this)}>
                      <input type="file" onChange={this.captureFile.bind(this)} />
                      <button type="submit">
                        Send it!
                      </button>
                    </form>
                    {/* <If condition={this.state.uploadingFile === true}>
                      <ProgressBar striped variant="success" now={this.state.now}></ProgressBar>
                    </If> */}
                    {/* <If condition={this.state.ipfsHash !== ""}> */}
                      {/* <p>
                        SENT!
                      </p>
                      <p>
                        The IPFS hash is: {this.state.ipfsHash}
                      </p> */}
                    {/* </If> */}
                    {/* <button onClick={this.retrieveIPFS.bind(this)}>
                      Get uploaded data
                    </button>
                    <If condition={type === 'txt'}>
                      <p>{data}</p>
                    </If>
                    <If condition={type === 'jpg' || type === 'png'}>
                      <img className="ipfs-image" src={data}></img>
                    </If> */}
                  </If>
                </div>
              </div>
          </Else>
          </If>
        </div>
      </div>
    );
  }
}

export default App;

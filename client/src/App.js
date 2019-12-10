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

import EncryptionKeys from './contracts/EncryptionKeys.json';
import getWeb3 from "./utils/getWeb3";
import truffleContract from '@truffle/contract';
import ProgressBar from 'react-bootstrap/ProgressBar'
import Select from 'react-select';

import "./App.css";

class App extends Component {

  fileSize = 0;

  contractMap = [];

  constructor(props) {
    super(props);
    this.state = { 
      storageValue: 0,
      ipfsNodeId: "",
      ipfsResponse: null,
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
      selectedAccount: ""
    };
  }

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();
      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();
      accounts.forEach(account => {
        // generate keys for each account
        // and deploy the contract for each
        this.generateKeys(account);
        console.log('contract map ' + JSON.stringify(this.contractMap));
      });
      // let accountsList = [];
      // accounts.forEach(account => {
      //   accountsList.push({ value: account, label: account});
      // });
      // const networkId = await web3.eth.net.getId();
      this.setState({ web3: web3, accounts: accounts });
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
    console.log('deploying contract!');
    const Contract = truffleContract(EncryptionKeys);
    // const Contract = this.web3.contract(EncryptionKeys.abi);
    Contract.setProvider(this.state.web3.currentProvider);
    await Contract.new(publicKey, privateKey, 
      { from: account })
      .then(instance => {
        console.log('contract deployed successfully!');
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
    console.log('sending from account ' + this.state.accounts[0]);
    console.log('sending TO account ' + this.state.selectedAccount);
    const buffer = await Buffer.from(reader.result);
    // get the hash from the contractMap array
    const recipientContractAddress = await this.findContractForAccount(this.state.selectedAccount);
    const senderContractAddress = await this.findContractForAccount(this.state.accounts[0]);
    // this.contractMap.forEach(entry => {
    //   if (entry.address === this.state.selectedAccount) {
    //     recipientContractAddress = entry.contractAddress;
    //     console.log('retrieved address: ' + recipientContractAddress);
    //   }
    // });

    // this.contractMap.forEach(entry => {
    //   if (entry.address === this.state.accounts[0]) {
    //     senderContractAddress = entry.contractAddress;
    //     console.log('retrieved sender address ' + senderContractAddress)
    //   }
    // });

    if (recipientContractAddress !== '' && senderContractAddress !== '') {
      // const contract = truffleContract(EncryptionKeys);
      // contract.setProvider(this.state.web3.currentProvider);
      // // const contract = this.web3.eth.contract(EncryptionKeys.abi).at(senderContractAddress);
      // let senderInst = await contract.at(senderContractAddress);
      // const secretKeySendingAccount = await senderInst.getPrivateKey(
      //   { from: this.state.accounts[0] }
      // );

      // let recipientInst = await contract.at(recipientContractAddress);
      // // get key from public key recipient's contract
      // const publicKeySelectedAccount = await recipientInst.getPublicKey(
      //   { from: this.state.selectedAccount }
      // );

      // console.log('public key selected account ' + JSON.stringify(publicKeySelectedAccount));

      // // const encoder = new TextEncoder();
      // // let publicKeyRecipient = encoder.encode(publicKeySelectedAccount.logs[0].args['0']);
      // // let secretKeySender = encoder.encode(secretKeySendingAccount.logs[0].args['0']);
      // // console.log('secretKeySender ' + secretKeySender);
      // const publicKeyRecipient = decodeBase64(publicKeySelectedAccount.logs[0].args['0']);
      // const secretKeySender = decodeBase64(secretKeySendingAccount.logs[0].args['0']);
      // // create shared key
      // const sharedKey = box.before(
      //   publicKeyRecipient,
      //   secretKeySender
      // );
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

  findContractForAccount = (account) => {
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
    // const contract = this.web3.eth.contract(EncryptionKeys.abi).at(senderContractAddress);
    return await contract.at(address);
    // return secretKeySendingAccount = await senderInst.getPrivateKey({ from: account });
  }

  async createSharedKeyEncryption(senderContractAddress, recipientContractAddress) {
    // sender secret key
    const senderContract = await this.getContract(senderContractAddress);
    const secretKeySendingAccount = await senderContract.getPrivateKey(
      { from: this.state.accounts[0] }
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
      { from: this.state.accounts[0] }
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
  onIPFSSubmit = async(event) => {
    event.preventDefault();
    await ipfs.add(
      {
        path: '/tmp/' + this.state.uploadFileName,
        content: this.state.encryptedMessage
      }, { progress: this.progress }, (err, res) => {
        console.log(JSON.stringify(res));
        this.setState({ipfsHash: res[1].hash});
      }
    );
  }

  progress(progress) {
    console.log('progress ' + progress + ' of ' + this.state.file.size * 10);
    console.log('progress ' + progress/(this.state.file.size * 10));
    // console.log(this.fileSize);
  }

  async retrieveIPFS(event) {
    event.preventDefault();

    const files = await ipfs.get(this.state.ipfsHash);
    for (const res of files) {
      if (res.content) {
        const path = res.path;
        const type = path.split(".")[1];
        this.setState({ipfsDataType: type});
        
        const content = res.content;

        // get decryption key
        const recipientContractAddress = this.findContractForAccount(this.state.selectedAccount);
        const senderContractAddress = this.findContractForAccount(this.state.accounts[0]);
        const sharedDecryptionKey = await this.createSharedKeyDecryption(senderContractAddress, recipientContractAddress);

        const decryptedContent = EncryptionUtils.decrypt(sharedDecryptionKey, content); 
        const message = String.fromCharCode(...new Uint8Array(decryptedContent.data));
        if (type === "txt") {
           this.setState({ipfsMessage: message});
        } else if (type === "jpg") {
          // convert byte array to base64
          const base64String = btoa(message);
          const msgString = 'data:image/jpg;base64, ' + base64String;
          this.setState({ipfsMessage: msgString});
        }
      }
    };
  }

  makeDir = async() => {
    const dir = await ipfs.files.mkdir('/content');
    console.log('directory created? ' + JSON.stringify(dir));
    const stat = await ipfs.files.stat('/content');
    console.log('STAT ' + JSON.stringify(stat.hash));
  }

  deleteDir = async() => {
    const dir = await ipfs.files.rm('/content', { recursive: true });
    console.log('directory deleted? ' + JSON.stringify(dir));
  }

  viewDirContents = async() => {
    const ls = await ipfs.files.ls('/content');
    console.log('contents: ' + JSON.stringify(ls));
  }

  generateKeys = async(account) => {
    const pairA = await EncryptionUtils.generateKeyPair();
    // const pairB = EncryptionUtils.generateKeyPair();
    // const sharedA = box.before(pairB.publicKey, pairA.secretKey);
    // const sharedB = box.before(pairA.publicKey, pairB.secretKey);
    let publicKey = pairA.publicKey;
    let secretKey = pairA.secretKey;
    console.log('secret Key ' + secretKey);

    this.setState({ keysGenerated: true });
    // then store the keys in a contract
    // use TextDecoder to convert Uint8Array to string
    // const decoder = new TextDecoder();
    const publicKeyAsString = encodeBase64(publicKey);
    const privateKeyAsString = encodeBase64(secretKey);
    this.deployContract(10000, publicKeyAsString, privateKeyAsString, account);
  }

  selectAccount(account) {
    this.setState({selectedAccount: account });
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
        <div>
          <p>Your node id: {this.state.ipfsNodeId}</p>
          <p>Default ethereum account: {this.state.accounts[0]}</p>
        </div>
        <div>
          <If condition={this.state.keysGenerated === false}>
            <button onClick={() => this.generateKeys(this.state.accounts[0])}>
              Generate Encryption Keys
            </button>
            <Else>
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
                <form id="ipfs-hash-form" className="scep-form" onSubmit={this.onIPFSSubmit}>
                  <input type="file" onChange={this.captureFile.bind(this)} />
                  <button type="submit">
                    Send it!
                  </button>
                </form>
                <If condition={this.state.uploadingFile === true}>
                  <ProgressBar striped variant="success" now={this.state.now}></ProgressBar>
                </If>
                <p>
                  The IPFS hash is: {this.state.ipfsHash}
                </p>
                <button onClick={this.retrieveIPFS.bind(this)}>
                  Get uploaded data
                </button>
                <If condition={type === 'txt'}>
                  <p>{data}</p>
                </If>
                <If condition={type === 'jpg'}>
                  <p>Image here!</p>
                  <img className="ipfs-image" src={data}></img>
                </If>
              </If>
          </Else>
          </If>
        </div>
      </div>
    );
  }
}

export default App;

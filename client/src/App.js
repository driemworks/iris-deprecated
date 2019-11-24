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


import "./App.css";

class App extends Component {

  // EncryptionKeysContract = truffleContract(EncryptionKeys);

  constructor(props) {
    super(props);
    this.state = { 
      storageValue: 0,
      ipfsNodeId: "",
      ipfsResponse: null,
      uploadFileName: "",
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
      contract: null
    };
  }

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();
      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();
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
    // if no id found -> not connected to ipfs daemon
    if (identity) {
      await this.deleteDir();
      await this.makeDir();
      // generate encryption/decryption keys
      const pairA = EncryptionUtils.generateKeyPair();
      const pairB = EncryptionUtils.generateKeyPair();
      const sharedA = box.before(pairB.publicKey, pairA.secretKey);
      const sharedB = box.before(pairA.publicKey, pairB.secretKey);
      console.log('generated keys');
      this.setState({pairA, pairB, sharedA, sharedB});

      const sharedAString = String.fromCharCode(null, sharedA);
      const sharedBString = String.fromCharCode(null, sharedB);
      const contract = await this.deployContract(10000, sharedAString, sharedBString);
      this.setState({contract: contract});
    }
  };

  /**
   * Deploy the encryption keys contract
   * @param {*} _gas 
   * @param {*} sharedA 
   * @param {*} sharedB 
   */
  async deployContract(_gas, sharedA, sharedB) {
    console.log('deploying contract!');
    const Contract = truffleContract(EncryptionKeys);
    Contract.setProvider(this.state.web3.currentProvider);
    await Contract.new(sharedA, sharedB, 
      { from: this.state.accounts[0] })
      .then(instance => {
        console.log('contract deployed successfully');
    }).catch(err => {
      console.log('Contract failed to deploy ', err);
    });
    const instance = await Contract.deployed();
    return instance;
  }

  /**
   * Upload a file
   * @param event 
   */
  captureFile(event) {
    event.stopPropagation();
    event.preventDefault();

    const file = event.target.files[0];
    let reader = new window.FileReader();
    reader.readAsArrayBuffer(file);
    reader.onloadend = () => {
      this.convertToBuffer(reader); 
    }
    this.setState({uploadFileName: file.name});
  }

  /**
   * convert the reader to a buffer and set the state
   */
  convertToBuffer = async(reader) => {
    const buffer = await Buffer.from(reader.result);
    // get key from contract
    const key = await this.state.contract.getEncryptionKey({from: this.state.accounts[0]});
    console.log('retrieved key: ' + key);
    // encrypt the buffer
    const encrypted = EncryptionUtils.encrypt(this.state.sharedA, buffer);
    this.setState({encryptedMessage: encrypted});
    this.setState({buffer});
  }

  /**
   * Add the uploaded file to IPFS
   */
  onIPFSSubmit = async(event) => {
    event.preventDefault();
    await ipfs.add(
      {
        path: '/content/' + this.state.uploadFileName,
        // content: this.state.buffer
        content: this.state.encryptedMessage
      }, (err, res) => {
        // console.log(JSON.stringify(res));
        this.setState({ipfsHash: res[1].hash});
      }, progress => {
        console.log('progress ' + JSON.stringify(progress));
      }
    );
    await this.viewDirContents();
  }

  retrieveIPFS = async(event) => {
    event.preventDefault();

    const files = await ipfs.get(this.state.ipfsHash);
    files.forEach(res => {
      if (res.content) {
        const path = res.path;
        const type = path.split(".")[1];
        this.setState({ipfsDataType: type});
        
        const content = res.content;
        const decryptedContent = EncryptionUtils.decrypt(this.state.sharedB, content); 
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
    });
  }

  async makeDir() {
    const dir = await ipfs.files.mkdir('/content');
    console.log('directory created? ' + JSON.stringify(dir));
    const stat = await ipfs.files.stat('/content');
    console.log('STAT ' + JSON.stringify(stat.hash));
  }

  async deleteDir() {
    const dir = await ipfs.files.rm('/content', { recursive: true });
    console.log('directory deleted? ' + JSON.stringify(dir));
  }

  async viewDirContents() {
    const ls = await ipfs.files.ls('/content');
    console.log('contents: ' + JSON.stringify(ls));
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
    return (
      <div className="App">
        <p>Your node id: {this.state.ipfsNodeId}</p>
        <p>Default ethereum account: {this.state.accounts[0]}</p>
        <h2>Add a file to IPFS</h2>
        <form id="ipfs-hash-form" className="scep-form" onSubmit={this.onIPFSSubmit}>
          <input type="file" onChange={this.captureFile.bind(this)} />
          <button type="submit">
            Send it!
          </button>
        </form>
        <p>
          The IPFS hash is: {this.state.ipfsHash}
        </p>
        <button onClick={this.retrieveIPFS}>
          Get uploaded data
        </button>
        <If condition={type === 'txt'}>
          <p>{data}</p>
        </If>
        <If condition={type === 'jpg'}>
          <p>Image here!</p>
          <img className="ipfs-image" src={data}></img>
        </If>
      </div>
    );
  }
}

export default App;

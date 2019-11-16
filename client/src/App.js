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
// const tou8 = require('buffer-to-uint8array');

import "./App.css";

class App extends Component {

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
      ipfsPeers: null,
      pairA: null,
      pairB: null,
      sharedA: null,
      sharedB: null,
      encryptedMessage: null
    };
  }

  componentDidMount = async () => {
    // QmPeq9vPMCE93T1Jxcd2N9cbA7wu8FmyVTEg7LTwB2wHEo
    const identity = await ipfs.id();
    this.setState({ipfsNodeId: identity.id});

    // if no id found -> not connected to ipfs daemon
    if (identity) {
    // create master file => really a one time thing
    // what should the file system look like???
    // node-hash/content-hash-list
    // await ipfs.files.mkdir(this.state.ipfsNodeId + '/');

    // generate cryptographic keys with tweetnacl
    // const keys = box.keyPair();
    // console.log('Generated keys ' + JSON.stringify(keys));

    // const obj = {hello: 'encryption'};
    // console.log('oject to encrypt ' + JSON.stringify(obj));

    // generate keys
    const pairA = this.generateKeyPair();
    const pairB = this.generateKeyPair();
    const sharedA = box.before(pairB.publicKey, pairA.secretKey);
    const sharedB = box.before(pairA.publicKey, pairB.secretKey);
    this.setState({pairA, pairB, sharedA, sharedB});

    // // encrypt 
    // const encrypted = this.encrypt(sharedA, obj);
    // console.log('encrypted object ' + JSON.stringify(encrypted));

    // // decrypt
    // const decrypted = this.decrypt(sharedB, encrypted);
    // console.log('decrypted! ' + JSON.stringify(decrypted));

    // const peers = await ipfs.swarm.peers();
    // // console.log('peers ' + JSON.stringify(peers.peer));
    // let peerIds = [];
    // peers.forEach(peer => {
    //   peerIds.push(peer.peer);
    // });

    // console.log('PEER IDS ' + JSON.stringify(peerIds));
    // this.setState({ipfsPeers: await ipfs.swarm.peers()})

    }
  };

  newNonce = () => randomBytes(box.nonceLength);
  generateKeyPair = () => box.keyPair();

  /**
   * Encrypt the json with the given keys
   * @param {*} secretOrSharedKey 
   * @param {*} json 
   * @param {*} key 
   */
  encrypt(secretOrSharedKey, json, key) {
    const nonce = this.newNonce();
    const messageUint8 = decodeUTF8(JSON.stringify(json));
    const encrypted = key ? box(messageUint8, nonce, key, secretOrSharedKey) 
                          : box.after(messageUint8, nonce, secretOrSharedKey);
    
    const fullMessage = new Uint8Array(nonce.length + encrypted.length);
    fullMessage.set(nonce);
    fullMessage.set(encrypted, nonce.length);

    const base64FullMessage = encodeBase64(fullMessage);
    // console.log(base64FullMessage);
    return base64FullMessage;
  }

  /**
   * Decrypt the message with the given keys
   * @param {*} secretOrSharedKey 
   * @param {*} messageWithNonce 
   * @param {*} key 
   */
  decrypt(secretOrSharedKey, messageWithNonce, key) {
    const messageWithNonceAsUint8Array = decodeBase64(messageWithNonce);
    const nonce = messageWithNonceAsUint8Array.slice(0, box.nonceLength);
    const message = messageWithNonceAsUint8Array.slice(box.nonceLength, 
      messageWithNonce.length);

    const decrypted = key ? box.open(message, nonce, key, secretOrSharedKey)
                          : box.open.after(message, nonce, secretOrSharedKey);

    if (!decrypted) {
      throw new Error('Could not decrypt message.');
    }

    const base64DecryptedMessage = encodeUTF8(decrypted);
    return JSON.parse(base64DecryptedMessage);
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
    // encrypt the buffer
    const encrypted = this.encrypt(this.state.sharedA, buffer);
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
        path: '/tmp/' + this.state.uploadFileName,
        // content: this.state.buffer
        content: this.state.encryptedMessage
      }, (err, res) => {
        // console.log(JSON.stringify(res));
        this.setState({ipfsHash: res[1].hash});
      }, progress => {
        console.log('progress ' + JSON.stringify(progress));
      }
    );
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
        const decryptedContent = this.decrypt(this.state.sharedB, content); 
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

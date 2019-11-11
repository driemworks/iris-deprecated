import React, { Component } from "react";
// import SimpleStorageContract from "./contracts/SimpleStorage.json";
import IPFSInboxContract from "./contracts/IPFSInbox.json";
import getWeb3 from "./utils/getWeb3";

// new imports start
import truffleContract from '@truffle/contract';
import ipfs from './ipfs';

import "./App.css";
import { read } from "fs";

class App extends Component {
  // move to constructor?
  // state = { storageValue: 0, web3: null, accounts: null, contract: null, ipfsHash: null };

  constructor(props) {
    super(props);
    this.state = { 
      storageValue: 0, 
      web3: null, 
      accounts: null, 
      contract: null, 
      ipfsHash: null,
      formIPFS: "",
      formAddress: "",
      receivedIPFS: ""
    };

    // register handlers
    this.handleChangeAddress = this.handleChangeAddress.bind(this);
    this.handleChangeIPFS.bind(this);
    this.handleSend.bind(this);
    this.handleReceiveIPFS.bind(this);
  }

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();
      // Get the contract instance.
      const networkId = await web3.eth.net.getId();

      const contract = truffleContract(IPFSInboxContract);

      console.log('Loaded contract sucesfully');

      contract.setProvider(web3.currentProvider);
      const instance = await contract.deployed();

      this.setState({ web3: web3, accounts: accounts, contract: instance });
      this.setEventListeners();
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  /*

    NEW CODE START

  */

  handleChangeAddress(event) {
    this.setState({formAddress: event.target.value});
  }

  handleChangeIPFS(event) {
    this.setState({formIPFS: event.target.value});
  }

  handleSend(event) {
    event.preventDefault();
    const contract = this.state.contract;
    const account = this.state.accounts[0];

    // document.getElementById('new-notification-form').requestFullscreen();
    this.setState({showNotification: true});
    // contract.sendIPFS(this.state.formAddress, this.state.formIPFS, {from: account})
    contract.sendIPFS(account, this.state.formIPFS, {from: account})
      .then(result => {
        this.setState({formAddress: ""});
        this.setState({formIPFS: ""});
      });
  }

  handleReceiveIPFS(event) {
    event.preventDefault();
    console.log('handle receive ipfs');
    const contract = this.state.contract;
    const account = this.state.accounts[0];
    contract.checkInbox({from: account});
  }


  captureFile(event) {
    event.stopPropagation();
    event.preventDefault();

    const file = event.target.files[0];
    // this.asyncPromiseThing(file);
    let reader = new window.FileReader();
    reader.readAsArrayBuffer(file);
    reader.onloadend = () => {
      this.convertToBuffer(reader); 
    }
  }

  setEventListeners() {
    console.log('setting event listeners');
    this.state.contract.inboxResponse().on('data', result => {
      console.log('setEventListener: set received ipfs: ' + JSON.stringify(result));
      this.setState({receivedIPFS: result.args[0]})
    });
  }

  convertToBuffer = async(reader) => {
    const buffer = await Buffer.from(reader.result);
    this.setState({buffer});
  }

  onIPFSSubmit = async(event) => {
    event.preventDefault();
    await ipfs.add(this.state.buffer, (err, ipfsHash) => {
      console.log(err, ipfsHash);
      this.setState({ ipfsHash: ipfsHash[0].hash })
    });
  }

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h2>1. Add a file to IPFS here.</h2>
        <form id="ipfs-hash-form" className="scep-form" onSubmit={this.onIPFSSubmit}>
          <input type="file" onChange={this.captureFile.bind(this)} />
          <button type="submit">
            Send it!
          </button>
        </form>
        <p>
          The IPFS hash is: {this.state.ipfsHash}
        </p>
        <h2> 2. Send notifications here </h2>
          <form id="new-notification-form" className="scep-form" onSubmit={this.handleSend.bind(this)}>
            <label>
              Receiver Address:
              <input type="text" value={this.state.value} onChange={this.handleChangeAddress.bind(this)} />
            </label>
            <label>
              <input type="text" value={this.state.value} onChange={this.handleChangeIPFS.bind(this)} />
            </label>
            <input type="submit" value="Submit" />
          </form>
        <h2> 3. Receive Notifications </h2>
        <button onClick={this.handleReceiveIPFS.bind(this)}>Receive IPFS</button>
        <p>{this.state.receivedIPFS}</p>
      </div>
    );
  }
}

export default App;

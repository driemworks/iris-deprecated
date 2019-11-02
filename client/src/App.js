import React, { Component } from "react";
// import SimpleStorageContract from "./contracts/SimpleStorage.json";
import IPFSInboxContract from "./contracts/IPFSInbox.json";
import getWeb3 from "./utils/getWeb3";

// new imports start
import truffleContract from 'truffle-contract';
import ipfs from './ipfs';

import "./App.css";

class App extends Component {
  // move to constructor?
  state = { storageValue: 0, web3: null, accounts: null, contract: null, ipfsHash: null };

  // constructor(props) {
  //   super(props);
  //   this.state = {

  //   }
  // }

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();
      // Get the contract instance.
      const networkId = await web3.eth.net.getId();

      const Contract = truffleContract(IPFSInboxContract);
      Contract.setProvider(web3.currentProvider);
      const instance = await Contract.deployed();

      // const deployedNetwork = SimpleStorageContract.networks[networkId];
      // const instance = new web3.eth.Contract(
      //   SimpleStorageContract.abi,
      //   deployedNetwork && deployedNetwork.address,
      // );

      // NEW CODE START


      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      // this.setState({ web3, accounts, contract: instance }, this.runExample);
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

  captureFile = (event) => {
    event.stopPropogation();
    event.preventDefault();

    const file = event.target.files[0];
    let reader = new window.FileReader();
    reader.readAsArrayBuffer(file);
     reader.onloadend = () => this.convertToBuffer(reader);
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

  // runExample = async () => {
  //   const { accounts, contract } = this.state;

  //   // Stores a given value, 5 by default.
  //   await contract.methods.set(5).send({ from: accounts[0] });

  //   // Get the value from the contract to prove it worked.
  //   const response = await contract.methods.get().call();

  //   // Update state with the result.
  //   this.setState({ storageValue: response });
  // };

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h2>1. Add a file to IPFS here.</h2>
        <form id="ipfs-hash-form" className="scep-form" onSubmit={this.onIPFSSubmit}>
          <input type="file" onChange={this.captureFile} />
          <button type="submit">
            Send it!
          </button>
        </form>
        <p>
          The IPFS has is: {this.state.ipfsHash}
        </p>
      </div>
    );
  }
}

export default App;

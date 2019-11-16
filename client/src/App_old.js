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

  enableEthereum = false;

  constructor(props) {
    super(props);
    this.state = { 
      storageValue: 0, 
      web3: null, 
      accounts: null, 
      contract: null, 
      ipfsHash: null,
      uploadFileName: "",
      ipfsMessage: "",
      ipfsDataType: "",
      formIPFS: "",
      formAddress: "",
      receivedIPFS: ""
    };

    // register handlers
    if (this.enableEthereum === true) {
      this.handleChangeAddress = this.handleChangeAddress.bind(this);
      this.handleChangeIPFS.bind(this);
      this.handleSend.bind(this);
      this.handleReceiveIPFS.bind(this);
    }
  }

  componentDidMount = async () => {
    // Qmdw4PG5kMTPqRuq2oFw1dnTzw265Svm4jArmhS7dSZBdg
    try {
      if (this.enableEthereum === true) {
        // Get network provider and web3 instance.
        const web3 = await getWeb3();
        // Use web3 to get the user's accounts.
        const accounts = await web3.eth.getAccounts();
        // Get the contract instance.
        // const networkId = await web3.eth.net.getId();
        const contract = truffleContract(IPFSInboxContract);
        console.log('Loaded contract sucesfully');
        contract.setProvider(web3.currentProvider);
        const instance = await contract.deployed();
        this.setState({ web3: web3, accounts: accounts, contract: instance });
        this.setEventListeners();
      }
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

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

  async handleReceiveIPFS(event) {
    event.preventDefault();
    console.log('handle receive ipfs');
    const contract = this.state.contract;
    const account = this.state.accounts[0];
    // const res = await contract.checkInbox({from: account});
    // console.log('check inbox response ' + JSON.stringify(res));
    // const ress = await contract.ipfsSent().on('inboxResponse', res => {
    //   console.log('?????????? ' + JSON.stringify(res));
    // });
    // console.log('emit? ' + JSON.stringify(ress));
  }


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

  setEventListeners() {
    // console.log('setting event listeners');
    // this.state.contract.events.allEvents({
    //   fromBlock: 0
    // }, function(err, event) {
    //   console.log('EVENT? ' + JSON.stringify(event));
    // });
    // this.state.contract.inboxResponse().on('data', result => {
    //   console.log('setEventListener: set received ipfs: ' + JSON.stringify(result));
    //   this.setState({receivedIPFS: result.args[0]})
    // });
  }

  convertToBuffer = async(reader) => {
    const buffer = await Buffer.from(reader.result);
    this.setState({buffer});
  }

  onIPFSSubmit = async(event) => {
    event.preventDefault();
    const add = await ipfs.add(
      {
        path: this.state.uploadFileName,
        content: this.state.buffer
      }, (err, res) => {
        this.setState({ipfsHash: res});
      }
    );
      
  }

  retrieveIPFS = async(event) => {
    event.preventDefault();
    const files = await ipfs.get(this.state.ipfsHash, (err, res) => {
      console.log('RESPONSE: ' + JSON.stringify(res));
    });
    // files.forEach(element => {
    //   console.log('element ' + JSON.stringify(element));
    //   if (element.content) {
    //     console.log('PATH ' + element.path);
    //     const path = element.path;
    //     const type = path.split(".");
    //     console.log('type ' + type);
    //     this.setState({ipfsDataType: type[1]});
    //     // 
    //     if (type === "txt") {
    //        this.setState({ipfsMessage: element.content.toString('utf8')});
    //     } else if (type === "jpg") {
    //       const msgString = 'data:image/jpg;base64, [your byte array]';
    //       this.setState({ipfsMessage: msgString});
    //     }
    //     // <img id="profileImage" src="data:image/jpg;base64, [your byte array]"></img>
    //     // console.log(element.content.toString('utf8'));
    //   }
    // });
  }

  render() {
    // if (!this.state.web3) {
    //   return <div>Loading Web3, accounts, and contract...</div>;
    // }
    const type = this.state.ipfsDataType;
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
        <button onClick={this.retrieveIPFS}>
          Get uploaded data
        </button>
        <div type={"txt"}>
          <p>{this.state.ipfsMessages}</p>
        </div>
        <div type={"jpg"}>
          <img id="profileImage" src=""></img>
        </div>
        {/* <h2> 2. Send notifications here </h2>
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
        <p>{this.state.receivedIPFS}</p> */}
      </div>
    );
  }
}

export default App;

import React, { Component } from "react";
import ReactDOM from 'react-dom';
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
import { pull } from 'pull-stream';

import GenerateKeys from './components/generateKeys/generateKeys.component';
import MessagingComponent from './components/messaging/messaging.component';
import "./App.css";
const pullToPromise = require('pull-to-promise');

class App extends Component {

  accountsSelector = [];

  constructor(props) {
    super(props);
    this.state = { 
      account: "",
      web3: null,
      accounts: null,
      contractAddress: ""
    };
  }

  componentDidMount = async () => {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();
      this.setState({ web3 });
      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();
      let i = 1;
      for (let account of accounts) {
        this.accountsSelector.push(
          {label: account, value: i}
        );
        i += 1;
      }
      this.setDefaultAccount(this.accountsSelector[0]);
  }

  async setDefaultAccount(account) {
    this.setState({ account: account.label }, async function () {
      console.log('setting default account ' + this.state.account);
      console.log('looking for user information for ' + account.label);
      const contractAddress = await IPFSDatabase.getContractAddress(account.label, (err, res) => {
        if (err) {
          console.log('No contract found - must generate keys')
          this.setState({ contractAddress: '' });
        } else {
          console.log('retrieved contract file: ' + contractAddress);
          this.setState({contractAddress});
        }
      });
    });
    this.forceUpdate();
  }

  action(event) {
    this.setState({contractAddress: event});
  }

  render() {
    return (
      <div className="App">
        <div className="header">
          <div className="right ethereum-account-selector">
            <p className="hash-text">Selected ethereum account:</p>
            <Select className="dropdown"
                    options={this.accountsSelector}GenerateKeys
                    onChange={this.setDefaultAccount.bind(this)}>
             </Select>
          </div>
        </div>
        <div className="app-container">
          <p>
            Selected account: {this.state.account}
          </p>
          <If condition={this.state.contractAddress === ''}>
            <GenerateKeys web3={this.state.web3}
                          ethereumAccountId={this.state.account}
                          action={this.action.bind(this)}
            />
            <Else>
              <p>Found contract for account {this.state.account}</p>
              <p> At address {this.state.contractAddress}</p>
              <MessagingComponent />
            </Else>
          </If>
        </div>
      </div>
    );
  }
}

ReactDOM.render(<GenerateKeys />, document.getElementById('root'));
ReactDOM.render(<MessagingComponent />, document.getElementById('root'));
export default App;

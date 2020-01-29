import React, { Component } from "react";
import ReactDOM from 'react-dom';
import ipfs from './ipfs';
import { If, Else } from 'rc-if-else';
import { IPFSDatabase } from './db/ipfs.db';

import getWeb3 from "./utils/getWeb3";
import Select from 'react-select';

import GenerateKeys from './components/generateKeys/generateKeys.component';
import GenerateAlias from './components/generateAlias/generateAlias.component';
import MessagingComponent from './components/messaging/messaging.component';
import InboxComponent from './components/inbox/inbox.component';
import ContractsComponent from './components/contracts/contracts.component';

import "./App.css";
import { faCopy } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { Alert } from 'reactstrap';

class App extends Component {

  accountsSelector = [];

  constructor(props) {
    super(props);
    this.state = {
      account: "",
      alias: "",
      web3: null,
      accounts: null,
      ethereumBalance: 0,
      contractAddress: "",
      isWeb3Connected: false,
      refresh: false,
      selectedView: "",
      showAlert: false
    };
    this.onSetSidebarOpen = this.onSetSidebarOpen.bind(this);
  }

  componentDidMount = async () => {
    // Get network provider and web3 instance.
    const web3 = await getWeb3();
    this.setState({ web3 });
    web3.eth.net.isListening().then(
      () => this.setState({ isWeb3Connected: true })
    ).catch(e => console.log('web3 not connected'));
    // Use web3 to get the user's accounts.
    const accounts = await web3.eth.getAccounts();
    let i = 1;
    for (let account of accounts) {
      this.accountsSelector.push(
        { label: account, value: i }
      );
      i += 1;
    }
  }

  onSetSidebarOpen(open) {
    this.setState({ sidebarOpen: open });
  }

  async findAlias(account) {
    const dir = '/content/' + account.label + '/usr/data.txt';
    try {
      const filesResponse = await IPFSDatabase.readFile(dir);
      const content = String.fromCharCode(... new Uint8Array(filesResponse));
      const alias = content.split('=')[1];
      this.setState({alias});
      this.setState({selectedView: "Inbox"});
    } catch (e) {
      this.setState({alias: ''});
    }
    this.forceUpdate();
  }

  async selectAccount(account) {
    // set state with account, along with ethereum balance
    this.setState({ account: account.label });
    // search for alias
    await this.findAlias(account);
    // update ethereum balance based on selected account
    this.updateEthereumBalance(account.label);
    // search for contracts
    this.findContracts(account.label);
    this.forceUpdate();
    // search for contracts
    //  - contracts found => set state
    //  - no contracts found => display option (skippable) to generate contract(s) (encryption keys)

    // this.setState({ account: account.label }, async function () {
    //   console.log('setting default account ' + this.state.account);
    //   console.log('looking for user information for ' + account.label);
    //   await IPFSDatabase.getContractAddress(account.label, (err, res) => {
    //     if (err) {
    //       console.log('No contract found - must generate keys')
    //       this.setState({ contractAddress: '' });
    //     } else {
    //       console.log('retrieved contract file: ' + res.toString());
    //       this.setState({ contractAddress: res.toString() });
    //     }
    //   });
    // });
    // this.updateEthereumBalance(account.label);
    // // this.setState({ refresh: !this.state.refresh });
    // this.forceUpdate();
  }

  async findContracts(account) {
    await IPFSDatabase.getContractAddress(account, (err, res) => {
      if (err) {
        console.log('No contract found - must generate keys')
        this.setState({ contractAddress: '' });
      } else {
        console.log('retrieved contract file: ' + res.toString());
        this.setState({ contractAddress: res.toString() });
      }
    });
    //  this.setState({ account: account.label }, async function () {
    //   console.log('setting default account ' + this.state.account);
    //   console.log('looking for user information for ' + account.label);
    //   await IPFSDatabase.getContractAddress(account.label, (err, res) => {
    //     if (err) {
    //       console.log('No contract found - must generate keys')
    //       this.setState({ contractAddress: '' });
    //     } else {
    //       console.log('retrieved contract file: ' + res.toString());
    //       this.setState({ contractAddress: res.toString() });
    //     }
    //   });
    // });
  }

  async updateEthereumBalance(account) {
    const ethereumBalance = await this.state.web3.utils.fromWei(
      await this.state.web3.eth.getBalance(account), 'ether');
    this.setState({ ethereumBalance });
  }

  handleContractAddressState(event) {
    this.setState({ contractAddress: event });
  }

  aliasHandler(e) {
    this.setState({alias: e});
    this.setState({selectedView: "Inbox"});
  }

  toggleView(event) {
      this.setState({selectedView: event.target.value});
      this.forceUpdate();
  }

  copyText() {
    navigator.clipboard.writeText(this.state.account);
    // alert for 5 seconds
    this.setState({showAlert: true});
    setTimeout(function() {
      console.log('hi');
      this.setState({showAlert: false});
    }.bind(this), 5000); 
  }

  render() {
    this.copyText = this.copyText.bind(this);
    return (
      <div className="App">
        <div className="header">
          <div className="left app-name">
            IRIS
          </div>
          <div>
          <p>Ethereum balance:</p>
          <If condition={!this.state.account}>
            -
            <Else>
              <p>
                {this.state.ethereumBalance}
              </p>
            </Else>
          </If>
        </div>
        <p>
          Alias: {this.state.alias}
        </p>
        </div>
        <div className="app-container">
          <If condition={!this.state.isWeb3Connected}>
            You don't have an ethereum provider configured. Please install metamask.
          <Else>
              <If condition={this.state.isWeb3Connected}>
                <div className="ethereum-account-selector">
                  <Select className="dropdown"
                    options={this.accountsSelector} GenerateKeys
                    onChange={this.selectAccount.bind(this)}>
                  </Select>
                  {/* <FontAwesomeIcon className="copy" onClick={this.copyToClipboard.bind(this)} icon={faCopy} /> */}
                  <FontAwesomeIcon className="copy" onClick={this.copyText.bind(this)} icon={faCopy} />
                  <Alert className="copy-alert" color="info" isOpen={this.state.showAlert}>
                    Copied!
                  </Alert>
                </div>
              </If>
              <div className="sidebar-container">
                <div className="sidebar-button-container">
                  <input type="button" value="Upload" onClick={this.toggleView.bind(this)}/>
                  <input type="button" value="Inbox" onClick={this.toggleView.bind(this)}/>
                  <input type="button" value="Contracts" onClick={this.toggleView.bind(this)}/>
                </div>
              </div>
              <div className="content">
                <If condition={this.state.account === ""}>
                  Select an ethereum account.
                </If>
                <If condition={this.state.alias === ""}> 
                  <GenerateAlias 
                    alias={this.state.alias} 
                    ethereumAddress={this.state.account}
                    aliasHandler={this.aliasHandler.bind(this)}
                  />
                  <Else>
                    <If condition={this.state.selectedView === 'Upload'}>
                      <MessagingComponent
                        senderAddress={this.state.account}
                        refresh={this.state.refresh}
                        senderContractAddress={this.state.contractAddress}
                        web3={this.state.web3} />
                    </If> 
                    <If condition={this.state.selectedView === 'Inbox'}>
                      <InboxComponent
                        refresh={this.state.refresh}
                        web3={this.state.web3}
                        ethereumAddress={this.state.account}
                      />
                    </If>
                    <If condition={this.state.selectedView === 'Contracts'}>
                      <ContractsComponent 
                        web3={this.state.web3}
                        account={this.state.account}
                      />
                    </If>
                  </Else>
                </If>
              </div>
              {/* <If condition={this.state.contractAddress === ''}>
                <GenerateKeys 
                  web3={this.state.web3}
                  ethereumAccountId={this.state.account}
                  action={this.handleContractAddressState.bind(this)}
                />
                <Else>
                  <MessagingComponent
                    senderAddress={this.state.account}
                    refresh={this.state.refresh}
                    senderContractAddress={this.state.contractAddress}
                    web3={this.state.web3} />
                  <InboxComponent
                    refresh={this.state.refresh}
                    web3={this.state.web3}
                    ethereumAddress={this.state.account} />
                </Else>
              </If> */}
            </Else>
          </If>
        </div>
        <div className="footer-container">
            <div className="footer-text-container">
              driemworks 2020
            </div>
        </div>
      </div>
    );
  }
}

ReactDOM.render(<GenerateKeys />, document.getElementById('root'));
ReactDOM.render(<MessagingComponent />, document.getElementById('root'));
ReactDOM.render(<InboxComponent />, document.getElementById('root'));
ReactDOM.render(<GenerateAlias />, document.getElementById('root'));
ReactDOM.render(<ContractsComponent />, document.getElementById('root'));
export default App;

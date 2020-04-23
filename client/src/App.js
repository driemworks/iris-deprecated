import React, { Component } from "react";
import ReactDOM from 'react-dom';

import { If, Else } from 'rc-if-else'

import { viewConstants, irisResources } from './constants';

import InboxComponent from './components/inbox/inbox.component';
import HeaderComponent from "./components/header/header.component";
import SidebarComponent from "./components/sidebar/sidebar.container";
import AboutComponent from "./components/about/about.component";

import "./App.css";

import store from './state/store/index';
import { loadPeers } from './state/actions/index';

import LoginComponent from "./components/login/login.component";
import { IPFSDatabase } from "./db/ipfs.db";
import PeersComponent from "./components/peers/peers.component";

class App extends Component {

  accountsSelector = [];

  constructor(props) {
    super(props);
    this.state = {
      wallet: null,
      selectedView: viewConstants.INBOX,
      showAbout: true,
      peers: null
    };
  }

  async componentDidMount() {
    // load peers
    const dir = irisResources() + 'aliases.txt';
    const rawMasterAliasFile = await IPFSDatabase.readFile(dir);
    const masterFile = String.fromCharCode(...new Uint8Array(rawMasterAliasFile));
    store.dispatch(loadPeers(masterFile));

    store.subscribe(() => {
      // debugger;
      const wallet = store.getState().wallet;
      const peers = store.getState().peers;
      const formattedPeers = this.processPeers(peers, wallet.address);
      this.setState({ wallet: wallet, peers: formattedPeers });
    });
  }

  processPeers(peers, address) {
    let data = [];
    // alias|account \n
    const lines = peers.split('\n');
    for (let line of lines) {
        if (line !== "") {
            const split = line.split('|');
            // don't push yourself
            if (split[1] !== address) {
                data.push({
                    key: split[1],
                    value: split[0]
                });
            }
        }
    }
    return data;
  }

  toggleView(event) {
      this.setState({selectedView: event.target.id});
  }

  toggleAbout() {
    const showAboutState = this.state.showAbout;
    this.setState({ showAbout: !showAboutState });
  }

  renderView() {
    let view = <div>Not yet implemented</div>
    if (this.state.selectedView === viewConstants.INBOX) {
      view = <InboxComponent
                wallet = {this.state.wallet}
                peers  = {this.state.peers}
             />;
    } else if (this.state.selectedView === viewConstants.PEERS){
      // view = <PeersComponent
      //         wallet = {this.state.wallet}
      //         peers  = {this.state.peers}
      //       />
    }
    return view;
  }

  render() {
    this.toggleView  = this.toggleView.bind(this);
    this.toggleAbout = this.toggleAbout.bind(this);
    const renderView = this.renderView();

    return (
      <div className="App">
        <HeaderComponent 
          wallet = {this.state.wallet}
        />
        <If condition={this.state.showAbout === true}>
          <AboutComponent
            action = {this.toggleAbout}
          />
          <Else>
            <If condition={this.state.wallet}>
              <SidebarComponent 
                toggleView  = {this.toggleView}
                toggleAbout = {this.toggleAbout}
              />
              <div className="render-view-container">
                {renderView}
              </div>
              <Else>
                <LoginComponent />
              </Else>
            </If>
          </Else>
        </If>
      </div>
    );
  }
}

ReactDOM.render(<LoginComponent />, document.getElementById('root'));
ReactDOM.render(<PeersComponent />, document.getElementById('root'));
ReactDOM.render(<InboxComponent />, document.getElementById('root'));
ReactDOM.render(<HeaderComponent />, document.getElementById('root'));
ReactDOM.render(<SidebarComponent />, document.getElementById('root'));
ReactDOM.render(<AboutComponent />, document.getElementById('root'));
export default App;

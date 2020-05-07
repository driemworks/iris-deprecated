import React, { Component } from "react";
import ReactDOM from 'react-dom';

import { If } from 'rc-if-else'

import { viewConstants, irisResources } from './constants';

import InboxComponent from './components/inbox/inbox.component';
import HeaderComponent from "./components/header/header.component";
import SidebarComponent from "./components/sidebar/sidebar.container";
import AboutComponent from "./components/about/about.component";
import PeersComponent from "./components/peers/peers.component";
import ProfileComponent from "./components/profile/profile.component";
import LoginComponent from "./components/login/login.component";

import "./App.css";

import store from './state/store/index';
import { loadPeers } from './state/actions/index';

import { IPFSDatabase } from "./db/ipfs.db";

import { faInbox, faUser, faUsers } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

class App extends Component {

  accountsSelector = [];

  constructor(props) {
    super(props);

    // route to "/" on refresh
    if (window.performance) {
      if (performance.navigation.type == 1) {
        window.location.href = '/';
      } 
    }

    this.state = {
      wallet: null,
      selectedView: viewConstants.INBOX,
      showAbout: true,
      peers: null,
      selectedProfile: ''
    };
  }

  async componentDidMount() {
    // load peers
    const dir = irisResources('aliases.json');
    const rawMasterAliasFile = await IPFSDatabase.readFile(dir);
    const masterFile = String.fromCharCode(...new Uint8Array(rawMasterAliasFile));
    store.dispatch(loadPeers(masterFile));

    store.subscribe(() => {
      // debugger;
      const wallet = store.getState().wallet;
      const defaultAddress = wallet.address;
      const peers = store.getState().peers;
      const formattedPeers = this.processPeers(peers, wallet.address);
      this.setState({ wallet: wallet, peers: formattedPeers, selectedProfile: defaultAddress });
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

  handleProfileClickEvent(event) {
    console.log(JSON.stringify(event));
    debugger;
  }

  renderView() {
    let view = <div>Not yet implemented</div>
    if (this.state.selectedView === viewConstants.INBOX) {
      view = <InboxComponent
                wallet = {this.state.wallet}
                peers  = {this.state.peers}
             />;
    } else if (this.state.selectedView === viewConstants.PEERS){
      view = <PeersComponent
              wallet = {this.state.wallet}
              peers  = {this.state.peers}
            />
    } else if (this.state.selectedView === viewConstants.PROFILE) {
      view = <ProfileComponent
              address = {this.state.selectedProfile}  
             />
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
        <Router>
          <If condition={window.location.href.substr(-1) !== "/"}>
            <div className="nav-container">
              <ul className="nav-list">
                <li className="nav-item">
                  <FontAwesomeIcon className="sidebar-icon" icon={faInbox} />
                  <Link className="link-item" to="/inbox">Inbox</Link>
                </li>
                <li className="nav-item">
                  <FontAwesomeIcon className="sidebar-icon" icon={faUser} />
                  <Link className="link-item" to={"/profile/" + this.state.selectedProfile}>Profile</Link>    
                </li>
                <li className="nav-item">
                  <FontAwesomeIcon className="sidebar-icon" icon={faUsers} />
                  <Link className="link-item" to="/users">Users</Link>
                </li>
              </ul>
            </div>
          </If>

          <Switch>
            <Route exact path="/">
              <AboutComponent />
            </Route>
            <Route exact path="/login">
              <LoginComponent />
            </Route>
            <Route exact path="/inbox">
              <InboxComponent
                  wallet = {this.state.wallet}
                  peers  = {this.state.peers}
              />
            </Route>
            <Route path="/users">
              <PeersComponent
                wallet = {this.state.wallet}
                peers  = {this.state.peers}
              />
            </Route>
            <Route path="/profile/:address">
              <ProfileComponent />
            </Route>
          </Switch>
        </Router>
      </div>
    );
  }
}

ReactDOM.render(<HeaderComponent />, document.getElementById('root'));
export default App;

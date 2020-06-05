import React, { Component } from "react";
import ReactDOM from 'react-dom';

import { If } from 'rc-if-else'

import { viewConstants } from './constants';

import InboxComponent from './components/inbox/inbox.component';
import HeaderComponent from "./components/header/header.component";
import AboutComponent from "./components/about/about.component";
import PeersComponent from "./components/peers/peers.component";
import ProfileComponent from "./components/profile/profile.component";
import LoginComponent from "./components/login/login.component";

import "./App.css";

import store from './state/store/index';

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
      selectedProfile: ''
    };
  }

  async componentDidMount() {
    store.subscribe(() => {
      const wallet = store.getState().wallet;
      const defaultAddress = wallet.address;
      this.setState({ wallet: wallet, selectedProfile: defaultAddress });
    });
  }

  toggleView(event) {
      this.setState({selectedView: event.target.id});
  }

  toggleAbout() {
    const showAboutState = this.state.showAbout;
    this.setState({ showAbout: !showAboutState });
  }

  sidebar() {
    if (!this.state.wallet) {
      return (
        <div>
          Loading...
        </div>
      );
    }

    return (
      <div className="nav-container">
        <div className="user-info-container">
          <span className="alias-container">{this.state.wallet ? this.state.wallet.alias : 'Loading...'}</span>
          <span className="address-container">{this.state.wallet ? this.state.wallet.address : 'Loading...'}</span>
        </div>

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
    );
  };

  render() {
    this.toggleView  = this.toggleView.bind(this);
    this.toggleAbout = this.toggleAbout.bind(this);

    return (
      <div className="App">
        <HeaderComponent 
          wallet = {this.state.wallet}
        />
        <Router>
          <div className="app-content">
            <Switch>
              <Route exact path="/">
                <AboutComponent />
              </Route>
              <Route exact path="/login">
                <LoginComponent />
              </Route>
              <Route exact path="/inbox">
                {this.sidebar()}
                <InboxComponent wallet = { this.state.wallet } />
              </Route>
              <Route path="/users">
                {this.sidebar()}
                <PeersComponent wallet = { this.state.wallet } />
              </Route>
              <Route path="/profile/:address">
                {this.sidebar()}
                <ProfileComponent />
              </Route>
            </Switch>
          </div>
        </Router>
      </div>
    );
  }
}

ReactDOM.render(<HeaderComponent />, document.getElementById('root'));
export default App;

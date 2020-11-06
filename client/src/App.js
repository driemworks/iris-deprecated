import React, { Component } from "react";
import ReactDOM from 'react-dom';

import { viewConstants } from './constants';

import InboxComponent from './components/inbox/inbox.component';
import HeaderComponent from "./components/header/header.component";
import AboutComponent from "./components/about/about.component";
import LoginComponent from "./components/login/login.component";

import "./App.css";

import store from './state/store/index';

import { faInbox } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import { UncontrolledAlert } from "reactstrap";

class App extends Component {

  accountsSelector = [];

  constructor(props) {
    super(props);
    
    // route to "/" on refresh
    if (window.performance) {
      if (performance.navigation.type === 1) {
        window.location.href = '/';
      } 
    }

    this.state = {
      wallet: null,
      selectedView: viewConstants.INBOX,
      showAbout: true,
      selectedProfile: '',
      errors: []
    };
  }

  async componentDidMount() {
    store.subscribe(() => {
      const wallet = store.getState().wallet;
      const defaultAddress = wallet.address;
      var errors = store.getState().errors;
      this.setState({
        wallet: wallet, 
        selectedProfile: defaultAddress,
        errors: errors
      });
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
        </ul>
      </div>
    );
  };

  render() {
    this.toggleView  = this.toggleView.bind(this);
    this.toggleAbout = this.toggleAbout.bind(this);
    const errorAlerts = this.state.errors.map((err) => 
    <UncontrolledAlert color="danger">
      { err.message.message }
    </UncontrolledAlert>
  );
    return (
      <div className="App">
        <HeaderComponent 
          wallet = {this.state.wallet}
        />
        <div className="errors-container">
          { errorAlerts }
        </div>
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
                { this.sidebar() }
                <InboxComponent wallet = { this.state.wallet } />
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

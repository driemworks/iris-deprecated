import React, { Component } from "react";
import ReactDOM from 'react-dom';

import { If, Else } from 'rc-if-else'

import { viewConstants } from './constants';

import InboxComponent from './components/inbox/inbox.component';
import HeaderComponent from "./components/header/header.component";
import SidebarComponent from "./components/sidebar/sidebar.container";
import AboutComponent from "./components/about/about.component";

import "./App.css";

import store from './state/store/index';
import { loadUser } from './state/actions/index';

import LoginComponent from "./components/login/login.component";

class App extends Component {

  accountsSelector = [];

  constructor(props) {
    super(props);
    this.state = {
      wallet: null,
      selectedView: viewConstants.INBOX,
      showAbout: true
    };

    store.subscribe(() => {
      const wallet = store.getState().wallet;
      this.setState({ wallet });
    });
  }

  aliasHandler(e) {
    const updatedUser = this.state.user;
    updatedUser.alias = e;
    store.dispatch(loadUser(updatedUser));
    this.setState({selectedView: viewConstants.INBOX});
  }

  contractAddressHandler(e) {
    const updatedUser = this.state.user;
    updatedUser.contract = e;
    store.dispatch(loadUser(updatedUser));
  }

  toggleView(event) {
      this.setState({selectedView: event.target.id});
  }

  toggleAbout(value) {
    this.setState({ showAbout: value });
  }

  renderView() {
    let view = <div>No view selected</div>
    if (this.state.selectedView === viewConstants.INBOX) {
      view = <InboxComponent
                wallet = {this.state.wallet}
             />;
    }
    return view;
  }

  render() {
    this.toggleView  = this.toggleView.bind(this);
    this.toggleAbout = this.toggleAbout.bind(this);
    const renderView = this.renderView();

    return (
      <div className="App">
        <If condition={this.state.wallet}>
          <HeaderComponent 
            wallet = {this.state.wallet}
          />
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
      </div>
    );
  }
}

ReactDOM.render(<LoginComponent />, document.getElementById('root'));
ReactDOM.render(<InboxComponent />, document.getElementById('root'));
ReactDOM.render(<HeaderComponent />, document.getElementById('root'));
ReactDOM.render(<SidebarComponent />, document.getElementById('root'));
ReactDOM.render(<AboutComponent />, document.getElementById('root'));
export default App;

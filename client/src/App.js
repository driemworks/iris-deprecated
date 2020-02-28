import React, { Component } from "react";
import ReactDOM from 'react-dom';

import UserService from './service/user.service';

import { If, Else } from 'rc-if-else'

import { viewConstants } from './constants';
import getWeb3 from "./utils/getWeb3";

import InitUserComponent from './components/init-user/init-user.component';
import UploadComponent from './components/upload/upload.component';
import InboxComponent from './components/inbox/inbox.component';
import ContractsComponent from './components/contracts/contracts.component';
import HeaderComponent from "./components/header/header.component";
import SidebarComponent from "./components/sidebar/sidebar.container";
import PeersComponent from "./components/peers/peers.component";
import AboutComponent from "./components/about/about.component";

import "./App.css";

import store from './state/store/index';
import { loadUser } from './state/actions/index';

class App extends Component {

  accountsSelector = [];

  constructor(props) {
    super(props);
    this.state = {
      web3: null,
      isWeb3Connected: false,
      selectedView: viewConstants.INBOX,
      showAbout: true
    };

    store.subscribe(() => {
      const user = store.getState().user;
      // set user state
      this.setState({ user: user, showAbout: !user.alias });

      // set default view
      if (user.alias === '') {
        this.setState({ selectedView: viewConstants.ALIAS });
      }
    });
  }

  componentDidMount = async () => {
    const web3 = await getWeb3();
    this.setState({ web3 });
    web3.eth.net.isListening().then(
      () => this.setState({ isWeb3Connected: true })
    ).catch(e => console.log('web3 not connected'));
    await UserService.loadUser(web3);
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
    if (this.state.selectedView === viewConstants.UPLOAD) {
      view = <UploadComponent 
                web3 = {this.state.web3}
                user = {this.state.user}
             />;
    } else if (this.state.selectedView === viewConstants.INBOX) {
      view = <InboxComponent
                web3 = {this.state.web3}
                user = {this.state.user}
             />;
    } else if (this.state.selectedView === viewConstants.CONTRACTS) {
        view = <ContractsComponent
                contractHandler = {this.contractAddressHandler.bind(this)}
                web3            = {this.state.web3}
                user            = {this.state.user}
               />;
    } else if (this.state.selectedView === viewConstants.ALIAS) {
      view = <InitUserComponent 
                aliasHandler = {this.aliasHandler.bind(this)}
                user         = {this.state.user}
              />;
    } else if (this.state.selectedView === viewConstants.PEERS) {
      view = <PeersComponent 
              user = {this.state.user}
             />
    }
    return view;
  }

  render() {
    this.toggleView  = this.toggleView.bind(this);
    this.toggleAbout = this.toggleAbout.bind(this);
    const renderView = this.renderView();
    // const user = store.getState().user;
    if (!this.state.user) {
      return (
        <div>
          Loading...
        </div>
      );
    }
    return (
      <div className="App">
        <div className="header-container">
          <HeaderComponent 
            user        = {this.state.user}
            toggleAbout = {this.toggleAbout}
          />
        </div>
        <If condition={this.state.showAbout === true}>
          <AboutComponent
            action       = {this.toggleAbout}
          />
          <Else>
            <div className="app-container">
              <div className="sidebard-container">
                <If condition={this.state.user.alias}>
                  <SidebarComponent 
                    toggleView = {this.toggleView}
                  />
                </If>
              </div>
            <div className="render-view-container">
              {renderView}
            </div>
          </div>
          </Else>
        </If>
      </div>
    );
  }
}

ReactDOM.render(<InitUserComponent />, document.getElementById('root'));
ReactDOM.render(<UploadComponent />, document.getElementById('root'));
ReactDOM.render(<InboxComponent />, document.getElementById('root'));
ReactDOM.render(<ContractsComponent />, document.getElementById('root'));
ReactDOM.render(<HeaderComponent />, document.getElementById('root'));
ReactDOM.render(<SidebarComponent />, document.getElementById('root'));
ReactDOM.render(<PeersComponent />, document.getElementById('root'));
ReactDOM.render(<AboutComponent />, document.getElementById('root'));
export default App;

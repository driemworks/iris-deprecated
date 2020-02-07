import React, { Component } from "react";
import ReactDOM from 'react-dom';
import { If, Else } from 'rc-if-else';
import { IPFSDatabase } from './db/ipfs.db';
import Tooltip from 'rc-tooltip';

import UserService from './service/user.service';

import { viewConstants } from './constants';
import getWeb3 from "./utils/getWeb3";
import Select from 'react-select';

import GenerateKeys from './components/generateKeys/generateKeys.component';
import GenerateAlias from './components/generateAlias/generateAlias.component';
import UploadComponent from './components/upload/upload.component';
import InboxComponent from './components/inbox/inbox.component';
import ContractsComponent from './components/contracts/contracts.component';
import HeaderComponent from "./components/header/header.component";
import SidebarComponent from "./components/sidebar/sidebar.container";

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
      selectedView: viewConstants.INBOX
    };

    store.subscribe(() => {
      const user = store.getState().user;
      // set user state
      this.setState({
          user: user
      });

      // set default view
      if (user.alias === '') {
        this.setState({ selectedView: viewConstants.ALIAS });
      }
    });
  }

  componentDidMount = async () => {
    // Get network provider and web3 instance.
    const web3 = await getWeb3();
    this.setState({ web3 });
    web3.eth.net.isListening().then(
      () => this.setState({ isWeb3Connected: true })
    ).catch(e => console.log('web3 not connected'));
    // load user
    await UserService.loadUser(web3);
  }

  aliasHandler(e) {
    const updatedUser = this.state.user;
    updatedUser.alias = e;
    store.dispatch(loadUser(updatedUser));
    // this.setState({alias: e});
    this.setState({selectedView: viewConstants.INBOX});
  }

  contractAddressHandler(e) {
    this.setState({ contractAddress: e });
  }

  toggleView(event) {
      this.setState({selectedView: event.target.value});
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
                contractHandler = {this.contractAddressHandler}
                web3            = {this.state.web3}
                user            = {this.state.user}
               />;
    } else if (this.state.selectedView === viewConstants.ALIAS) {
      view = <GenerateAlias 
                aliasHandler = {this.aliasHandler.bind(this)}
                user         = {this.state.user}
              />;
    }
    return view;
  }

  render() {
    this.toggleView  = this.toggleView.bind(this);
    const renderView = this.renderView();
    const user = store.getState().user;
    if (!user) {
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
            user = {this.state.user}
          />
        </div>
        <div className="app-container">
          <div className="sidebard-container">
            <SidebarComponent 
              toggleView = {this.toggleView}
            />
          </div>
          <div className="render-view-container">
            {renderView}
          </div>
        </div>
      </div>
    );
  }
}

ReactDOM.render(<GenerateKeys />, document.getElementById('root'));
ReactDOM.render(<UploadComponent />, document.getElementById('root'));
ReactDOM.render(<InboxComponent />, document.getElementById('root'));
ReactDOM.render(<GenerateAlias />, document.getElementById('root'));
ReactDOM.render(<ContractsComponent />, document.getElementById('root'));
ReactDOM.render(<HeaderComponent />, document.getElementById('root'));
ReactDOM.render(<SidebarComponent />, document.getElementById('root'));
export default App;

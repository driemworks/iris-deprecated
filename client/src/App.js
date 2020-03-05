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

import LoginComponent from "./components/login/login.component";

class App extends Component {

  accountsSelector = [];

  constructor(props) {
    super(props);
    this.state = {
      address: '',
      selectedView: viewConstants.INBOX,
      showAbout: true
    };

    store.subscribe(() => {
      const address = store.getState().address;
      this.setState({ address });
    });
  }

  // async componentDidMount() {
  //   await UserService.getEthUser('test');
  // }

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
                account = {this.state.address}
             />;
    } else if (this.state.selectedView === viewConstants.INBOX) {
      view = <InboxComponent
                address = {this.state.address}
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
    return (
      <div className="App">
        <If condition={this.state.address}>
          <HeaderComponent />
          <SidebarComponent 
            toggleView  = {this.toggleView}
            toggleAbout = {this.toggleAbout}
          />
          <div className="render-view-container">
            {/* {this.state.address} */}
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
ReactDOM.render(<InitUserComponent />, document.getElementById('root'));
// ReactDOM.render(<UploadComponent />, document.getElementById('root'));
ReactDOM.render(<InboxComponent />, document.getElementById('root'));
ReactDOM.render(<ContractsComponent />, document.getElementById('root'));
ReactDOM.render(<HeaderComponent />, document.getElementById('root'));
ReactDOM.render(<SidebarComponent />, document.getElementById('root'));
ReactDOM.render(<PeersComponent />, document.getElementById('root'));
ReactDOM.render(<AboutComponent />, document.getElementById('root'));
export default App;


    // const user = store.getState().user;
    // if (!this.state.user) {
    //   return (
    //     <div>
    //       Loading...
    //     </div>
    //   );
    // }
    // return (
    //   <div className="App">
    //     <div className="header-container">
    //       <HeaderComponent 
    //         user        = {this.state.user}
    //         toggleAbout = {this.toggleAbout}
    //       />
    //     </div>
    //     <If condition={this.state.showAbout === true}>
    //       <AboutComponent
    //         action       = {this.toggleAbout}
    //       />
    //       <Else>
    //         <div className="app-container">
    //           <div className="sidebard-container">
    //             <If condition={this.state.user.alias}>
    //               <SidebarComponent 
    //                 toggleView = {this.toggleView}
    //               />
    //             </If>
    //           </div>
    //         <div className="render-view-container">
    //           {renderView}
    //         </div>
    //       </div>
    //       </Else>
    //     </If>
    //   </div>
    // );
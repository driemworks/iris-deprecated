import PropTypes from 'prop-types';
import React from "react";
import { If, Else } from 'rc-if-else';

import Select from 'react-select';
import { Alert, Button } from 'reactstrap';

import { faCopy, faLock, faEdit } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import './header.component.css';

class HeaderComponent extends React.Component {

    accountsSelector = [];

    constructor(props) {
        super(props);
        this.state = {
            showAlert: false,
            user: null
        };
    }

    async componentWillMount() {
        this.loadAccounts();
    }

    loadAccounts() {
        if (this.props.user && this.props.user.accounts) {
            let i = 1;
            for (let account of this.props.user.accounts) {
                this.accountsSelector.push(
                    { label: account, value: i }
                );
                i += 1;
            }
            if (this.props.user.accounts.length === 1) {

            }
        }
    }

    toggleAbout(e) {
        const toggleState = e.target.id === 'home' ? false : true;
        this.props.toggleAbout(toggleState);
    }

    handleSelectAccount(state) {
        alert('not yet implemented');
    }

    copyText() {
        navigator.clipboard.writeText(this.props.user.account);
        // alert for 5 seconds
        this.setState({showAlert: true});
        setTimeout(function() {
          this.setState({showAlert: false});
        }.bind(this), 5000);
    }

    render() {
        this.toggleAbout = this.toggleAbout.bind(this);
        return (
            <div className="header-container">
                <div className="header header-container-main">
                    <div className="left-container">
                        <div className="left app-name">
                            IRIS
                        </div>
                        <div className="nav-buttons">
                            <button id='home' onClick={this.toggleAbout}>
                                Home
                            </button>
                            <button id='about' onClick={this.toggleAbout}>
                                About
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

HeaderComponent.propTypes = {
    ethereumBalance: PropTypes.string,
    alias: PropTypes.string,
    selectAccount: PropTypes.func,
    contracts: PropTypes.object
};

export default HeaderComponent;
import PropTypes from 'prop-types';
import React from "react";
import { If, Else } from 'rc-if-else';

import Select from 'react-select';
import { Alert } from 'reactstrap';

import { faCopy, faLock, faBars } from "@fortawesome/free-solid-svg-icons";
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
        if (!this.props.user) {
            return (
                <div>
                    LOADING
                </div>
            );
        } else {
            // this.loadAccounts();
            return (
                <div className="header-container">
                    <div className="header header-container-main">
                        <div className="left app-name">
                            IRIS
                        </div>
                        <div className="header-container-main-details">
                            <div className="hamburger-container">
                                <FontAwesomeIcon icon={faBars} />
                            </div>
                            <div className="alias-container">
                                <p>
                                    {this.props.user.alias}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="header header-container-secondary">
                        <div className="accounts-container">
                            <div className="account-selector-container">
                                {/* If only a single account is provided, select and display it,
                                    otherwise show dropdown selector */}
                                <If condition={this.props.user.accounts.length === 1}>
                                    {this.props.user.accounts[0]}
                                    <Else>
                                        <Select className="dropdown"
                                                options={this.props.accountsSelector} GenerateKeys
                                                onChange={this.handleSelectAccount.bind(this)}>
                                        </Select>
                                    </Else>
                                </If>
                            </div>
                            <div className="copy-container">
                                <FontAwesomeIcon className="copy" onClick={this.copyText.bind(this)} icon={faCopy} />
                                <Alert className="copy-alert" color="info" isOpen={this.state.showAlert}>
                                    Copied!
                                </Alert>
                            </div>
                        </div>
                        <If condition={this.props.user.contract}>
                            <div className="contract-icon-container">
                                <FontAwesomeIcon className="contract-icon" icon={faLock} />
                            </div>
                        </If>
                    </div>
                </div>
            );
        }
    }
}

HeaderComponent.propTypes = {
    alias: PropTypes.string,
    ethereumBalance: PropTypes.string,
    alias: PropTypes.string,
    selectAccount: PropTypes.func,
    contracts: PropTypes.object
};

export default HeaderComponent;
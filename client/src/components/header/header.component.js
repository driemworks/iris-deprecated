import PropTypes from 'prop-types';
import React from "react";
import { If, Else } from 'rc-if-else';

import Select from 'react-select';
import { Alert } from 'reactstrap';

import { faCopy, faLock } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import store from '../../state/store/index';

import './header.component.css';

class HeaderComponent extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            showAlert: false,
            user: null
        };
    }

    async componentWillMount() {
        await store.subscribe(() => {
            this.setState({
                user: store.getState().user
            });
            // this.handleSelectAccount(store.getState().user.alias);
        });
        // this.forceUpdate();
    }

    handleSelectAccount(state) {
        console.log('helllooo ' + state);
    }

    copyText() {
        navigator.clipboard.writeText(this.state.account);
        // alert for 5 seconds
        this.setState({showAlert: true});
        setTimeout(function() {
          this.setState({showAlert: false});
        }.bind(this), 5000);
    }

    render() {
        if (!this.state.user) {
            return (
                <div>
                    LOADING
                </div>
            );
        } else {
            return (
                <div className="header-container">
                    {this.state.user.alias}
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
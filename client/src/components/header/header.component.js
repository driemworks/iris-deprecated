import PropTypes from 'prop-types';
import React from "react";

import './header.component.css';

class HeaderComponent extends React.Component {

    accountsSelector = [];

    constructor(props) {
        super(props);
        this.state = {
            showAlert: false
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
                <div className="app-name">
                    IRIS
                </div>
                {/* <div className="nav-buttons">
                </div> */}
                {/* <div className="alias-container">
                    <If condition={this.props.wallet}>
                        {this.props.wallet}
                    </If>
                </div> */}
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
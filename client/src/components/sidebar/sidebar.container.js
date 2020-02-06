import PropTypes from 'prop-types';
import React from "react";

import { faUpload, faFileContract, faInbox, faPray } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { viewConstants } from '../../constants';

import './sidebar.container.css';

class SidebarComponent extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="sidebar-container">
                <div className="sidebar-button-container">
                  <div className="sidebar-item">
                    <FontAwesomeIcon className="sidebar-icon" icon={faUpload} />
                    <input type="button" value={viewConstants.UPLOAD} onClick={this.props.toggleView} />
                  </div>
                  <div className="sidebar-item">
                    <FontAwesomeIcon className="sidebar-icon" icon={faInbox} />
                    <input type="button" value={viewConstants.INBOX} onClick={this.props.toggleView} />
                  </div>
                  <div className="sidebar-item">
                    <FontAwesomeIcon className="sidebar-icon" icon={faFileContract} />
                    <input type="button" value={viewConstants.CONTRACTS} onClick={this.props.toggleView} />
                  </div>
                </div>
            </div>
        );
    }

}

SidebarComponent.propTypes = {
    toggleView: PropTypes.func
}

export default SidebarComponent;
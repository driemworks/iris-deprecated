import PropTypes from 'prop-types';
import React from "react";

import { faUpload, faFileContract, faInbox } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

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
                    <input type="button" value="Upload" onClick={this.props.toggleView} />
                  </div>
                  <div className="sidebar-item">
                    <FontAwesomeIcon className="sidebar-icon" icon={faInbox} />
                    <input type="button" value="Inbox" onClick={this.props.toggleView} />
                  </div>
                  <div className="sidebar-item">
                    <FontAwesomeIcon className="sidebar-icon" icon={faFileContract} />
                    <input type="button" value="Contracts" onClick={this.props.toggleView} />
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
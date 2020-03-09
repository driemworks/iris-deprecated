import PropTypes from 'prop-types';
import React from "react";

import { faInbox, faCog, faAngleDoubleLeft, faAngleDoubleRight, faPeopleCarry } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { If, Else } from 'rc-if-else';

import { viewConstants } from '../../constants';

import './sidebar.container.css';

class SidebarComponent extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
          collapsed: false
        }
    }

    collpase() {
      const el = document.getElementById('sidebar-container');
      el.style.width = '75px';
      this.setState({ collapsed: true });
    }

    expand() {
      const el = document.getElementById('sidebar-container');
      el.style.width = '20%';
      this.setState({ collapsed: false });
    }

    render() {
       this.collpase = this.collpase.bind(this);
       this.expand   = this.expand.bind(this);
        return (
            <div className="sidebar-container" id="sidebar-container">
                <div className="collapser-container">
                  <If condition={this.state.collapsed === false}>
                    <FontAwesomeIcon className="collapse-icon" icon={faAngleDoubleLeft} onClick={this.collpase}/>
                    <Else>
                    <FontAwesomeIcon className="collapse-icon" icon={faAngleDoubleRight} onClick={this.expand}/>
                    </Else>
                  </If>
                </div>
                <div className="sidebar-button-container">
                  <div className="sidebar-item">
                    <FontAwesomeIcon className="sidebar-icon" icon={faInbox} />
                    <If condition={this.state.collapsed === false}>
                      <input type="button" id={viewConstants.INBOX} value={viewConstants.INBOX} onClick={this.props.toggleView} />
                    </If>
                  </div>
                  <div className="sidebar-item">
                    <FontAwesomeIcon className="sidebar-icon" icon={faCog} />
                    <If condition={this.state.collapsed === false}>
                      <input type="button" id={viewConstants.SETTINGS} value={viewConstants.SETTINGS} onClick={this.props.toggleView} />
                    </If>
                  </div>
                  <div className="sidebar-item">
                    <FontAwesomeIcon className="sidebar-icon" icon={faPeopleCarry} />
                    <If condition={this.state.collapsed === false}>
                      <input type="button" id={viewConstants.PEERS} value={viewConstants.PEERS} onClick={this.props.toggleView} />
                    </If>
                  </div>
                </div>
                <div className="footer-container">
                  <span>
                    <a href="https://github.com/driemworks">driemworks</a> 2020
                  </span>
                </div>
            </div>
        );
    }

}

SidebarComponent.propTypes = {
    toggleView: PropTypes.func
}

export default SidebarComponent;
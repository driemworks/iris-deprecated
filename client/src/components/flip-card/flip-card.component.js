import PropTypes from 'prop-types';
import React, { Component } from "react";

import './flip-card.component.css';

// import { faUpload, faFileContract, faInbox, faUsers } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

class FlipCardComponent extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        return(
            <div className="flip-card">
                <div class="flip-card-inner">
                    <div className="flip-card-front">
                        <h2>
                            {this.props.headerText}
                        </h2>
                        <FontAwesomeIcon className="icon" icon={this.props.icon} />
                    </div>
                    <div className="flip-card-back">
                        {this.props.text}
                    </div>
                </div>
            </div>
        );
    }
}

export default FlipCardComponent;

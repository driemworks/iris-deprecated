import React, { Component } from "react";

import './flip-card.component.css';

// import { faUpload, faFileContract, faInbox, faUsers } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

class FlipCardComponent extends Component {

    render() {
        return(
            <div className="flip-card">
                <div class="flip-card-inner">
                    <div className="flip-card-front">
                        <div className="flip-card-front-header">
                            <span>{this.props.headerText}</span>
                        </div>
                        <div className="flip-card-front-body">
                            <FontAwesomeIcon className="icon" icon={this.props.icon} />
                        </div>
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

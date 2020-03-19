import React, { Component } from "react";
import ReactDOM from 'react-dom';
import { Jumbotron, Button } from 'reactstrap';

import './about.component.css';
import FlipCardComponent from "../flip-card/flip-card.component";

import { faLock, faProjectDiagram, faUserShield } from "@fortawesome/free-solid-svg-icons";

class AboutComponent extends Component {

    constructor(props) {
        super(props);
    }

    goHome() {
        this.props.action(false);
    }

    render() {
        this.goHome = this.goHome.bind(this);
        return (
            <div className="about-container">
                <div className="eye"></div>
                <div className="about-details-container">
                    Iris is a decentralized file sharing application, powered by IPFS and Ethereum.
                </div>
               <Button color="primary" onClick={this.goHome}>
                   Try the demo
                </Button>
            </div>
        );
    }
}

ReactDOM.render(<FlipCardComponent />, document.getElementById('root'));

export default AboutComponent;
import React, { Component } from "react";
import ReactDOM from 'react-dom';
import { Jumbotron, Button } from 'reactstrap';

import './about.component.css';
import FlipCardComponent from "../flip-card/flip-card.component";

import { faLock, faProjectDiagram } from "@fortawesome/free-solid-svg-icons";

class AboutComponent extends Component {

    constructor(props) {
        super(props);
    }

    goHome() {
        this.props.action(false);
    }

    render() {
        return (
            <div className="about-container">
                <div className="jumbotron-container">
                    <Jumbotron>
                        <h1>Secure file sharing</h1>
                        <div className="jumbotron-text">
                            <p>
                                Iris is a platform to allow users to securely share files
                                using IPFS and ethereum. After creating your own public/private encryption keys
                                (under contracts in the sidebar), you can then asymetrically encrypt a file intended
                                for a specific user identified by their ethereum account (who must also have a contract deployed).
                                This creates a file that can only be encrypted by the desired party, while still uploading the content
                                to IPFS.
                            </p>
                        </div>
                        <Button onClick={this.goHome.bind(this)} color="primary">
                            Get started
                        </Button>
                    </Jumbotron>
                </div>
                <div className="about-body">
                    <div className="left details">
                        <FlipCardComponent 
                            headerText = 'Secure'
                            icon       = {faLock}
                            text       = "Iris provides user the ability to asymetrically encrypt files before sending 
                                            it to another user; creating an encrypted file that is can only 
                                            be decrypted by the intended party. This is accomplished by storing a user's encryption key 
                                            in a contract deployed to ethereum, where your private key is only accessible by you."
                        />
                    </div>
                    <div className="middle details">
                        <FlipCardComponent 
                            headerText = 'Decentralized'
                            icon       = {faProjectDiagram}
                            text       = 'Your files are uploaded to IPFS and user management is achieved through your ethereum account.'
                        />
                    </div>
                    {/* <div className="right details">
                        <FlipCardComponent 
                            headerText = 'Decentralized'
                            icon       = {faProjectDiagram}
                            text       = 'This is another test'
                        />
                    </div> */}
                </div>
            </div>
        );
    }
}

ReactDOM.render(<FlipCardComponent />, document.getElementById('root'));

export default AboutComponent;
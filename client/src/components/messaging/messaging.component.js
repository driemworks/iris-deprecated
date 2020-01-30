import React, { useState } from "react";
import {IPFSDatabase} from '../../db/ipfs.db';
import { If, Else } from 'rc-if-else';
import { EncryptionUtils } from '../../encryption/encrypt.service';
// import { box, randomBytes } from 'tweetnacl';
// import {
//   decodeUTF8,
//   encodeUTF8,
//   decodeBase64,
//   encodeBase64
// } from 'tweetnacl-util';

// import Switch from 'react-toggle-switch';
import Switch from 'react-switch';

import { Button, ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem, NavItem } from 'reactstrap';
import { faCheckCircle, faTimesCircle, faUserLock, faFileContract } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import './messaging.component.css';

class MessagingComponent extends React.Component {

    files = [];
    uploadSelectTypes = [
        {
            label: '',
            selector: ''
        }
    ];

    constructor(props) {
        super(props);
        this.state = {
            recipientEthereumAccount: '',
            recipientContractAddress: '',
            accountSelected: false,
            enableEncryption: false,
            dropdownOpen: false
        };
    }

    /**
     * Upload a file
     * @param event 
     */
    async captureFile(event) {
        event.stopPropagation();
        event.preventDefault();

        const file = await event.target.files[0];
        this.setState({ uploadingFile: true, file: file });

        let reader = new window.FileReader();
        reader.readAsArrayBuffer(file);
        reader.onloadend = () => { this.convertToBuffer(reader); }
        this.setState({uploadFileName: file.name, uploadingFile: false });
    }

    /**
     * convert the reader to a buffer and set the state
     */
    convertToBuffer = async(reader) => {
        const buffer = await Buffer.from(reader.result);
        this.setState({buffer: buffer});
    }

    /**
     * Add the uploaded file to IPFS
     */
    async onIPFSSubmit(event) {
        event.preventDefault();
        // const type = this[event.target.name];
        // default behavior: upload file unencrypted and add to user's upload directory
        let uploadContent = Buffer.from(this.state.buffer);
        let dir = '/content/' + this.props.senderAddress + '/uploads/';

        if (this.state.enableEncryption) {
            uploadContent = await this.getEncryptedFile();
            dir = '/content/' + this.state.recipientEthereumAddress + '/inbox/' + this.props.senderAddress + '/';
        }
        // add to recipient's inbox
        // check if directory already exists
        await IPFSDatabase.readDirectory(dir, async (err, res) => {
            if (err) {
                // if not exits, then create it
                await IPFSDatabase.createDirectory(dir, Buffer.from(uploadContent));
            }
            await this.addFile(dir, Buffer.from(uploadContent));
        });
        this.setState({accountSelected: false});
    }

    async getEncryptedFile() {
        const recipientContractAddress = this.state.recipientContractAddress;
        const senderContractAddress = this.props.senderContractAddress
        
        if (recipientContractAddress !== '' && senderContractAddress !== '') {
            const sharedEncryptionKey = await EncryptionUtils.createSharedKey(
                this.props.web3, this.props.senderAddress, 
                this.state.recipientEthereumAddress, 
                senderContractAddress, 
                recipientContractAddress
            );
            // encrypt the buffer
            const encrypted = EncryptionUtils.encrypt(sharedEncryptionKey, this.state.buffer);
            return encrypted;
            // this.setState({encryptedMessage: encrypted});
        } else {
            alert('Could not find a public/private keys for the specified account');
        }
    }

    async addFile(dir, content) {
        await IPFSDatabase.addFile(dir, content, this.state.uploadFileName,
            (err, res) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log(res);
                    this.setState({ recipientContractAddress: '' });
                }
            }
        );
    }

    setRecipient(event) {
        const recipientAcctId = event.target.value;
        this.setState({ recipientEthereumAddress: recipientAcctId });
        if (this.state.accountSelected) {
           this.setState({accountSelected: false});
        }
    }

    async verifyRecipient(e) {
        const recipientAcctId = e.target.value;
        // this.setState({accountSelected: true});
        await IPFSDatabase.getContractAddress(recipientAcctId, (err,res) => {
            if (err) {
                this.setState({verified: false});
            } else {
                this.setState({verified: true});
                this.setState({recipientContractAddress: res.toString()});
            }
        });
    }

    toggleDropdown() {
        this.setState({
            dropdownOpen: !this.state.dropdownOpen
        });
    }

    onToggleEncryption() {
        this.setState({enableEncryption: true});
    }

    clearFile() {
        this.setState({ file: null, enableEncryption: false });
    }

    render() {
        this.toggleDropdown = this.toggleDropdown.bind(this);
        this.clearFile      = this.clearFile.bind(this);
        return (
            <div className="messaging-container">
                {/* <link
                    rel='stylesheet'
                    href='https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.1.3/css/bootstrap.min.css'
                /> */}
                <div className="send-message-container">
                    <div className="upload-type-selector">
                        <If condition={this.state.enableEncryption === true}>
                            <FontAwesomeIcon icon={faUserLock} />
                        </If>
                        <p>Upload Files</p>
                    </div>
                    <If condition={!this.state.file}>
                        <input type="file" onChange={this.captureFile.bind(this)} />
                        <Else>
                            <div className="upload-selection-container">
                                <div>
                                    <Button color="info" onClick={this.clearFile}>
                                        Clear
                                    </Button>
                                    <span>
                                        {this.state.uploadFileName}
                                    </span>
                                </div>
                                <ButtonDropdown isOpen={this.state.dropdownOpen} toggle={this.toggleDropdown} >
                                    <DropdownToggle color="primary" caret>
                                        Upload
                                    </DropdownToggle>
                                    <DropdownMenu>
                                        <DropdownItem name="upload" onClick={this.onIPFSSubmit.bind(this)}>
                                            Upload
                                        </DropdownItem>
                                        <DropdownItem name="encrypt" disabled={this.props.contractAddress === ""} onClick={this.onToggleEncryption.bind(this)}>
                                            Encrypted Upload
                                        </DropdownItem>
                                    </DropdownMenu>
                                </ButtonDropdown>
                            </div>
                            <div className="upload-container">
                                <If condition={this.state.enableEncryption === true}>
                                    <div>
                                        <label for="ethereum-account-selector">
                                            Select recipient ethereum account
                                        </label>
                                        <input name="ethereum-account-selector" type="text" placeholder="0x..." onChange={this.verifyRecipient.bind(this)} />
                                        <If condition={!this.state.accountSelected}>
                                            <Button onClick={this.verifyRecipient.bind(this)}>
                                                Verify
                                            </Button>
                                            <Else>
                                                <If condition={!this.state.verified}>
                                                    <div className="not-verified">
                                                        <FontAwesomeIcon icon={faTimesCircle} />
                                                        <p>
                                                            Not a valid account.
                                                        </p>
                                                    </div>
                                                    <Else>
                                                        <div className="verified">
                                                            <FontAwesomeIcon icon={faCheckCircle} />
                                                        </div>
                                                    </Else>
                                                </If>
                                            </Else>
                                        </If>
                                        <br></br>
                                        <If condition={this.state.recipientContractAddress !== ''}>
                                            {/* <input type="file" onChange={this.captureFile.bind(this)} />
                                            <button type="submit" onClick={this.onIPFSSubmit.bind(this)}>
                                                Send it!
                                            </button> */}
                                            {/* <input type="checkbox" id="encryption" name="encryption" onChange={this.onToggleEncryption.bind(this)} />
                                            <label for="encryption">Encrypt</label> */}
                                        </If>
                                    </div>      
                                </If>
                            </div>
                        </Else>
                    </If>
                </div>
            </div>
        );
    }
}

export default MessagingComponent;
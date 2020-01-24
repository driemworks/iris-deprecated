import React, { Component } from "react";
import {IPFSDatabase} from '../../db/ipfs.db';
import { If, Else, Elif } from 'rc-if-else';
import { EncryptionUtils } from '../../encryption/encrypt.service';
import { box, randomBytes } from 'tweetnacl';
import {
  decodeUTF8,
  encodeUTF8,
  decodeBase64,
  encodeBase64
} from 'tweetnacl-util';

// import Switch from 'react-toggle-switch';
import Switch from 'react-switch';

import { faCheckCircle, faTimesCircle, faUserLock } from "@fortawesome/free-solid-svg-icons";
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
            enableEncryption: false
        };
    }

    /**
     * Upload a file
     * @param event 
     */
    async captureFile(event) {
        event.stopPropagation();
        event.preventDefault();

        // this.setState({ uploadingFile: true });
        const file = await event.target.files[0];
        // const uploadFileSize = event.target.files[0].size;
        // console.log('file size ' + uploadFileSize);
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
        this.setState({accountSelected: true});
        const recipientContractAddress = await IPFSDatabase.getContractAddress(this.state.recipientEthereumAddress, (err,res) => {
            if (err) {
                this.setState({verified: false});
            } else {
                this.setState({verified: true});
                this.setState({recipientContractAddress: res.toString()});
            }
        });
    }

    onToggleEncryption() {
        this.setState(prevState => {
            return {
                enableEncryption: !prevState.enableEncryption
            }
        });
    }

    render() {
        return (
            <div className="messaging-container">
                <div className="send-message-container">
                    <div className="upload-type-selector">
                        <If condition={this.state.enableEncryption === true}>
                            <FontAwesomeIcon icon={faUserLock} />
                        </If>
                        <p>Upload Files</p>
                        <Switch onChange={this.onToggleEncryption.bind(this)} checked={this.state.enableEncryption} />
                    </div>
                    <If condition={this.state.enableEncryption === true}>
                        <div>
                            <label for="ethereum-account-selector">
                                Select recipient ethereum account
                            </label>
                            <input name="ethereum-account-selector" type="text" placeholder="0x..." onChange={this.setRecipient.bind(this)} />
                            <If condition={!this.state.accountSelected}>
                                <button type="submit" onClick={this.verifyRecipient.bind(this)}>
                                    Verify
                                </button>
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
                            <If condition={this.state.recipientContractAddress != ''}>
                                {/* <input type="file" onChange={this.captureFile.bind(this)} />
                                <button type="submit" onClick={this.onIPFSSubmit.bind(this)}>
                                    Send it!
                                </button> */}
                                {/* <input type="checkbox" id="encryption" name="encryption" onChange={this.onToggleEncryption.bind(this)} />
                                <label for="encryption">Encrypt</label> */}
                            </If>
                        </div>      
                        {/* <Else>
                            <div>
                                <p>Upload file</p>
                            </div>
                        </Else>                   */}
                    </If>
                    <input type="file" onChange={this.captureFile.bind(this)} />
                    <button type="submit" onClick={this.onIPFSSubmit.bind(this)}>
                        Send it!
                    </button>
                </div>
            </div>
        );
    }
}

export default MessagingComponent;
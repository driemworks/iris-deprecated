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

import { faCheckCircle, faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import './messaging.component.css';

class MessagingComponent extends React.Component {

    files = [];

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

        const encryptedFile = await this.getEncryptedFile();
        // add to recipient's inbox
        const dir = '/content/' + this.state.recipientEthereumAddress + '/inbox/' + this.props.senderAddress + '/';
        console.log('adding file to directory ' + dir);
        // check if directory already exists
        await IPFSDatabase.readDirectory(dir, async (err, res) => {
            if (err) {
                // if not exits, then create it
                await IPFSDatabase.createDirectory(dir, Buffer.from(encryptedFile));
            }
            await this.addFile(dir, Buffer.from(encryptedFile));
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
        const encryptionState = this.setState({enableEncryption: !this.state.enableEncryption});
    }

    render() {
        return (
            <div className="messaging-container">
                <div className="send-message-container">
                    <p>Send encrypted messages</p>
                    <label for="ethereum-account-selector">
                        Select recipient ethereum account
                    </label>
                    <input name="ethereum-account-selector" type="text" placeholder="0x..." onChange={this.setRecipient.bind(this)} />
                    <If condition={!this.state.accountSelected}>
                        <button type="submit" onClick={this.verifyRecipient.bind(this)}>
                            Verify
                        </button>
                        <input type="checkbox" id="encryption" name="encryption" onChange={this.onToggleEncryption.bind(this)} />
                        <label for="encryption">Encrypt</label>
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
                        <input type="file" onChange={this.captureFile.bind(this)} />
                        <button type="submit" onClick={this.onIPFSSubmit.bind(this)}>
                            Send it!
                        </button>
                    </If>
                </div>
            </div>
        );
    }
}

export default MessagingComponent;
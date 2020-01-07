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

class MessagingComponent extends React.Component {

    files = [];

    constructor(props) {
        super(props);
        this.state = {
            recipientEthereumAccount: '',
            recipientContractAddress: ''
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
        const recipientContractAddress = this.state.recipientContractAddress;
        const senderContractAddress = this.props.senderContractAddress
        const buffer = await Buffer.from(reader.result);

        if (recipientContractAddress !== '' && senderContractAddress !== '') {
            const sharedEncryptionKey = await EncryptionUtils.createSharedKey(
                this.props.web3, this.props.senderAddress, 
                this.state.recipientEthereumAddress, senderContractAddress, 
                recipientContractAddress
            );
            // // encrypt the buffer
            const encrypted = EncryptionUtils.encrypt(sharedEncryptionKey, buffer);
            this.setState({encryptedMessage: encrypted});
        } else {
            alert('Could not find a public/private keys for the specified account');
        }
    }

    /**
     * Add the uploaded file to IPFS
     */
    async onIPFSSubmit(event) {
        event.preventDefault();
        // add to recipient's inbox
        const dir = '/content/' + this.state.recipientEthereumAddress + '/inbox/' + this.props.senderAddress + '/';
        console.log('adding file to directory ' + dir);
        // 1) check if directory already exists
        await IPFSDatabase.readDirectory(dir, async (err, res) => {
            if (err) {
                // 2) if not exits, then create it
                await IPFSDatabase.createDirectory(dir);
                // 3a) add file
                const addfile = await IPFSDatabase.addFile(dir, Buffer.from(this.state.encryptedMessage), this.state.uploadFileName,
                (err, res) => {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(res);
                        this.setState({ recipientContractAddress: '' });
                    }
                });
            } else {
                // 3b) just add file
                const addfile = await IPFSDatabase.addFile(dir, Buffer.from(this.state.encryptedMessage), this.state.uploadFileName,
                (err, res) => {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(res);
                        this.setState({ recipientContractAddress: '' });
                    }
                });
            }
        });
    }

    setRecipient(event) {
        const recipientAcctId = event.target.value;
        this.setState({ recipientEthereumAddress: recipientAcctId });
    }

    async verifyRecipient(e) {
        const recipientContractAddress = await IPFSDatabase.getContractAddress(this.state.recipientEthereumAddress, (err,res) => {
            if (err) {
                console.log('error! ' + err);
                this.setState({recipientContractAddress: ''});
            } else {
                console.log('success! ' + res);
                this.setState({recipientContractAddress: res.toString()});
            }
        });
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
                    <If condition={this.state.recipientContractAddress === ''}>
                        <button type="submit" onClick={this.verifyRecipient.bind(this)}>
                            Verify
                        </button>
                        <Else>
                            Verified
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
import React, { Component } from "react";
import {IPFSDatabase} from '../../db/ipfs.db';
import { If, Else, Elif } from 'rc-if-else';

class MessagingComponent extends React.Component {

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
        console.log('sending from account ' + this.state.defaultAccount);
        console.log('sending TO account ' + this.state.selectedAccount);
        const buffer = await Buffer.from(reader.result);
        // get the hash from the contractMap array
        // const recipientContractAddress = await this.findContractAddressForAccount(this.state.selectedAccount);
        // const senderContractAddress = await this.findContractAddressForAccount(this.state.defaultAccount);

        // if (recipientContractAddress !== '' && senderContractAddress !== '') {
        //     const sharedEncryptionKey = await this.createSharedKeyEncryption(
        //     senderContractAddress, recipientContractAddress
        //     );
        //     // // encrypt the buffer
        //     const encrypted = EncryptionUtils.encrypt(sharedEncryptionKey, buffer);
        //     this.setState({encryptedMessage: encrypted});
        //     this.setState({buffer});
        // } else {
        //     alert('Could not find a public/private keys for the specified account');
        // }
    }

    /**
     * Add the uploaded file to IPFS
     */
    async onIPFSSubmit(event) {
        event.preventDefault();
        const dir = '/content';
        console.log('adding file to directory ' + dir);
        // const res = await IPFSDatabase.addFile(
        //     dir, 
        //     this.state.encryptedMessage,
        //     this.state.uploadFileName
        // );
        // console.log('ipfs upload response ' + JSON.stringify(res));
        // await ipfs.add(
        //   {
        //     path: '/tmp/' + this.state.uploadFileName,
        //     content: this.state.encryptedMessage
        //   }, { progress: this.progress }, async (err, res) => {
        //     const ipfsHash = res[1].hash;
        //     const contract = await this.getContract(
        //       await this.findContractAddressForAccount(this.state.defaultAccount)
        //     );
        //     await contract.addToInbox(ipfsHash, {from:this.state.defaultAccount});
        //     this.setState({ipfsHash: ipfsHash});
        //     this.readInbox(this.state.defaultAccount);
        //   }
        // ); 
    }

    setRecipient(event) {
        const recipientAcctId = event.target.value;
        this.setState({ recipientContractAddressm: recipientAcctId });
        // const recipientContractAddress = await IPFSDatabase.getContractAddress(recipientEthereumAccountId);
        // if (recipientContractAddress) {
            
        // }
    }

    async verifyRecipient(e) {
        const recipientContractAddress = await IPFSDatabase.getContractAddress(this.state.recipientAcctId);
        if (recipientContractAddress) {
            
        } else {
            alert('recipient account does not have encryption keys available.');
        }
    }
    
    render() {
        return (
            <div className="messaging-container">
                <div className="inbox-container">
                    <p>Inbox</p>
                </div>
                <div className="send-message-container">
                    <p>Send encrypted messages</p>
                    <form id="ipfs-hash-form" className="scep-form" onSubmit={this.onIPFSSubmit.bind(this)}>
                        <label for="ethereum-account-selector">
                            Select recipient ethereum account
                        </label>
                        <input name="ethereum-account-selector" type="text" placeholder="0x..." onChange={this.setRecipient.bind(this)} />
                        <button type="submit" onClick={this.verifyRecipient}>
                            Go!
                        </button>
                        <If condition={this.state.recipientContractAddress != ''}>
                            <input type="file" onChange={this.captureFile.bind(this)} />
                            <button type="submit">
                                Send it!
                            </button>
                        </If>
                    </form>
                </div>
            </div>
        );
    }
}

export default MessagingComponent;
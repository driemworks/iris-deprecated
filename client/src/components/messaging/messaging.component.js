import React, { Component } from "react";
import {IPFSDatabase} from '../../db/ipfs.db';
import { If, Else, Elif } from 'rc-if-else';
import truffleContract from '@truffle/contract';
import { EncryptionUtils } from '../../encryption/encrypt.service';
import EncryptionKeys from '../../contracts/EncryptionKeys.json';
import { box, randomBytes } from 'tweetnacl';
import {
  decodeUTF8,
  encodeUTF8,
  decodeBase64,
  encodeBase64
} from 'tweetnacl-util';

class MessagingComponent extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            recipientEthereumAccount: '',
            recipientContractAddress: '',
            inbox: []
        };
    }

    componentDidMount() {
        this.readInbox();
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
        console.log('sending from account ' + this.props.senderAddress);
        console.log('sending TO account ' + this.state.recipientEthereumAddress);
        const buffer = await Buffer.from(reader.result);

        if (recipientContractAddress !== '' && senderContractAddress !== '') {
            const sharedEncryptionKey = await this.createSharedKeyEncryption(
                this.props.senderAddress, this.state.recipientEthereumAddress,
                senderContractAddress, recipientContractAddress
            );
            // // encrypt the buffer
            const encrypted = EncryptionUtils.encrypt(sharedEncryptionKey, buffer);
            this.setState({encryptedMessage: encrypted});
            this.setState({buffer});
        } else {
            alert('Could not find a public/private keys for the specified account');
        }
    }

    async createSharedKeyEncryption(senderEthereumAddress, recipientEthereumAddress, 
                                    senderContractAddress, recipientContractAddress) {
        // sender secret key
        const senderContract = await this.getContract(senderContractAddress);
        const secretKeySendingAccount = await senderContract.getPrivateKey(
          { from: senderEthereumAddress }
        );
    
        // recipient public key
        const recipientContract = await this.getContract(recipientContractAddress);
        const publicKeySelectedAccount = await recipientContract.getPublicKey(
          { from: recipientEthereumAddress }
        );
    
        const publicKeyRecipient = decodeBase64(publicKeySelectedAccount.logs[0].args['0']);
        const secretKeySender = decodeBase64(secretKeySendingAccount.logs[0].args['0']);
        // create shared key
        return box.before(
          publicKeyRecipient,
          secretKeySender
        );
    }    

    async getContract(address) {
        const contract = truffleContract(EncryptionKeys);
        contract.setProvider(this.props.web3.currentProvider);
        return await contract.at(address);
      }

    /**
     * Add the uploaded file to IPFS
     */
    async onIPFSSubmit(event) {
        event.preventDefault();
        // add to recipient's inbox
        const dir = '/content/' + this.state.recipientEthereumAddress + '/inbox/' + this.props.senderAddress + '/';
        console.log('adding file to directory ' + dir);
        const addfile = await IPFSDatabase.addFile(dir, Buffer.from(this.state.buffer), this.state.uploadFileName,
            (err, res) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log(res);
                }
            });
    }

    async onDownload(item) {
        // event.preventDefault();
        //get file
        // filename will be the selected li element key
        const directory = '/content/' + this.state.senderAddress + '/inbox/' + item;
        IPFSDatabase.readFile()
        // decrypt file
        // download
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

    async readInbox() {
        const dir = '/content/' + this.props.senderAddress + '/inbox';
        console.log('reading inbox directory ' + dir);
        // get current ethereum address
        await IPFSDatabase.readDirectory(dir, (err, res) => {
            if (err) {
                console.log('failed to read directory contents');
            } else {
                let files = [];
                res.forEach(r => {
                    console.log('file? ' + JSON.stringify(r));
                    files.push(r.name);
                });
                this.setState({ inbox: files });
                console.log('dir contents ' + JSON.stringify(res));
            }
        });
    }
    
    render() {
        return (
            <div className="messaging-container">
                <div className="inbox-container">
                    <p>Inbox</p>
                    <button onClick={this.readInbox.bind(this)}>Refresh</button>
                    <div>
                        <ul>
                            {this.state.inbox.map(item => 
                                <li key={item}>
                                    <div>
                                        {item}
                                        <button onClick={() => this.onDownload(item)}>
                                            Download
                                        </button>
                                    </div>
                                </li>)}
                        </ul>
                    </div>
                </div>
                <div className="send-message-container">
                    <p>Send encrypted messages</p>
                    <label for="ethereum-account-selector">
                        Select recipient ethereum account
                    </label>
                    <input name="ethereum-account-selector" type="text" placeholder="0x..." onChange={this.setRecipient.bind(this)} />
                    <button type="submit" onClick={this.verifyRecipient.bind(this)}>
                        Go!
                    </button>
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
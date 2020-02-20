import React from "react";
import {IPFSDatabase} from '../../db/ipfs.db';
import { If, Else } from 'rc-if-else';
import { EncryptionUtils } from '../../encryption/encrypt.service';
import { box } from 'tweetnacl';
import { decodeBase64 } from 'tweetnacl-util';

import { Modal, ModalHeader, ModalBody, ModalFooter,
          Alert, Button, ButtonDropdown, DropdownToggle, 
          DropdownMenu, DropdownItem
        } from 'reactstrap';
import { faTimesCircle, faUserLock } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import store from '../../state/store/index';
import { addToQueue, removeFromQueue } from '../../state/actions/index';

import './upload.component.css';
import UploadQueueComponent from "./queue/upload-queue.component";
import ReactDOM from 'react-dom';
import { uploadDirectory, inboxDirectory, publicKeyDirectory, localStorageConstants } from "../../constants";

class UploadComponent extends React.Component {

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
            recipientPublicKey: '',
            accountSelected: false,
            enableEncryption: false,
            dropdownOpen: false,
            showAlert: false,
            modal: false,
            uploading: false,
            uploadQueue: []
        };
        store.subscribe(() => {
            this.setState({ uploadQueue: store.getState().uploadQueue });
        });
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
        const buffer = Buffer.from(reader.result);
        this.setState({buffer: buffer});
    }

    /**
     * Add the uploaded file to IPFS
     */
    async onIPFSSubmit(event) {
        if (event) {
            event.preventDefault();
        }
        
        this.setState({uploading: true});
        // default behavior: upload file unencrypted and add to user's upload directory
        let uploadContent = Buffer.from(this.state.buffer);
        let dir = uploadDirectory(this.props.user.account);

        if (this.state.enableEncryption) {
            const item = {
                startTime : new Date().getTime(),
                filename: this.state.uploadFileName,
                recipient: this.state.recipientEthereumAddress
            };
            store.dispatch(addToQueue(item));
            uploadContent = await this.encryptFile();
            store.dispatch(removeFromQueue(item));
            dir = inboxDirectory(this.state.recipientEthereumAddress) + this.props.user.account + '/';
        }
        // add to recipient's inbox
        // make sure the directory exists
        await IPFSDatabase.createDirectory(dir);
        await this.addFile(dir, Buffer.from(uploadContent));
        this.showAlert();
        this.setState({accountSelected: false, file: null, uploading: false});
    }

    async encryptFile() {
        // const recipientContractAddress = this.state.recipientContractAddress;
        // const senderContractAddress = this.props.user.contract;
        const secretKeySender = new Uint8Array(localStorage.getItem(localStorageConstants.PRIV_KEY));
        const recipientPublicKey = new Uint8Array(this.state.recipientPublicKey);
        const sharedKey = box.before(recipientPublicKey, secretKeySender);
        const encrypted = EncryptionUtils.encrypt(sharedKey, this.state.buffer);
        return encrypted;
        // if (recipientContractAddress !== '' && senderContractAddress !== '') {
        //     // create a new secret key
        //     // create shared encryption key
        //     // destroy the secret key
        //     const sharedEncryptionKey = await ContractService.createSharedKey(
        //         this.props.web3, this.props.user.account, 
        //         this.state.recipientEthereumAddress, 
        //         senderContractAddress, 
        //         recipientContractAddress
        //     );
            // encrypt the buffer
        // } else {
        //     alert('Could not find a public/private keys for the specified account');
        // }
    }

    async addFile(dir, content) {
        await IPFSDatabase.addFile(dir, content, this.state.uploadFileName,
            (err, res) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log(res);
                    this.setState({ recipientPublicKey: '' });
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
        if (recipientAcctId !== "") {
            this.setState({ recipientEthereumAddress: recipientAcctId, 
                            accountSelected: recipientAcctId !== "" });
            const dir = publicKeyDirectory(recipientAcctId) + 'public-key.txt';
            const res = await IPFSDatabase.readFile(dir);
            if (!res) {
                this.setState({verified: false});
            } else {
                this.setState({verified: true});
                this.setState({recipientPublicKey: res.toString()});
            }
        }
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
        this.setState({ file: null, enableEncryption: false, accountSelected: false });
    }

    showAlert() {
        this.setState({showAlert: true});
        setTimeout(function() {
            this.setState({showAlert: false});
        }.bind(this), 5000); 
    }

    showModal() {
        const modalState = this.state.modal;
        this.setState({ modal: !modalState });
    }

    onConfirm() {
        this.setState({ modal: false, file: null,accountSelected: false, enableEncryption: false });
        this.onIPFSSubmit();
    }

    onCancel() {
        this.setState({ modal: false });
    }

    render() {
        this.toggleDropdown = this.toggleDropdown.bind(this);
        this.clearFile      = this.clearFile.bind(this);
        this.showModal      = this.showModal.bind(this);

        if (!this.props.user) {
            return (
                <div></div>
            );
        }

        return (
            <div className="upload-container">
                <If condition={this.state.uploadQueue.length > 0}>
                    <UploadQueueComponent 
                        uploadQueueItems = {this.state.uploadQueue}
                    />
                </If>
                <div className="send-message-container">
                    <div className="upload-type-selector">
                        <If condition={this.state.enableEncryption === true}>
                            <FontAwesomeIcon icon={faUserLock} />
                        </If>
                        <p>Upload Files</p>
                        <Alert className="upload-alert" color="info" isOpen={this.state.showAlert}>
                            File uploaded successfully
                        </Alert>
                    </div>
                    <If condition={!this.state.file}>
                        <div className="file-selector">
                            <input type="file" onChange={this.captureFile.bind(this)} />
                        </div>
                        <Else>
                            <Else>
                                <div className="upload-selection-container">
                                    <div>
                                        <span>
                                            {this.state.uploadFileName}
                                        </span>
                                        <FontAwesomeIcon className="clear-upload" onClick={this.clearFile} icon={faTimesCircle} />
                                    </div>
                                    <If condition={this.state.enableEncryption === false}>
                                        <ButtonDropdown className="button-dropdown" isOpen={this.state.dropdownOpen} toggle={this.toggleDropdown} >
                                            <DropdownToggle className="upload-button" color="info" disabled={this.state.accountSelected === true}>
                                                Upload
                                            </DropdownToggle>
                                            <DropdownMenu>
                                                <DropdownItem name="upload" onClick={this.onIPFSSubmit.bind(this)}>
                                                    Upload
                                                </DropdownItem>
                                                <DropdownItem name="encrypt" onClick={this.onToggleEncryption.bind(this)}>
                                                    Encrypted Upload
                                                </DropdownItem>
                                            </DropdownMenu>
                                        </ButtonDropdown>
                                    </If>
                                </div>
                                <div className="upload-container">
                                    <If condition={this.state.enableEncryption === true}>
                                        <div className="account-container">
                                            <label for="ethereum-account-selector">
                                                Select recipient ethereum account
                                            </label>
                                            <input name="ethereum-account-selector" type="text" placeholder="0x..." onChange={this.verifyRecipient.bind(this)} />
                                            <If condition={!this.state.verified}>
                                                <div className="not-verified">
                                                    <If condition={!this.state.accountSelected}>
                                                        <p>
                                                            Select an ethereum account
                                                        </p>
                                                        <Else>
                                                            <FontAwesomeIcon icon={faTimesCircle} />
                                                            <p>
                                                                Not a valid account.
                                                            </p>
                                                        </Else>
                                                    </If>
                                                </div>
                                                <Else>
                                                    <div className="verified">
                                                        <Button color="success" onClick={this.showModal}>
                                                            Go
                                                        </Button>
                                                        <Modal isOpen={this.state.modal} fade={false}
                                                            toggle={this.showModal} className="modal-container">
                                                            <ModalHeader toggle={this.showModal}>
                                                                Encrypt file.
                                                            </ModalHeader>
                                                            <ModalBody>
                                                                You are about to encrypt this file. 
                                                                This will cost ethereum in order to retrieve your encryption keys.
                                                                Do you wish to proceed?
                                                            </ModalBody>
                                                            <ModalFooter className="modal-footer-container">
                                                                <Button className="confirm action-button" onClick={this.onConfirm.bind(this)} color="success">
                                                                    Confirm
                                                                </Button>
                                                                <Button className="cancel action-button" onClick={this.onCancel.bind(this)} color="danger">
                                                                    Cancel
                                                                </Button>
                                                            </ModalFooter>
                                                        </Modal>
                                                    </div>
                                                </Else>
                                            </If>
                                        </div>      
                                    </If>
                                </div>   
                            </Else>
                        </Else>
                    </If>
                </div>
            </div>
        );
    }
}

ReactDOM.render(<UploadQueueComponent />, document.getElementById('root'));
export default UploadComponent;
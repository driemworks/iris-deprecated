import React from "react";
import {IPFSDatabase} from '../../db/ipfs.db';
import { If, Else } from 'rc-if-else';
import { EncryptionService } from '../../service/encrypt.service';
import { UserService } from '../../service/user.service';
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
import { HD_PATH_STRING, uploadDirectory, inboxDirectory, publicKeyDirectory, localStorageConstants } from "../../constants";

import lightwallet from 'eth-lightwallet';

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

    async encryptFile(recipientAddress, data) {
        // use eth lightwallet to encrypt
        // lightwallet.keystore.createVault({ 
        //     password: password, hdPathString: HD_PATH_STRING, seedPhrase: seedPhrase
        //   }, function(err, ks) {
        //     if (err) throw err;
        //     ks.keyFromPassword(password, (err, pwDerivedKey) => {
        //       if (!ks.isDerivedKeyCorrect(pwDerivedKey)) {
        //         throw new Error('Incorrect derived key!');
        //       }

        //       const recipientPublicKey = lightwallet.encryption.addressToPublicEncKey(ks, pwDerivedKey, recipientAddress);
        //       console.log(recipientPublicKey);

        //     //   lightwallet.encryption.multiEncryptString(
        //     //       ks, pwDerivedKey, data, reci
        //     //   )

        //     });
        //   });

        // decrypt the secret key from local storage
        // const secretKeySender = await UserService.decryptSecretKey(this.props.user.account);
        // const recipientPublicKey = this.state.recipientPublicKey;
        // const sharedKey = box.before(recipientPublicKey, new Uint8Array(secretKeySender.data));
        // const encrypted = EncryptionService.encrypt(sharedKey, this.state.buffer);
        // return encrypted;
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
                this.setState({recipientPublicKey: res});
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
                                        <FontAwesomeIcon className="clear-upload" className="clear-upload" onClick={this.clearFile} icon={faTimesCircle} />
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
                                        <div className="select-account-container">
                                            <label className="account-select-label" for="ethereum-account-selector">
                                                Select recipient ethereum account
                                            </label>
                                            <input name="ethereum-account-selector" className="ethereum-account-selector" type="text" placeholder="0x..." onChange={this.verifyRecipient.bind(this)} />
                                            <If condition={!this.state.verified}>
                                                <div className="not-verified">
                                                    <If condition={this.state.accountSelected}>
                                                        <FontAwesomeIcon icon={faTimesCircle} />
                                                        <p>
                                                            Not a valid account.
                                                        </p>
                                                    </If>
                                                </div>
                                                <Else>
                                                    <div className="verified">
                                                        <Button color="success" onClick={this.onConfirm.bind(this)}>
                                                            Go
                                                        </Button>
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
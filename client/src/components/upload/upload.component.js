import React from "react";
import ReactDOM from 'react-dom';

import EthService from '../../service/eth.service';
import { IPFSDatabase } from '../../db/ipfs.db';
import { IPFSService } from '../../service/ipfs.service';
import { If, Else } from 'rc-if-else';
import { box } from 'tweetnacl';

import { Modal, ModalHeader, ModalBody, ModalFooter,
          Alert, Button, ButtonDropdown, DropdownToggle, 
          DropdownMenu, DropdownItem
        } from 'reactstrap';
import { faTimesCircle, faUserLock } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import store from '../../state/store/index';
import { addToQueue, removeFromQueue } from '../../state/actions/index';

import { encode } from '@stablelib/base64'

import './upload.component.css';
import UploadQueueComponent from "./queue/upload-queue.component";
import { HD_PATH_STRING, uploadDirectory, inboxDirectory, publicKeyDirectory, localStorageConstants } from "../../constants";


import lightwallet from 'eth-lightwallet';

class UploadComponent extends React.Component {

    files = [];

    constructor(props) {
        super(props);
        this.state = {
            uploading: false,
            uploadQueue: []
        };
        store.subscribe(() => {
            this.setState({ uploadQueue: store.getState().uploadQueue });
        });
    }

    uploadFile(event) {
        this.captureFile(event);
        this.onIPFSSubmit();
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
        reader.onloadend = async () => { 
            const buffer = Buffer.from(reader.result);
            await this.onIPFSSubmit(buffer);
        }

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
    async onIPFSSubmit(buffer) {
        await this.encryptAndUploadFile(buffer);
    }

    // TODO - this whole thing needs to be in a common place
    async encryptAndUploadFile(data) {
        const ks = this.props.wallet.ks;
        const pwDerivedKey = this.props.wallet.pwDerivedKey;
        const address = this.props.wallet.address;
        // get your own public key
        const publicKey = lightwallet.encryption.addressToPublicEncKey(
            ks, pwDerivedKey, address);
        const publicKeyArray = [publicKey];
        // encrypt for yourself
        const encryptedData = lightwallet.encryption.multiEncryptString(
            ks, pwDerivedKey, encode(data), address, publicKeyArray
        );
        const encryptedJson = JSON.stringify(encryptedData);
        // add to IPFS and get the hash
        const uploadResponse = await IPFSDatabase.uploadFile(encryptedJson);
        const hash = uploadResponse[0].hash;
        // add to dir 
        const uploadObject = {
            filename: this.state.uploadFileName,
            ipfsHash: hash,
            uploadTime: new Date(),
            sharedWith: []
        };
        // need to add to existing array!
        // get existing directory
        // const existingUploadsData = await IPFSDatabase.readFile(dir + 'upload-data.json');
        // let json = JSON.parse(existingUploadsData);
        const dir = uploadDirectory(address);
        let json = await IPFSService.fileAsJson(dir + 'upload-data.json');
        json.push(uploadObject);
        await this.addFile(dir, Buffer.from(JSON.stringify(json)));
        this.props.fileUploadEventHandler();
    }

    // TODO - needs to be in a common place
    async addFile(dir, content) {
        await IPFSDatabase.addFile(dir, content, 'upload-data.json',
            (err, res) => {
                if (err) {
                    alert(err);
                } else {
                    this.setState({ recipientPublicKey: '' });
                }
            }
        );
    }

    clearFile() {
        this.setState({ file: null, enableEncryption: false, accountSelected: false });
    }

    render() {
        this.clearFile    = this.clearFile.bind(this);
        this.onIPFSSubmit = this.onIPFSSubmit.bind(this);
        return (
            <div className="upload-container">
                <div className="send-message-container">
                    <div className="file-selector">
                        <input type="file" id="file" className="file-chooser" onChange={this.captureFile.bind(this)} />
                        <label for="file" className="file-chooser-label">Select File</label>
                    </div>
                </div>
            </div>
        );
    }
}

ReactDOM.render(<UploadQueueComponent />, document.getElementById('root'));
export default UploadComponent;

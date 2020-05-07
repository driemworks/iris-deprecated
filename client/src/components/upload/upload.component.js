import React from "react";
import ReactDOM from 'react-dom';

// import EthService from '../../service/eth.service';
import { IPFSDatabase } from '../../db/ipfs.db';
import { IPFSService } from '../../service/ipfs.service';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';

// import { If, Else } from 'rc-if-else';
// import { box } from 'tweetnacl';

// import { faUserFriends, faUserLock } from "@fortawesome/free-solid-svg-icons";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { encode } from '@stablelib/base64'

import './upload.component.css';
import { privateUploadDirectory, publicUploadDirectory } from "../../constants";


import lightwallet from 'eth-lightwallet';

class UploadComponent extends React.Component {

    files = [];

    constructor(props) {
        super(props);
        this.state = {
            uploading: false,
            dropdownOpen: false
        };
    }

    uploadFile(event) {
        this.captureFile(event);
        // this.onIPFSSubmit();
    }

    /**
     * Upload a file
     * @param event 
     */
    async captureFile(event) {
        const type = event.target.id;
        event.stopPropagation();
        event.preventDefault();

        const file = await event.target.files[0];
        this.setState({ uploadingFile: true, file: file });

        let reader = new window.FileReader();
        reader.readAsArrayBuffer(file);
        reader.onloadend = async () => { 
            const buffer = Buffer.from(reader.result);
            await this.onIPFSSubmit(buffer, type);
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
    async onIPFSSubmit(buffer, uploadType) {
        const address = this.props.wallet.address;
        let data = null;
        let dir = '';
        if (uploadType === 'public') {
            data = buffer;
            dir = publicUploadDirectory(address);
        } else {
            data = await this.encryptAndUploadFile(buffer);
            dir = privateUploadDirectory(address);
        }
        await this.addAndUploadFile(data, dir, uploadType);
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
        return JSON.stringify(encryptedData);
    }

    async addAndUploadFile(data, dir, type) {
        // add data to IPFS
        const uploadResponse = await IPFSDatabase.addFile(data);
        const hash = uploadResponse[0].hash;
        // create json object with the hash, date, and name
        const uploadObject = {
            filename: this.state.uploadFileName,
            ipfsHash: hash,
            uploadTime: new Date(),
            type: type
        };
        // get existing file as json
        let json = await IPFSService.fileAsJson(dir + 'upload-data.json');
        // push new json to array
        json.push(uploadObject);
        // add to ipfs
        await this.addFile(dir, Buffer.from(JSON.stringify(json)));
        this.props.fileUploadEventHandler();
    }

    // TODO - needs to be in a common place
    async addFile(dir, content) {
        await IPFSDatabase.writeFile(dir + 'upload-data.json', content,
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

    toggleDropdown() {
        const dropdownStatus = this.state.dropdownOpen;
        this.setState({ dropdownOpen: !dropdownStatus });
    }

    render() {
        this.clearFile    = this.clearFile.bind(this);
        this.onIPFSSubmit = this.onIPFSSubmit.bind(this);
        this.toggleDropdown = this.toggleDropdown.bind(this);
        return (
            <div className="upload-container">
                <div className="send-message-container">
                    <Dropdown isOpen={this.state.dropdownOpen} toggle={this.toggleDropdown}>
                        <DropdownToggle caret>Upload</DropdownToggle>
                        <DropdownMenu>
                            <div className="dropdown-item-container">
                                <input type="file" id="public" className="file-chooser" onChange={this.captureFile.bind(this)} />
                                <label for="public">Public</label>
                            </div>
                            <div className="dropdown-item-container">
                                <input type="file" id="private" className="file-chooser" onChange={this.captureFile.bind(this)} />
                                <label for="private">Private (Encrypted)</label>
                            </div>
                        </DropdownMenu>
                    </Dropdown>
                    {/* <p>
                        NOTE: This button design is temporary
                    </p>
                    <div className="file-selector">
                        <input type="file" id="private" className="file-chooser" onChange={this.captureFile.bind(this)} />
                        <label for="private" className="file-chooser-label">Encrypted Upload</label>
                    </div>
                    <div className="file-selector">
                        <input type="file" id="public" className="file-chooser" onChange={this.captureFile.bind(this)} />
                        <label for="public" className="file-chooser-label">Public Upload</label>
                    </div> */}
                </div>
            </div>
        );
    }
}

export default UploadComponent;

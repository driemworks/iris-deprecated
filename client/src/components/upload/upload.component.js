import React from "react";

import { IPFSDatabase } from '../../db/ipfs.db';
import { ApiService } from '../../service/api.service';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';

import { encode } from '@stablelib/base64'

import store from '../../state/store/index';

import './upload.component.css'

import lightwallet from 'eth-lightwallet';

class UploadComponent extends React.Component {

    files = [];

    constructor(props) {
        super(props);
        this.state = {
            uploading: false,
            dropdownOpen: false,
            wallet: null
        };
    }

    componentDidMount() {
        store.subscribe(async () => {
            const wallet = store.getState().wallet;
            this.setState({ wallet: wallet });
        });
    }

    uploadFile(event) {
        this.captureFile(event);
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
        let data = null;
        if (uploadType === 'public') {
            data = buffer;
        } else {
            data = await this.encryptFile(buffer);
        }
        await this.addAndUploadFile(data, uploadType);
    }

    // TODO - this whole thing needs to be in a common place
    async encryptFile(data) {
        const ks = this.state.wallet.ks;
        const pwDerivedKey = this.state.wallet.pwDerivedKey;
        const address = this.state.wallet.address;
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

    async addAndUploadFile(data, type) {
        const uploadObject = {
            filename: this.state.uploadFileName,
            data: data,
            uploadTime: new Date(),
            type: type
        };
        await ApiService.upload(this.state.wallet.address, 'upload-data.json', uploadObject);
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
                                <label htmlFor="public">Public</label>
                            </div>
                            <div className="dropdown-item-container">
                                <input type="file" id="private" className="file-chooser" onChange={this.captureFile.bind(this)} />
                                <label htmlFor="private">Private (Encrypted)</label>
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

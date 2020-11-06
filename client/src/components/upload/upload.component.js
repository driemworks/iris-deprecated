import React from "react";

import { encode } from '@stablelib/base64'

import store from '../../state/store/index';
import { setEventData } from '../../state/actions/index';

import './upload.component.css'

import lightwallet from 'eth-lightwallet';
import PinningService from "../../service/pinning.service";
import { MercuryApiService } from "../../service/mercury.service";

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
            this.setState({
                wallet: store.getState().wallet,
                jwt: store.getState().jwt
            });
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
        this.setState({
            uploadingFile: true,
            file: file
        });

        let reader = new window.FileReader();
        reader.readAsArrayBuffer(file);
        reader.onloadend = async () => { 
            const buffer = Buffer.from(reader.result);
            await this.onIPFSSubmit(buffer, type);
        }

        this.setState({
            uploadFileName: file.name,
            uploadingFile: false
        });
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
        // call the pinning service
        const hash = PinningService.pin(data);
        const uploadEvent = {
            filename: this.state.uploadFileName,
            ipfsHash: hash,
            uploadTime: new Date()
        };
        await MercuryApiService.addEvent(
            this.state.jwt,
            this.state.wallet.address, 
            uploadEvent
        );
        const res = await MercuryApiService.retrieveEvents(this.state.jwt, 
            this.state.wallet.address, 10);
        store.dispatch(setEventData(res.data));
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
                    <input type="file" id="private" className="file-chooser" onChange={this.captureFile.bind(this)} />
                    <label htmlFor="private" className="file-chooser-label">Upload</label>
                </div>
            </div>
        );
    }
}

export default UploadComponent;

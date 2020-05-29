import React from 'react';
import ReactDOM from 'react-dom';

// services
import { IPFSDatabase } from '../../db/ipfs.db';

// constants
import { privateUploadDirectory, aliasDirectory,
         inboxDirectory, publicUploadDirectory } from '../../constants';

// components
import UploadComponent from '../upload/upload.component';

// service deps
import { If, Else, ElIf } from 'rc-if-else';
import { saveAs } from 'file-saver';

// ui elements
import { Spinner, Alert, Modal, ModalHeader, ModalBody } from 'reactstrap';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

import { faDownload, faShareSquare, faSync, 
    faLock, faUserFriends, faFolderOpen } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { encode, decode } from '@stablelib/base64';
import lightwallet from 'eth-lightwallet';

import './inbox.component.css';
import UserSearchComponent from '../user-search/user-search.component';
import { IPFSService } from '../../service/ipfs.service';
import { ApiService } from '../../service/api.service';

import store from '../../state/store/index';

class InboxComponent extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            uploadInbox: [],
            showModal: false,
            selectedItem: null,
            showAlertShare: false,
            showAlert: false
        };      
    }

    componentDidMount() {
        store.subscribe(() => {
            const wallet = store.getState().wallet;
            this.setState({ wallet: wallet });
            this.refreshFiles();
        });
    }

    async onDownload(item) {
        const ks = this.props.wallet.ks;
        const pwDerivedKey = this.props.wallet.pwDerivedKey;
        const address = this.props.wallet.address;
        // get your own public key
        let theirPublicKey = null;
        // upload-type based check
        if (item.type === 'public') {
            // if it's a public upload
            const data = await IPFSService.hashAsRawData(item.ipfsHash);
            this.download(data[0].content, item.filename);
        } else if (item.type === 'share') {
            // if the file has been shared with you
            // if item sender exists, get their public key
            const aliasDataJsonLocation = aliasDirectory(item.senderAddress, 'data.json');
            const aliasDataJson = await IPFSService.fileAsJson(aliasDataJsonLocation);
            theirPublicKey = aliasDataJson.publicKey;
            const decrypted = await this.decryptFromHash(item, ks, pwDerivedKey, theirPublicKey, address);
            this.download(decode(decrypted), item.filename);
        } else {
            // if it's your own private upload
            // get your own public key (your own private upload)
            theirPublicKey = lightwallet.encryption.addressToPublicEncKey(ks, pwDerivedKey, address);
            const decrypted = await this.decryptFromHash(item, ks, pwDerivedKey, theirPublicKey, address);
            this.download(decode(decrypted), item.filename);
        }
    }

    async decryptFromHash(item, ks, pwDerivedKey, theirPublicKey, address) {
        // get data based on hash
        const data = await IPFSService.hashAsJson(item.ipfsHash);
        // decrypt the data
        return lightwallet.encryption.multiDecryptString(
            ks, pwDerivedKey, data, theirPublicKey, address
        );
    }

    download(file, filename) {
        const mime = require('mime-types');
        const type = mime.lookup(filename);
        const blob = new Blob([file], {type: type});
        saveAs(blob, filename);
    }

    createData(sender, filename) {
        return { sender, filename, downloadPending: false };
    }

    async refreshFiles() {
        const uploads = await ApiService.read(this.state.wallet.address, 'uploads.json');
        console.log(uploads.data);
        this.setState({ uploadInbox: uploads });
        // debugger;
        // this.setState({ uploadInbox: [] });
        // // load your private uploads
        // const uploadFile = privateUploadDirectory(this.props.wallet.address, 'upload-data.json');
        // let fileItems = await IPFSService.fileAsJson(uploadFile);
        // // load shared files
        // const inboxFile = inboxDirectory(this.props.wallet.address, 'inbox-data.json');
        // const inboxItems = await IPFSService.fileAsJson(inboxFile);
        // fileItems = fileItems.concat(inboxItems);
        // // load your public uploads
        // const publicUploads = publicUploadDirectory(this.props.wallet.address, 'upload-data.json');
        // const publicUploadsItems = await IPFSService.fileAsJson(publicUploads);
        // fileItems = fileItems.concat(publicUploadsItems);
        // this.setState({uploadInbox: fileItems});
    }

    fileUploadStartedEvent() {
        this.showAlert();
        this.refreshFiles();
    }

    showAlert() {
        this.setState({showAlert: true});
        setTimeout(function() {
            this.setState({showAlert: false});
        }.bind(this), 3000); 
    }

    showAlertShare() {
        this.setState({showAlertShare: true});
        setTimeout(function() {
            this.setState({showAlertShare: false});
        }.bind(this), 3000); 
    }

    toggleModal() {
        const showModalState = this.state.showModal;
        this.setState({ showModal : !showModalState });
    }

    selectShareFile(item) {
        this.setState({ selectedItem: item });
        this.toggleModal();
    }

    async share(recipients) {
        this.toggleModal();
        // decrypt the fileconst ks = this.props.wallet.ks;
        // TODO move this to a common place
        const ks = this.props.wallet.ks;
        const pwDerivedKey = this.props.wallet.pwDerivedKey;
        const address = this.props.wallet.address;
        const alias = this.props.wallet.alias;
        const item = this.state.selectedItem;

        const filepath = privateUploadDirectory(address, 'upload-data.json');
        const data = await IPFSService.fileAsJson(filepath);
        const ipfsHash = this.getFileHash(item.filename, data);
        // get your own public key
        const publicKey = lightwallet.encryption.addressToPublicEncKey(ks, pwDerivedKey, address);
        const decoded = await this.decryptAndDecode(ipfsHash, ks, pwDerivedKey, publicKey, address);
        // very dirty... need to redo this later
        // can see how performance could be bad when lists are large
        // get ethereum address (move this to its own function)
        let addresses = [];
        for (const peer of this.props.peers) {
            for (const r of recipients) {
                if (peer.value === r) {
                    addresses.push(peer.key);
                }
            }
        }
        // use addresses to get public keys
        const publicKeyArray = await this.loadPublicKeys(addresses);
        const encryptedData = lightwallet.encryption.multiEncryptString(
            ks, pwDerivedKey, encode(Buffer.from(decoded)), address, publicKeyArray
        );

        const encryptedJson = JSON.stringify(encryptedData);
        const uploadResponse = await IPFSDatabase.addFile(encryptedJson);
        const hash = uploadResponse[0].hash;
        // now, for each address, construct json and add to their inbox directory
        // TODO this also needs to be in a common place!!! (note to self: write cleaner code)
        for (let addr of addresses) {
            const inboxJson = {
                filename: item.filename,
                ipfsHash: hash,
                uploadTime: new Date(),
                senderAddress: address,
                senderAlias: alias,
                type: 'share'
            };

            const dir = inboxDirectory(addr, 'inbox-data.json');
            // TODO need a better way of building absolute file paths
            let json = await IPFSService.fileAsJson(dir);
            json.push(inboxJson);
            await IPFSDatabase.writeFile(dir, Buffer.from(JSON.stringify(json)));
        }
        this.showAlertShare();
    }

    async loadPublicKeys(addresses) {
        let publicKeyArray = [];
        for (const address of addresses) {
            const aliasDataJsonLocation = aliasDirectory(address, 'data.json');
            const aliasDataJson = await IPFSService.fileAsJson(aliasDataJsonLocation);
            publicKeyArray.push(aliasDataJson.publicKey);
        }

        return publicKeyArray;
    }

    getFileHash(filename, json) {
        for (const data of json) {
            if (data.filename === filename) {
                return data.ipfsHash;
            }
        }
        return '';
    }

    async decryptAndDecode(ipfsHash, ks, pwDerivedKey, publicKey, address) {
        const data = await IPFSService.hashAsJson(ipfsHash);
        const decrypted = lightwallet.encryption.multiDecryptString(ks, pwDerivedKey, data, publicKey, address);
        return decode(decrypted);
    }

    render() {
        this.fileUploadStartedEvent = this.fileUploadStartedEvent.bind(this);
        this.toggleModal            = this.toggleModal.bind(this);
        this.share                  = this.share.bind(this);
        this.selectShareFile        = this.selectShareFile.bind(this);
        this.refreshFiles           = this.refreshFiles.bind(this);
        return (
            <div className="inbox-container">
                <If condition={this.state.showAlert === true}>
                    <Alert className="upload-alert" color="info" isOpen={this.state.showAlert}>
                        File uploaded successfully
                    </Alert>
                </If>
                <If condition={this.state.showAlertShare === true}>
                    <Alert className="upload-alert" color="info" isOpen={this.state.showAlertShare}>
                        File shared successfully
                    </Alert>
                </If>
                <UploadComponent 
                    // TODO get rid of wallet injection here
                    wallet = {this.state.wallet}
                    fileUploadEventHandler = {this.fileUploadStartedEvent}
                />
                <div className="button-container">
                    <button className="download button" onClick={this.refreshFiles}>
                        <FontAwesomeIcon icon={ faSync } />
                    </button>
                </div>
                <div className="files-container">
                    <h2>
                        Files
                    </h2>
                    <div className="inbox-list-container">
                        <If condition={!this.state.uploadInbox.length || this.state.uploadInbox.length === 0}>
                            Upload a file to get started.
                            <Else>
                                Table with uploads should be here...
                                {/* <TableContainer component={Paper}>
                                    <Table className="inbox-table" aria-label="Inbox">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell></TableCell>
                                                <TableCell>Uploaded By</TableCell>
                                                <TableCell>File name</TableCell> */}
                                                {/* <TableCell>Type</TableCell> */}
                                                {/* <TableCell>Upload Date</TableCell>
                                                <TableCell>Download</TableCell>
                                                <TableCell>Share</TableCell>
                                            </TableRow>
                                        </TableHead> */}
                                        {/* <TableBody>
                                            {this.state.uploadInbox.map((item, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>
                                                        <If condition={item.type === 'public'}>
                                                            <FontAwesomeIcon icon={ faFolderOpen } />
                                                            <ElIf condition={item.type === 'private'}>
                                                                <FontAwesomeIcon icon={ faLock } />
                                                            </ElIf>
                                                            <Else>
                                                                <FontAwesomeIcon icon={ faUserFriends } />
                                                            </Else>
                                                        </If>
                                                    </TableCell>
                                                    <TableCell> */}
                                                        {/* { item.senderAlias === null || item.senderAlias === '' ? 'You' : item.senderAlias } */}
                                                        {/* { item.senderAlias ? item.senderAlias : 'You' }
                                                    </TableCell>
                                                    <TableCell>{item.filename}</TableCell>
                                                    <TableCell>{item.type}</TableCell>
                                                    <TableCell>{item.uploadTime}</TableCell>
                                                    <TableCell>
                                                        <If condition={item.downloadPending === true}>
                                                            <Spinner color="primary" />
                                                            <Else>
                                                                <button className="download button" onClick={() => this.onDownload(item)}>
                                                                    <FontAwesomeIcon icon={faDownload} />
                                                                </button>
                                                            </Else>
                                                        </If>
                                                    </TableCell>
                                                    <TableCell>
                                                        {/* <Tooltip title="Not yet implemented"> */}
                                                            {/* <button className="download  button" onClick={() => this.selectShareFile(item)}>
                                                                <FontAwesomeIcon icon={faShareSquare} />
                                                            </button> */} */}
                                                        {/* </Tooltip> */}
                                                    {/* </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer> */}
                            </Else>
                        </If>
                    </div>
                </div>
                <Modal isOpen={this.state.showModal} toggle={this.toggleModal} className="modal-container">
                    <ModalHeader toggle={this.toggleModal}>Share file</ModalHeader>
                    <ModalBody>
                        <UserSearchComponent
                            emitSelection = {this.share}
                            peers         = {this.props.peers}
                        />
                    </ModalBody>
                </Modal>
            </div>
        );
    }
}

ReactDOM.render(<UserSearchComponent />, document.getElementById('root'));
ReactDOM.render(<UploadComponent />, document.getElementById('root'));
export default InboxComponent;
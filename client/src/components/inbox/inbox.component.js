import React from 'react';
import ReactDOM from 'react-dom';

// services
import { IPFSDatabase } from '../../db/ipfs.db';

// constants
import { uploadDirectory } from '../../constants';

// components
import UploadComponent from '../upload/upload.component';

// service deps
import { If, Else } from 'rc-if-else';
import { saveAs } from 'file-saver';

// ui elements
import { Spinner, Alert, Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

import { faDownload, faShareSquare } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { encode, decode } from '@stablelib/base64';
import lightwallet from 'eth-lightwallet';

import './inbox.component.css';
import UserSearchComponent from '../user-search/user-search.component';
import { Tooltip } from '@material-ui/core';

class InboxComponent extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            encryptedInbox: [],
            uploadInbox: [],
            downloadPending: [],
            showInbox: 'uploads',
            showModal: false,
            selectedItem: null
        };      
    }

    componentDidMount() {
        if (this.props.wallet) {
            this.readUploads();
        }
    }

    async onDownload(item) {
        const ks = this.props.wallet.ks;
        const pwDerivedKey = this.props.wallet.pwDerivedKey;
        const address = this.props.wallet.address;
        // get your own public key
        const publicKey = lightwallet.encryption.addressToPublicEncKey(ks, pwDerivedKey, address);
        // decrypt for yourself
        const fileResponse = await IPFSDatabase.getFileByHash(item.ipfsHash);
        const data = JSON.parse(new TextDecoder("utf-8").decode(fileResponse[0].content));
        const decrypted = lightwallet.encryption.multiDecryptString(ks, pwDerivedKey, data, publicKey, address);
        // decode the data
        this.download(decode(decrypted), item.filename);
    }

    download(file, filename) {
        const mime = require('mime-types');
        const type = mime.lookup(filename);
        const blob = new Blob([file], {type: type});
        saveAs(blob, filename);
    }

    updateDownloadPendingState(item, downloadPending) {
        this.setState(state => {
            const downloadPendingList = state.encryptedInbox;
            const indexOfItem = downloadPendingList.findIndex((obj => 
                obj.filename == item.filename && obj.sender === item.sender    
            ));
            downloadPendingList[indexOfItem].downloadPending = downloadPending;
            return {
                downloadPendingList,
            };
        });
    }

    async onDelete(item) {
        // TODO
        const filepath = uploadDirectory(this.props.wallet.address) + item.filename;
        // remove from array
        const inbox = [...this.state.uploadInbox];
        const index = inbox.indexOf(item);
        inbox.splice(index, 1);
        this.setState({uploadInbox: inbox});
        await IPFSDatabase.deleteFile(filepath, (err, res) => {
            if (err) {
                console.log('could not remove file ' + err);
            }
        });
    }

    createData(sender, filename) {
        return { sender, filename, downloadPending: false };
    }

    async readUploads() {
        // clear inbox contents
        this.setState({ uploadInbox: [] });
        // let items = [];
        const dir = uploadDirectory(this.props.wallet.address);
        // get current ethereum address
        const uploads = await IPFSDatabase.readFile(dir + 'upload-data.json');
        console.log(String.fromCharCode(...new Uint8Array(uploads)));
        const items = JSON.parse(String.fromCharCode(...new Uint8Array(uploads)));
        this.setState({uploadInbox: items});
    }

    fileUploadStartedEvent() {
        this.showAlert();
        this.readUploads();
    }

    showAlert() {
        this.setState({showAlert: true});
        setTimeout(function() {
            this.setState({showAlert: false});
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
        const item = this.state.selectedItem;

        const filepath = uploadDirectory(address) + item.filename;
        const file = await IPFSDatabase.readFile(filepath);
        const data = JSON.parse(String.fromCharCode(...new Uint8Array(file)));

        // get your own public key
        const publicKey = lightwallet.encryption.addressToPublicEncKey(ks, pwDerivedKey, address);
        console.log('decrypting file ' + item.filename);
        const decrypted = lightwallet.encryption.multiDecryptString(ks, pwDerivedKey, data, publicKey, address);
        const decoded = decode(decrypted);
        console.log(decoded);
        // encrypt with their public key
        // const publicKeyArray = [];
        // for (let recipient of recipients) {
        //     console.log(recipient);
        //     const publicKey = lightwallet.encryption.addressToPublicEncKey(
        //         ks, pwDerivedKey, recipient.key);
        //     publicKeyArray.push(publicKey);
        // }

        // const uploadData = typeof encode(Buffer.from(decoded));
        // const encryptedData = lightwallet.encryption.multiEncryptString(
        //     ks, pwDerivedKey, uploadData, address, publicKeyArray
        // );

        // console.log('encrypted ' + encryptedData);
        
        // console.log('recipient addresses ' + JSON.stringify(recipientAddresses));
        // add to IPFS
    }

    render() {
        this.fileUploadStartedEvent = this.fileUploadStartedEvent.bind(this);
        this.toggleModal            = this.toggleModal.bind(this);
        this.share                  = this.share.bind(this);
        this.selectShareFile        = this.selectShareFile.bind(this);
        return (
            <div className="inbox-container">
                <If condition={this.state.showAlert === true}>
                    <Alert className="upload-alert" color="info" isOpen={this.state.showAlert}>
                        File uploaded successfully
                    </Alert>
                </If>
                <UploadComponent 
                    wallet = {this.props.wallet}
                    fileUploadEventHandler = {this.fileUploadStartedEvent}
                />
                <div className="button-container">
                    <h2>
                        Files
                    </h2>
                </div>
                <div className="files-container">
                    <div className="inbox-list-container">
                        <TableContainer component={Paper}>
                            <Table className="inbox-table" aria-label="Inbox">
                                <TableHead>
                                    <TableRow>
                                        {/* <TableCell>Shared with</TableCell> */}
                                        <TableCell>File name</TableCell>
                                        <TableCell>Download</TableCell>
                                        <TableCell>Share</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {this.state.uploadInbox.map((item, index) => (
                                        <TableRow key={index}>
                                            {/* <TableCell>
                                                {item.sharedWith.length === 0 ? 'Only You' : item.sharedWith}
                                            </TableCell> */}
                                            <TableCell>{item.filename}</TableCell>
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
                                                    <button className="download  button" onClick={() => this.selectShareFile(item)}>
                                                        <FontAwesomeIcon icon={faShareSquare} />
                                                    </button>
                                                {/* </Tooltip> */}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
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
                    {/* <ModalFooter>
                        Hi footer
                    </ModalFooter> */}
                </Modal>
            </div>
        );
    }
}

ReactDOM.render(<UserSearchComponent />, document.getElementById('root'));
ReactDOM.render(<UploadComponent />, document.getElementById('root'));
export default InboxComponent;
import React from 'react';
import ReactDOM from 'react-dom';

// services
import { IPFSDatabase } from '../../db/ipfs.db';
import { EncryptionService } from '../../service/encrypt.service';
import { ContractService } from '../../service/contract.service';
import { UserService } from '../../service/user.service';

// constants
import { contractDirectory, uploadDirectory, inboxDirectory, publicKeyDirectory } from '../../constants';

// components
import UploadComponent from '../upload/upload.component';

// service deps
import { If, Else, Elif } from 'rc-if-else';
import {saveAs} from 'file-saver';

// ui elements
import { Spinner } from 'reactstrap';
import { Button, ButtonGroup } from 'reactstrap';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

import { faTrashAlt, faDownload, faInbox, faUpload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import './inbox.component.css';

class InboxComponent extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            encryptedInbox: [],
            uploadInbox: [],
            downloadPending: [],
            showInbox: 'uploads',
        };      
    }

    componentDidMount() {
        this.readUploads();
    }

    async onDownload(item) {
        // if (this.state.showInbox === 'uploads') {
        //     const filepath = uploadDirectory(this.props.user.account) + item.filename;
        //     // get the file from IPFS
        //     const file = await IPFSDatabase.readFile(filepath);
        //     this.download(file, item.filename);
        // } else {
        //     const filepath = inboxDirectory(this.props.user.account) + item.sender + '/' + item.filename;
        //     // get sender public key
        //     const senderPublicKey = await IPFSDatabase.readFile(publicKeyDirectory(item.sender) + 'public-key.txt');
        //     // decrypt user secret key
        //     const secretKey = await UserService.decryptSecretKey(this.props.user.account);
        //     // create shared key
        //     const sharedKey = box.before(senderPublicKey, new Uint8Array(secretKey.data));
        //     // decrypt file
        //     const decrypted = await EncryptionService.decrypt(sharedKey, await IPFSDatabase.readFile(filepath));
        //     // download file
        //     this.download(new Uint8Array(decrypted.data), item.filename);
        // }
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
        let filepath = uploadDirectory(this.props.user.account) + item.filename;
        if (this.state.showInbox === 'encrypted') {
            filepath = inboxDirectory(this.props.user.account) + item.sender + '/' + item.filename;
            // remove from array
            const inbox = [...this.state.encryptedInbox];
            const index = inbox.indexOf(item);
            inbox.splice(index, 1);
            this.setState({encryptedInbox: inbox});
        } else {
            // remove from array
            const inbox = [...this.state.uploadInbox];
            const index = inbox.indexOf(item);
            inbox.splice(index, 1);
            this.setState({uploadInbox: inbox});
        }
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
        let items = [];
        const dir = uploadDirectory(this.props.address);
        console.log(dir);
        // get current ethereum address
        const parentResponse = await IPFSDatabase.readDirectory(dir);
        console.log(JSON.stringify(parentResponse));
        debugger;
        for (const senderRes of parentResponse) {
            items.push(this.createData('upload', senderRes.name));
        }
        console.log('items ' + JSON.stringify(items));
        this.setState({uploadInbox: items});
    }

    async readInbox() {
        // clear inbox contents
        this.setState({ encryptedInbox: [] });
        let items = [];
        const dir = inboxDirectory(this.props.address);
        console.log(dir);
        // get current ethereum address
        const parentResponse = await IPFSDatabase.readDirectory(dir);
        for (const senderRes of parentResponse) {
            const subdir = dir + senderRes.name;
            const senderResponse = await IPFSDatabase.readDirectory(subdir);
            for (const childRes of senderResponse) {
                items.push(this.createData(senderRes.name, childRes.name));
            }
        }
        this.setState({encryptedInbox: items});
    }

    async onToggleFileView(e) {
        const fileView = this.state.showInbox;
        if (fileView === 'uploads' && e.target.id === 'inbox') {
            this.setState({showInbox: 'encrypted'});
            await this.readInbox(this.props.ethereumAddress);
        } else if (fileView === 'encrypted' && e.target.id === 'uploads') {
            this.setState({showInbox: 'uploads'});
            await this.readUploads(this.props.ethereumAddress);
        }
    }

    showAlert() {
        this.setState({showAlert: true});
        setTimeout(function() {
            this.setState({showAlert: false});
        }.bind(this), 5000); 
    }

    render() {
        return (
            <div className="inbox-container">
                {/* <Alert className="upload-alert" color="info" isOpen={this.state.showAlert}>
                    File uploaded successfully
                </Alert> */}
                <UploadComponent 
                    account = {this.props.account}
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
                                        <TableCell>Sender</TableCell>
                                        <TableCell>File name</TableCell>
                                        <TableCell>Download</TableCell>
                                        <TableCell>Delete</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {this.state.uploadInbox.map(item => (
                                        <TableRow key={item.sender}>
                                            <TableCell>{item.sender}</TableCell>
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
                                                <button className="delete button" onClick={() => this.onDelete(item)}>
                                                    <FontAwesomeIcon icon={faTrashAlt} />
                                                </button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </div>
                </div>
        </div>
        );
    }
}

ReactDOM.render(<UploadComponent />, document.getElementById('root'));
export default InboxComponent;
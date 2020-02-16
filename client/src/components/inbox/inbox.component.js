import React from 'react';
import { IPFSDatabase } from '../../db/ipfs.db';
import { EncryptionUtils } from '../../encryption/encrypt.service';
import { ContractService } from '../../service/contract.service';

import { contractDirectory, uploadDirectory, inboxDirectory } from '../../constants';

import { If, Else, Elif } from 'rc-if-else';

import {saveAs} from 'file-saver';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

import { faTrashAlt, faDownload, faInbox, faUpload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { Spinner } from 'reactstrap';

import { Button, ButtonGroup } from 'reactstrap';

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
        if (props.user) {
            this.readUploads();
            this.readInbox();
        }
    }

    async onDownload(item) {
        if (this.state.showInbox === 'uploads') {
            const filepath = uploadDirectory(this.props.user.account) + item.filename;
            // get the file from IPFS
            const file = await IPFSDatabase.readFile(filepath);
            this.download(file, item.filename);
        } else {
            this.updateDownloadPendingState(item, true);
            const filepath = inboxDirectory(this.props.user.account) + item.sender + '/' + item.filename;
            const file = await IPFSDatabase.readFile(filepath);

            const contractAddress = this.props.user.contract;
            const senderContractFileLoc = contractDirectory(item.sender) + 'contract.txt';
            const senderContractAddress = await IPFSDatabase.readFile(senderContractFileLoc);

            // create shared key
            const sharedKey = await ContractService.createSharedKey(
                this.props.web3, this.props.user.account, 
                item.sender.toString(), contractAddress, 
                senderContractAddress.toString()
            );

            const decryptedMessage = await EncryptionUtils.decrypt(
                sharedKey, file
            );

            this.updateDownloadPendingState(item, false);
            this.download(new Uint8Array(decryptedMessage.data), item.filename);
        }
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
        const dir = uploadDirectory(this.props.user.account);
        // get current ethereum address
        const parentResponse = await IPFSDatabase.readDirectory(dir);
        for (const senderRes of parentResponse) {
            items.push(this.createData('upload', senderRes.name));
        }
        this.setState({uploadInbox: items});
    }

    async readInbox() {
        const account = this.props.user.account;
        // clear inbox contents
        this.setState({ encryptedInbox: [] });
        let items = [];
        const dir = inboxDirectory(this.props.user.account);
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

        // if (!items.length === 0) {
        //     this.forceUpdate();
        // }
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

    render() {
        if (!this.props.user) {
            return (
                <div>
                    <p>Loading......</p>
                </div>
            );
        } else {
            return (
                <div>
                    <div className="button-container">
                        <ButtonGroup>
                            <Button className="select-view-button" id='uploads' onClick={this.onToggleFileView.bind(this)}>
                                <FontAwesomeIcon icon={faUpload} />
                                Uploads ({this.state.uploadInbox.length})
                            </Button>
                            <Button className="select-view-button" id='inbox' onClick={this.onToggleFileView.bind(this)}>
                                <FontAwesomeIcon icon={faInbox} />
                                Inbox ({this.state.encryptedInbox.length})
                            </Button>
                        </ButtonGroup>
                    </div>
                    <If condition={this.state.showInbox === 'encrypted'}>
                        <div className="inbox-container">
                            <div className="inbox-list-container">
                                <If condition={this.state.encryptedInbox.length === 0}>
                                    Inbox is empty
                                    <Else>
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
                                                    {this.state.encryptedInbox.map(item => (
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
                                    </Else>
                                </If>
                            </div>
                        </div>
                    </If>
                    <If condition={this.state.showInbox === 'uploads'}>
                        <div className="inbox-container">
                        <div className="inbox-list-container">
                            <If condition={this.state.uploadInbox.length === 0}>
                                You have not uploaded any files.
                                <Else>
                                    <TableContainer component={Paper}>
                                        <Table className="inbox-table" aria-label="Inbox">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>File name</TableCell>
                                                    <TableCell>Download</TableCell>
                                                    <TableCell>Delete</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {this.state.uploadInbox.map(item => (
                                                    <TableRow key={item.sender}>
                                                        <TableCell>{item.filename}</TableCell>
                                                        <TableCell>
                                                            <button className="download button" onClick={() => this.onDownload(item)}>
                                                                <FontAwesomeIcon icon={faDownload} />
                                                            </button>
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
                                </Else>
                            </If>
                        </div>
                    </div>
                    </If>
            </div>
            );
        }
    }
}

export default InboxComponent;
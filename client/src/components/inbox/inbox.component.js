import React from 'react';
import {IPFSDatabase} from '../../db/ipfs.db';
import {EncryptionUtils} from '../../encryption/encrypt.service';
import { ContractService } from '../../service/contract.service';

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
            this.readUploads(props.user.account);
        }
    }

    async onDownload(item) {
        let filepath = '/content/' + this.props.user.account;

        if (this.state.showInbox === 'uploads') {
            filepath += '/uploads/' + item.filename;
            // get the file from IPFS
            const file = await IPFSDatabase.readFile(filepath);
            this.download(file, item.filename);
        } else {
            this.updateDownloadPendingState(item, true);
            const filepath = '/content/' + this.props.user.account + '/inbox/' + item.sender + '/' + item.filename;
            const file = await IPFSDatabase.readFile(filepath);

            const contractAddress = this.props.user.contract;
            const senderContractFileLoc = '/content/' + item.sender + '/contract/contract.txt';
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
        let filepath = '/content/' + this.props.user.account + '/uploads/' + item.filename;
        if (this.state.showInbox === 'encrypted') {
            filepath = '/content/' + this.props.ethereumAddress + '/inbox/' + item.sender + '/' + item.filename;
        }
        console.log(filepath);
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
        const dir = '/content/' + this.props.user.account + '/uploads/';
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
        const dir = '/content/' + account + '/inbox';
        // get current ethereum address
        const parentResponse = await IPFSDatabase.readDirectory(dir);
        for (const senderRes of parentResponse) {
            const subdir = '/content/' + account + '/inbox/' + senderRes.name;
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
                    Loading......
                </div>
            );
        } else {
            return (
                <div>
                    <div className="button-container">
                        <ButtonGroup>
                            <Button id='uploads' onClick={this.onToggleFileView.bind(this)}>
                                <FontAwesomeIcon icon={faUpload} />
                                Uploads
                            </Button>
                            <Button id='inbox' onClick={this.onToggleFileView.bind(this)}>
                                <FontAwesomeIcon icon={faInbox} />
                                Inbox
                            </Button>
                        </ButtonGroup>
                    </div>
                    <If condition={this.state.showInbox === 'encrypted'}>
                        <div className="inbox-container">
                            <p>Inbox</p>
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
                        <p>Uploads</p>
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
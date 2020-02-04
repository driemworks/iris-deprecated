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

import {
    decodeUTF8,
    encodeUTF8,
    decodeBase64,
    encodeBase64
  } from 'tweetnacl-util';

import './inbox.component.css';

class InboxComponent extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            encryptedInbox: [],
            uploadInbox: [],
            showInbox: 'uploads'
        };
    }

    async componentDidMount() {
        // await this.readInbox(this.props.ethereumAddress);
        await this.readUploads(this.props.ethereumAddress);
        // console.log('called component did mount');
        // this.forceUpdate();
    }

    async componentWillReceiveProps(newProps) {
        // check if ethereumAddress has changed
        if (newProps.ethereumAddress !== this.props.ethereumAddress) {
            // await this.readInbox(newProps.ethereumAddress); 
            // await this.readUploads(newProps.ethereumAddress);
        };
    }

    async onDownload(item) {
        let filepath = '/content/' + this.props.ethereumAddress;

        if (this.state.showInbox === 'uploads') {
            filepath += '/uploads/' + item.filename;
            // get the file from IPFS
            const file = await IPFSDatabase.readFile(filepath);
            this.download(file, item.filename);
        } else {
            const filepath = '/content/' + this.props.ethereumAddress + '/inbox/' + item.sender + '/' + item.filename;
            const file = await IPFSDatabase.readFile(filepath);

            const contractAddress = this.props.contractAddress;
            const senderContractFileLoc = '/content/' + item.sender + '/contract/contract.txt';
            const senderContractAddress = await IPFSDatabase.readFile(senderContractFileLoc);

            // create shared key
            const sharedKey = await ContractService.createSharedKey(
                this.props.web3, this.props.ethereumAddress, 
                item.sender.toString(), contractAddress, 
                senderContractAddress.toString()
            );

            const decryptedMessage = await EncryptionUtils.decrypt(
                sharedKey, file
            );

            this.download(new Uint8Array(decryptedMessage.data), item.filename);
        }
    }

    download(file, filename) {
        const mime = require('mime-types');
        const type = mime.lookup(filename);
        const blob = new Blob([file], {type: type});
        saveAs(blob, filename);
    }

    async onDelete(item) {
        const filepath = '/content/' + this.props.ethereumAddress + '/inbox/' + item.sender + '/' + item.filename;
        await IPFSDatabase.deleteFile(filepath, (err, res) => {
            if (err) {
                console.log('could not remove file ' + err);
            } else {
                this.forceUpdate();
                // this.readInbox();
            }
        });
    }

    createData(sender, filename) {
        return { sender, filename };
    }

    async readUploads(ethereumAddress) {
        // clear inbox contents
        this.setState({ uploadInbox: [] });
        let items = [];
        const dir = '/content/' + ethereumAddress + '/uploads/';
        // get current ethereum address
        const parentResponse = await IPFSDatabase.readDirectory(dir);
        for (const senderRes of parentResponse) {
            items.push(this.createData('upload', senderRes.name));
        }
        this.setState({uploadInbox: items});
        this.forceUpdate();
    }

    async readInbox(ethereumAddress) {
        console.log('reading inbox for account ' + ethereumAddress);
        // clear inbox contents
        this.setState({ encryptedInbox: [] });
        let items = [];
        const dir = '/content/' + ethereumAddress + '/inbox';
        // get current ethereum address
        const parentResponse = await IPFSDatabase.readDirectory(dir);
        for (const senderRes of parentResponse) {
            const subdir = '/content/' + ethereumAddress + '/inbox/' + senderRes.name;
            const senderResponse = await IPFSDatabase.readDirectory(subdir);
            for (const childRes of senderResponse) {
                items.push(this.createData(senderRes.name, childRes.name));
            }
        }
        this.setState({encryptedInbox: items});

        if (!items.length === 0) {
            this.forceUpdate();
        }
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
        return (
            <div>
                <div className="button-container">
                    <button id='uploads' onClick={this.onToggleFileView.bind(this)}>
                        <FontAwesomeIcon icon={faUpload} />
                        Uploads
                    </button>
                    <button id='inbox' onClick={this.onToggleFileView.bind(this)}>
                        <FontAwesomeIcon icon={faInbox} />
                        Inbox
                    </button>
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

export default InboxComponent;
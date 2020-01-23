import React from 'react';
import {IPFSDatabase} from '../../db/ipfs.db';
import {EncryptionUtils} from '../../encryption/encrypt.service';

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
        await this.readInbox(this.props.ethereumAddress);
        await this.readUploads(this.props.ethereumAddress);
        // console.log('called component did mount');
        // this.forceUpdate();
        // await this.readInbox();
        // console.log('*********** reloaded inbox: ' + JSON.stringify(this.state.inbox));
    }

    async componentWillReceiveProps(newProps) {
        // check if ethereumAddress has changed
        console.log('new props addr: ' + newProps.ethereumAddress);
        console.log('old props addr ' + this.props.ethereumAddress);
        if (newProps.ethereumAddress !== this.props.ethereumAddress) {
            await this.readInbox(newProps.ethereumAddress); 
            await this.readUploads(newProps.ethereumAddress);
        }
        // console.log('called componentWillREceiveProps');
        // this.forceUpdate();
        // await this.readInbox();
        // console.log('reloaded inbox: ' + JSON.stringify(this.state.inbox));
    }

    async onDownload(item) {
        // event.preventDefault();
        //get file
        // filename will be the selected li element key
        const filepath = '/content/' + this.props.ethereumAddress + '/inbox/' + item.sender + '/' + item.filename;
        console.log('downloading file ' + filepath);
        IPFSDatabase.readFile(filepath, async (err, fileResponse) => {
            if (err) {
                console.log('could not retrieve the file! ' + err);
            } else {
                console.log('found the file.');
                // now decrypt file!
                // create shared key for decryption using the secret key from this.props.ethereumAddress 
                // and the public key from item.sender
                // get contract address for you
                await IPFSDatabase.getContractAddress(this.props.ethereumAddress,
                    async (err, recipientContractResponse) => {
                        if (err) {
                            console.log('could not find your contract!');
                        } else {
                            // get contract address for sender
                            await IPFSDatabase.getContractAddress(item.sender.toString(), async (e, senderContractResponse) => {
                                if (e) {
                                    console.log('could not find sender contract!');
                                } else {
                                    // create shared key
                                    const sharedKey = await EncryptionUtils.createSharedKey(
                                        this.props.web3, this.props.ethereumAddress, 
                                        item.sender.toString(), 
                                        recipientContractResponse.toString(),
                                        senderContractResponse.toString()
                                    );
                                    const decryptedMessage = await EncryptionUtils.decrypt(
                                        sharedKey, fileResponse
                                    );
                                    // get the mime type based on the file extension
                                    const mime = require('mime-types');
                                    const type = mime.lookup(item.name);
                                    // decrypted message is a byte array, so convert it to base64
                                    // let base64Value = new TextDecoder("utf-8").decode(new Uint8Array(decryptedMessage.data));
                                    let base64Value = String.fromCharCode(...new Uint8Array(decryptedMessage.data));
                                    if (type === 'text/plain') {
                                        const blob = new Blob([base64Value], {type: type});
                                        saveAs(blob, item.name);
                                    } else {
                                        saveAs('data:' + type + ';base64,' + btoa(base64Value), item.name);
                                    }
                                }
                            }) ;
                        }
                    });
            }
        });
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
        this.forceUpdate();
    }

    onToggleFileView(e) {
        const fileView = this.state.showInbox;
        if (fileView === 'uploads' && e.target.id === 'inbox') {
            this.setState({showInbox: 'encrypted'});
        } else if (fileView === 'encrypted' && e.target.id === 'uploads') {
            this.setState({showInbox: 'uploads'});
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
                                                            Uploads                   <button className="delete button" onClick={() => this.onDelete(item)}>
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
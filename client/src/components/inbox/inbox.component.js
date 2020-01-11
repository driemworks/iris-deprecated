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

import { faTrashAlt, faDownload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import './inbox.component.css';

class InboxComponent extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            inbox: []
        };
    }

    componentDidMount() {
        this.readInbox();
    }

    componentWillReceiveProps(props) {
        const { refresh } = this.props;
        if (props.refresh === true) {
            this.readInbox();
        }
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

    }

    createData(sender, filename) {
        return { sender, filename };
    }

    async readInbox() {
        // clear inbox contents
        this.setState({ inbox: [] });
        const dir = '/content/' + this.props.ethereumAddress + '/inbox';
        // get current ethereum address
        await IPFSDatabase.readDirectory(dir, async (err, parentDirRes) => {
            if (err) {
                console.log('failed to read directory contents');
            } else {
                parentDirRes.forEach(async senderRes => {
                    // get subdirectory name based on sender
                    const subdir = dir + '/' + senderRes.name;
                    await IPFSDatabase.readDirectory(subdir, async (e, childRes) => {
                        childRes.forEach(file => {
                            this.setState({ inbox: [...this.state.inbox, this.createData(senderRes.name, file.name)] });
                        });
                    });
                });
            }
        });
    }

    render() {
        return (
            <div className="inbox-container">
                <p>Inbox</p>
                <button onClick={this.readInbox.bind(this)}>Refresh</button>
                <div className="inbox-list-container">
                    <If condition={this.state.inbox.length === 0}>
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
                                        {this.state.inbox.map(item => (
                                            <TableRow key={item.sender}>
                                                <TableCell>{item.sender}</TableCell>
                                                <TableCell>{item.filename}</TableCell>
                                                <TableCell>
                                                    <button className="download button" onClick={() => this.onDownload(item)}>
                                                        <FontAwesomeIcon icon={faDownload} />
                                                    </button>
                                                </TableCell>
                                                <TableCell>
                                                    <button className="delete button">
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
        );
    }
}

export default InboxComponent;
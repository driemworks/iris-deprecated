import React from 'react';
import {IPFSDatabase} from '../../db/ipfs.db';
import {EncryptionUtils} from '../../encryption/encrypt.service';

import {saveAs} from 'file-saver';

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

    async onDownload(item) {
        // event.preventDefault();
        //get file
        // filename will be the selected li element key
        const filepath = '/content/' + this.props.ethereumAddress + '/inbox/' + item.sender + '/' + item.name;
        console.log('downloading file ' + filepath);
        IPFSDatabase.readFile(filepath, async (err, fileResponse) => {
            if (err) {
                console.log('could not retrieve the file! ' + err);
            } else {
                console.log('found the file. ' + fileResponse);
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
                                    let decodedValueUTF8 = new TextDecoder("utf-8").decode(new Uint8Array(decryptedMessage.data));
                                    console.log('decoded value ' + decodedValueUTF8);
                                    // for images, we have the base64 string
                                    const mime = require('mime-types');
                                    const type = mime.lookup(item.name);
                                    // const blob = new Blob([decodedValueUTF8], {type: type});
                                    const blob = new Blob([decodedValueUTF8], {type: type});
                                    let downloader = require('downloadjs');
                                    downloader(blob, item.name. type);
                                    // saveAs(blob, item.name);
                                    // const url = window.URL.createObjectURL(blob);
                                    // const link = document.createElement('a');
                                    // let href = url;
                                    // link.href = href;
                                    // // if it is an image, then further processing needed
                                    // if (type.includes('image')) {
                                    //     href = 'data:' + type + ';base64,' + btoa(unescape(encodeURIComponent(decodedValueUTF8))); 
                                    //     console.log('href for images ' + href);
                                        
                                    // }
                                    // link.setAttribute('download', item.name);
                                    // document.body.appendChild(link);
                                    // link.click();
                                    // document.body.removeChild(link);
                                }
                            }) ;
                        }
                    });
            }
        });
    }

    async updateInbox() {
        await this.readInbox();
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
                            let fileObject = { sender: senderRes.name, name: file.name };
                            this.setState({ inbox: [...this.state.inbox, fileObject] });
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
                <button onClick={this.updateInbox.bind(this)}>Refresh</button>
                <div>
                    <ul>
                        {this.state.inbox.map(item => 
                            <li key={item.sender}>
                                <div>
                                    <p>
                                        {item.sender} | {item.name}
                                    </p>
                                    <button onClick={() => this.onDownload(item)}>
                                        Download
                                    </button>
                                </div>
                            </li>)}
                    </ul>
                </div>
            </div>
        );
    }
}

export default InboxComponent;
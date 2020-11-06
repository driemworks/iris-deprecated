import React from 'react';
import ReactDOM from 'react-dom';
// components
import UploadComponent from '../upload/upload.component';

// service deps
import { If, Else } from 'rc-if-else';
import { saveAs } from 'file-saver';

// ui elements
import { Alert } from 'reactstrap';
import { MDBDataTable } from 'mdbreact';

import lightwallet from 'eth-lightwallet';

import './inbox.component.css';
import store from '../../state/store/index';
import { MercuryApiService } from '../../service/mercury.service';
import { setEventData } from '../../state/actions';

class InboxComponent extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            uploadInbox: [],
            showModal: false,
            selectedItem: null,
            showAlertShare: false,
            showAlert: false,
            jwt: null,
            events: null
        };      
    }

    async componentDidMount() {
        store.subscribe(async () => {
            // if (this.state.events === null && this.state.jwt !== null) {
            //     const res = await MercuryApiService.retrieveEvents(store.getState().jwt, 
            //         store.getState().wallet.address, 10);
            //         if (res) {
            //             store.dispatch(setEventData(res.data));
            //         }
            // }
            this.setState({
                wallet: store.getState().wallet, 
                jwt: store.getState().jwt,
                events: store.getState().events
            });
        });
    }

    // componentWillUnmount() { 

    async onDownload(e, item) {
        e.preventDefault();
        // const ks = this.state.wallet.ks;
        // const pwDerivedKey = this.state.wallet.pwDerivedKey;
        // const address = this.state.wallet.address;
        // // get your own public key
        // let theirPublicKey = null;
        // // upload-type based check
        // if (item.type === 'public') {
        //     // if it's a public upload
        //     this.download(Buffer.from(item.data.data), item.filename);
        // } else if (item.type === 'share') {
        //     // if the file has been shared with you
        //     // if item sender exists, get their public key
        //     // const aliasDataJsonLocation = aliasDirectory(item.senderAddress, 'data.json');
        //     // const aliasDataJson = await IPFSService.fileAsJson(aliasDataJsonLocation);
        //     const userFileResponse = await ApiService.read('iris.resources', 'user-data.json');
        //     const userData = userFileResponse.data[0].doc.filter((entry) => {
        //         return entry.address === item.senderAddress;
        //       })[0];
        //     // const username = userData.username;
        //     theirPublicKey = userData.publicKey;
        //     const decrypted = lightwallet.encryption.multiDecryptString(
        //         ks, pwDerivedKey, item.data, theirPublicKey, address
        //     );
        //     // const decrypted = await this.decryptFromHash(item, ks, pwDerivedKey, theirPublicKey, address);
        //     this.download(decode(decrypted), item.filename);
        // } else {
        //     // if it's your own private upload
        //     // get your own public key (your own private upload)
        //     theirPublicKey = lightwallet.encryption.addressToPublicEncKey(ks, pwDerivedKey, address);
        //     const decrypted = lightwallet.encryption.multiDecryptString(
        //         ks, pwDerivedKey, JSON.parse(item.data), theirPublicKey, address
        //     );
        //     // const decrypted = await this.decryptFromHash(item, ks, pwDerivedKey, theirPublicKey, address);
        //     this.download(decode(decrypted), item.filename);
        // }
    }

    async decryptFromHash(item, ks, pwDerivedKey, theirPublicKey, address) {
        // get data based on hash
        // const data = await IPFSService.hashAsJson(item.ipfsHash);
        const data = item.data;
        console.log(data);
        debugger;
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
        // if (this.state.wallet) {
        //     const uploads = await ApiService.read(this.state.wallet.address, 'upload-data.json');
        //     if (!uploads.data[0]) {
        //         this.setState({ uploadInbox: [] });
        //     } else {
        //         this.setState({ uploadInbox: uploads.data[0].doc });
        //     }
        //     this.setState({ uploadData: this.formatUploadData(this.state.uploadInbox) });
        // }
    }

    fileUploadStartedEvent() {
        // console.log('heyheyheyhey');
        // this.showAlert();
        // this.refreshFiles();
        
        // console.log(res);
        // this.setState({ events: res });
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

    getFileHash(filename, json) {
        for (const data of json) {
            if (data.filename === filename) {
                return data.ipfsHash;
            }
        }
        return '';
    }

    async decryptAndDecode(ipfsHash, ks, pwDerivedKey, publicKey, address) {
        // const data = await IPFSService.hashAsJson(ipfsHash);
        // const decrypted = lightwallet.encryption.multiDecryptString(ks, pwDerivedKey, data, publicKey, address);
        // return decode(decrypted);
    }

    formatUploadData(uploadData) {
        return {
            columns: [
                {
                    label: 'Filename',
                    field: 'filename',
                    sort: 'asc',
                    width: 270
                },
                {
                    label: 'Type',
                    field: 'type',
                    sort: 'asc',
                    width: 270
                },
                {
                    label: 'Upload Date',
                    field: 'uploadTime',
                    sort: 'asc',
                    width: 270
                },
                {
                    label: 'Download',
                    field: 'download',
                    sort: 'asc',
                    width: 270
                }
            ],
            rows: this.createRows(uploadData)
        }
    }

    createRows(uploadData) {
        let dataArray = [];
        if (uploadData) {
            for (const u of uploadData) {
                dataArray.push({ 
                    filename: u.filename,
                    type: u.type,
                    uploadTime: u.uploadTime,
                    download: <div>
                                <button onClick={(e) => this.onDownload(e, u)}>
                                    Download
                                </button>
                            </div>
                });
            }
        }
        return dataArray;
    }

    getUploadsView() {
        if (!this.state.uploadData) {
            return (
                <span>
                    Loading...
                </span>
            );
        } else if (this.state.uploadData.length === 0) {
            return (
                <span>
                    Upload a file to get started. 
                </span>
            );
        } else {
            return (
                <MDBDataTable
                    striped hover data={this.state.uploadData}
                />
            );
        }
    }

    // async renderEvents() {
    //     const res = await MercuryApiService.retrieveEvents(this.state.jwt, this.state.wallet.address, 10);
    //     console.log(res);
    //     return (
    //         <div>
    //             { res.map(e => res.toString())}
    //         </div>
    //     );
    // }

    render() {
        let eventLogs;
        if (this.state.events !== null) {
            this.state.events.forEach(element => {
                console.log(element);
            });
            eventLogs = 
                <table>
                    { this.state.events.map(e => 
                        <tr>
                            <td>
                                { e.filename }
                            </td>
                            <td>
                                { e.uploadTime }
                            </td>
                            <td>
                                <button>Download</button>
                            </td>
                        </tr>
                    )}
                </table>
            // console.log(eventLogs);
        }
        return (
            <div className="inbox-container">
                {/* <If condition={this.state.showAlert === true}>
                    <Alert className="upload-alert" color="info" isOpen={this.state.showAlert}>
                        File uploaded successfully
                    </Alert>
                </If>
                <If condition={this.state.showAlertShare === true}>
                    <Alert className="upload-alert" color="info" isOpen={this.state.showAlertShare}>
                        File shared successfully
                    </Alert>
                </If> */}
                <div className="files-container">
                    {/* <div>
                        <span>
                            Files
                        </span>
                    </div> */}
                    <div className="inbox-list-container">
                        <UploadComponent 
                            wallet = {this.state.wallet}
                            fileUploadEventHandler = {this.fileUploadStartedEvent}
                        />
                        { eventLogs }
                        {/* <table>
                            <tr>
                                <th>Filename</th>
                                <th>Upload Time</th>
                                <th>Download</th>
                            </tr>
                            { eventLogs }
                        </table> */}
                        {/* { this.state.events.map(e => 
                            <p key={ e.toString() }>
                                { e.toString() }
                            </p>) } */}
                        {/* <If condition={!this.state.uploadInbox || this.state.uploadInbox.length === 0}>
                            Upload a file to get started.
                            <Else>
                            <div className="public-uploads-container">
                                {this.getUploadsView()}
                            </div>
                            </Else>
                        </If> */}
                    </div>
                </div>
            </div>
        );
    }
}

ReactDOM.render(<UploadComponent />, document.getElementById('root'));
export default InboxComponent;  
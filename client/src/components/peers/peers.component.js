import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import './peers.component.css';
import UserSearchComponent from '../user-search/user-search.component';
import { IPFSDatabase } from '../../db/ipfs.db';
import lightwallet from 'eth-lightwallet';

class PeersComponent extends Component {

    constructor(props) {
        super(props);
        this.addPeers = this.addPeers.bind(this);
    }

    async addPeers(peers) {
        console.log('peer ' + JSON.stringify(peers));
        // get your public key
        const ks = this.props.wallet.ks;
        const pwDerivedKey = this.props.wallet.pwDerivedKey;
        const address = this.props.wallet.address;
        const alias = this.props.wallet.alias;
        const publicKey = lightwallet.encryption.addressToPublicEncKey(ks, pwDerivedKey, address);
        // for (let peer of peers) {
        //     // add file to the peer's usr/connections directory
        //     // <address>.json
        //     const peerPendingItem = {
        //         alias: alias,
        //         address: address,
        //         pubKey: publicKey,
        //         status: 'PENDING'
        //     }
        //     const theirDir = '';
        //     const theirFilename = this.props.wallet.alias + '.txt';
        //     await IPFSDatabase.addFile(theirDir, Buffer.from(JSON.stringify(peerPendingItem)), theirFilename);
            
        //     // add file to YOUR /usr/connections directory
        //     const peerRequestItem = {
        //         alias: peer.value,
        //         address: peer.key,
        //         pubKey: '',
        //         status: 'REQUESTED'
        //     }
        //     const yourDir = '';
        // }
    }

    render() {
        return (
            <div className="peers-container">
                <UserSearchComponent 
                    peers = {this.props.peers}
                    emitSelection = {this.addPeers}
                />
            </div>
        );
    }

}

ReactDOM.render(<UserSearchComponent />, document.getElementById('root'));
export default PeersComponent;
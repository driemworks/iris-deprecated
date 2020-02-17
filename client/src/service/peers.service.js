import { IPFSDatabase } from '../db/ipfs.db';

export const PeerService = {
    async loadPeers() {
        // this will probably not scale well...
        const parentDir = '/iris-content-directory/';
        // look for files under
    },
}

export default PeerService;
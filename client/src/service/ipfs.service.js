import { IPFSDatabase } from '../db/ipfs.db';

export const IPFSService = {

    async fileAsJson(absoluteFilePath) {
        const content = await IPFSDatabase.readFile(absoluteFilePath);
        // replace with:
        // return JSON.parse(new TextDecoder("utf-8").decode(content[0].content)); ?
        return JSON.parse(String.fromCharCode(...new Uint8Array(content)));
    },

    async hashAsJson(ipfsHash) {
        const fileResponse = await IPFSDatabase.getFileByHash(ipfsHash);
        return JSON.parse(new TextDecoder("utf-8").decode(fileResponse[0].content));
    }

}
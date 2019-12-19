import ipfs from '../ipfs';
import { readFile } from 'fs';

export const IPFSDatabase = {
    async createDirectory(directoryPath) {
        return await ipfs.files.mkdir(directoryPath, (err, res) => {
            if (err) {
                console.log('Failed to create directory ' + directoryPath, err);
            } else {
                console.log('Created directory ' + directoryPath, res);
            }
        });
    },
    async readDirectory(directoryPath) {
        return await ipfs.files.ls(directoryPath);
    },
    async deleteDirectory(directoryPath) {
        return await ipfs.files.rm(directoryPath, {recursive: true}, (err, res) => {
            if (err) {
                console.log('Failed to delete directory', err);
            } else {
                console.log('Deleted directory ' + directoryPath + 'successfully.');
            }
        });
    },
    async addFile(directory, file, filename) {
        return await ipfs.files.write(directory + filename, file, {create: true});
    },
    async getContractAddress(ethereumAccount, callback) {
        const filename = '/content/' + ethereumAccount + '/contract/contract.txt';
        console.log('looking for contract file ' + filename);
        return await ipfs.files.read(filename, (err, res) => {
            callback(err, res);
        });
    },
    async readFilesInDirectory(directory) {
        return await ipfs.files.lsPullStream(directory);
    },
    async deleteFile(file, filename) {
        console.log('NOT IMPLEMENTED');
    }
}
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
    async readDirectory(directoryPath, callback) {
        // flush to clear the file system
        // await ipfs.files.flush(directoryPath);
        if (callback) {
            return await ipfs.files.ls(directoryPath, (err, res) => {
                callback(err, res);
            });
        } else {
            return await ipfs.files.ls(directoryPath);
        }
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
    async addFile(directory, file, filename, callback) {
        return await ipfs.files.write(
            directory + filename, file, {create: true}, 
            (err, res) => {
                callback(err, res);
            }
        );
    },
    async getContractAddress(ethereumAccount, callback) {
        const filename = '/content/' + ethereumAccount + '/contract/contract.txt';
        return await ipfs.files.read(filename, (err, res) => {
            callback(err, res);
        });
    },
    async addToInbox(inboxEtherAccount, senderEthereAccount, filename, file) {
        const dir = '/content/' + inboxEtherAccount + '/inbox/' + senderEthereAccount + '/' + filename;
        
    },
    async readFile(filepath, callback) {
        return await ipfs.files.read(filepath, (err, res) => callback(err, res));
    },
    async readFile(filepath) {
        return await ipfs.files.read(filepath);
    },
    async deleteFile(filepath, callback) {
        return await ipfs.files.rm(filepath, (err, res) => callback(err, res));
    }
}
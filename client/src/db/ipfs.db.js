import ipfs from '../ipfs';
import { readFile } from 'fs';

export const IPFSDatabase = {
    async createDirectory(directoryPath) {
        return await ipfs.files.mkdir(directoryPath, {parents: true}, (err, res) => {
            if (err) {
                console.log('Failed to create directory ' + directoryPath, err);
            } else {
                console.log('Created directory ' + directoryPath, res);
            }
        });
    },
    async readDirectory(directoryPath, callback) {
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
    async updateFileWithData(filepath, data) {
        // read file
        // append data
        // delete file
        // add new file
        // const fileToUpdate = await ipfs.files.read(filepath);
        // const newLine = data + '\n';
        // fileToUpdate

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
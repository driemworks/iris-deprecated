import ipfs from '../ipfs';

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
    async addFile(directory, file, filename) {
        return await ipfs.files.write(directory + filename, file, {create: true});
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
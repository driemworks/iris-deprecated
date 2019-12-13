import ipfs from '../ipfs';

export const IPFSDatabase = {
    async createDirectory(directoryPath) {
        return await ipfs.files.mkdir(directoryPath, (err, res) => {
            if (err) {
                console.log('Failed to create directory', err);
            } else {
                console.log('Created directory ' + directoryPath);
            }
        });
    },
    async readDirectory(directoryPath) {
        // const dirResponse = await ipfs.files.stat(directoryPath);
        // const dirHash = dirResponse.hash;
        return await ipfs.files.ls(directoryPath);
    },
    async deleteDirectory(directoryPath) {
        return await ipfs.files.rm(directoryPath, {recursive: true}, (err, res) => {
            if (err) {
                console.log('Failed to delete directory', err);
            } else {
                console.log('Deleted directory successfully.');
            }
        });
    },
    async addFile(directory, file, filename) {
        return await ipfs.add(
            {
              path: directory + filename,
              content: file
            });
    },
    async readFilesInDirectory(directory) {
        return await ipfs.files.lsPullStream(directory);
    },
    async deleteFile(file, filename) {
        console.log('NOT IMPLEMENTED');
    }
}
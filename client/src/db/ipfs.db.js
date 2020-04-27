import ipfs from '../ipfs';

/**
 * Functions for accessing the ipfs api
 */
export const IPFSDatabase = {

    /* 
        CREATE
    */
   /**
    * Create a directory using the given directory path
    * @param {string} directoryPath 
    */
    async createDirectory(directoryPath) {
        return await ipfs.files.mkdir(directoryPath, {parents: true}, (err, res) => {
            if (err) {
                console.log('Failed to create directory ' + directoryPath, err);
            } else {
                console.log('Created directory ' + directoryPath, res);
            }
        });
    },
    
    /**
     * Add the file to ipfs
     * @param {Buffer} file 
     */
    async addFile(file) {
        return await ipfs.add(file);
    },

    /**
     * Add the file to a directory in IPFS
     * @param {string} absoluteFilePath 
     * @param {Buffer} file 
     */
    async writeFile(absoluteFilePath, file) {
        return await ipfs.files.write(absoluteFilePath, file, {create: true});
    },

    /*
        READ 
    */
    async readDirectory(directoryPath, callback) {
        if (callback) {
            return await ipfs.files.ls(directoryPath, (err, res) => {
                callback(err, res);
            });
        } else {
            return await ipfs.files.ls(directoryPath);
        }
    },
    async getFileByHash(fileHash) {
        return await ipfs.get(fileHash);
    },
    async readFile(filepath) {
        return await ipfs.files.read(filepath);
    },

    /* 
        DELETE
    */
    async deleteDirectory(directoryPath) {
        return await ipfs.files.rm(directoryPath, {recursive: true}, (err, res) => {
            if (err) {
                console.log('Failed to delete directory', err);
            } else {
                console.log('Deleted directory ' + directoryPath + 'successfully.');
            }
        });
    },
    async deleteFile(filepath) {
        return await ipfs.files.rm(filepath, (err, res) => {
            if (err) {
                console.log('could not delete the file');
            }
        });
    }
}
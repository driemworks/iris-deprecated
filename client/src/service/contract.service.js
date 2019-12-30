

class ContractService {

    encryptionKeysContract = null;

    ContractService(encryptionKeysContract) {
        this.encryptionKeysContract = encryptionKeysContract;
    }

    async getPublicKey(callback) {
        return this.encryptionKeysContract.getPublicKey(callback);
    }

    async getSecretKey(userAddress, callback) {
        return this.encryptionKeysContract.getSecretKey(userAddress, callback);
    }

}
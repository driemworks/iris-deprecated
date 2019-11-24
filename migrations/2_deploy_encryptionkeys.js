var EncryptionKeys = artifacts.require("./EncryptionKeys.sol");

module.exports = function(deployer) {
    deployer.deploy(EncryptionKeys, 'mock-encryption-key', 'mock-decryption-key');
}
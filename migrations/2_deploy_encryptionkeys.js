var EncryptionKeys = artifacts.require("./EncryptionKeys.sol");

module.exports = function(deployer) {
    deployer.deploy(EncryptionKeys, 'mock-public-key', 'mock-private-key');
}
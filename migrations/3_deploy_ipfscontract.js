var IPFSInbox = artifacts.require("./IPFSInbox.sol");

module.exports = function(deployer) {
    deployer.deploy(IPFSInbox);
}
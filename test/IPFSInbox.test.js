import { AssertionError } from "assert";

const truffleAssert = require('truffle-assertions');
const IPFSInbox = artifacts.require("./IPFSInbox.sol");

contract("IPFSInbox", accounts => {

    let ipfsInbox;

    beforeEach("setup contract for test", async function() {
        ipfsInbox = await IPFSInbox.deployed();
    });

    it("should emit an event when you send an IPFS address.", async() => {
        let result = await ipfsInbox.sendIPFS(accounts[1], "sampleAddress", { from: accounts[0] });
        truffleAssert.prettyPrintEmittedEvents(result);
    });

});

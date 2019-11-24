import { AssertionError } from "assert";

const truffleAssert = require('truffle-assertions');
const EncryptionKeys = artifacts.require("./EncryptionKeys.sol");

contract("EncryptionKeys", accounts => {

    let encryptionKeys;
    const encryptionKey = 'encryptionKey';
    const decryptionKey  = 'decryptionKey';

    beforeEach("setup contract for test", async function() {
        encryptionKeys = await EncryptionKeys.deployed(encryptionKey, decryptionKey);
    });

    it ("should emit an event when retrieving encryption key", async() => {
        let encryptionKeyResult = await encryptionKeys.getEncryptionKey();
        truffleAssert.prettyPrintEmittedEvents(encryptionKeyResult);
    });

    it ("should emit an event when retrieving decryption key", async() => {
        let decryptionKeyResult = await encryptionKeys.getDecryptionKey();
        truffleAssert.prettyPrintEmittedEvents(decryptionKeyResult);
    });

});

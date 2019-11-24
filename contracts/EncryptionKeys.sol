 pragma solidity ^0.5.8;
contract EncryptionKeys {
    // variables
    address public owner;
    string private encryptionKey;
    string private decryptionKey;

    // Structures

    // events
    event encryptionRetrieved(string key);
    event decryptionRetrieved(string key);
    event notAuthorized(address nodeHash);

    // functions
    constructor (string memory _encryptionKey, string memory _decryptionKey) public {
        encryptionKey = _encryptionKey;
        decryptionKey = _decryptionKey;
        owner = msg.sender;
    }

    function getEncryptionKey() public {
        if (owner == msg.sender) {
            emit encryptionRetrieved(encryptionKey);
        } else {
            emit notAuthorized(msg.sender);
        }
    }

    function getDecryptionKey() public {
        if (owner == msg.sender) {
            emit decryptionRetrieved(decryptionKey);
        } else {
            emit notAuthorized(msg.sender);
        }
    }

}
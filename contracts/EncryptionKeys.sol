 pragma solidity ^0.5.8;
//  pragma experimental ABIEncoderV2;

contract EncryptionKeys {
        // variables
    address public owner;
    string private publicKey;
    string private privateKey;

    // events
    event publicKeyRetrieved(string key);
    event privateKeyRetrieved(string key);
    event notAuthorized(address nodeHash);

    // functions
    constructor (string memory _publicKey, string memory _privateKey) public {
        publicKey = _publicKey;
        privateKey = _privateKey;
        owner = msg.sender;
    }

    function getPublicKey() public {
        emit publicKeyRetrieved(publicKey);
    }

    function getPrivateKey() public {
        if (owner == msg.sender) {
            emit privateKeyRetrieved(privateKey);
        } else {
            emit notAuthorized(msg.sender);
        }
    }

}
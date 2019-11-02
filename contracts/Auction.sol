pragma solidity ^0.5.8;
contract Auction {
    // Structures
    mapping (address => string) ipfsInbox;
    // Events
    event ipfsSent(string _ipfsHash, address _address);
    event inboxResponse(string response);

    int test;

    // Modifiers
    modifier notFull (string memory _string) {
        bytes memory stringTest = bytes(_string); require (stringTest.length == 0, "Could not read from inbox");
        _;
    }
    // An empty constructor that creates an instance of the contract
    constructor() public {
        test = 1;
    }

    // A function that takes in the receiver's address and the
    // IPFS address. Places the IPFS address in the receiver's
    // inbox.
    function sendIPFS(address  _address, string memory _ipfsHash)
        public
        notFull(ipfsInbox[_address])
    {
       ipfsInbox[_address] = _ipfsHash;
       emit ipfsSent(_ipfsHash, _address);
    }

    // A function that checks your inbox and empties it afterwards.
    // Returns an address if there is one, or "Empty Inbox"
    function checkInbox()
        public
    {
        string memory ipfs_hash = ipfsInbox[msg.sender];
        if(bytes(ipfs_hash).length == 0) {
            emit inboxResponse("Empty Inbox");
        } else {
            ipfsInbox[msg.sender] = "";
            emit inboxResponse(ipfs_hash);
        }
    }
}
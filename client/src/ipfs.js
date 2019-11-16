const IPFS = require('ipfs-http-client');
// const IPFS = require('ipfs');

const ipfs = new IPFS({
    host: '127.0.0.1',
    port: 5001,
    protocol: 'http'
});

export default ipfs;
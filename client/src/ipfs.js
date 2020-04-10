const IPFS = require('ipfs-http-client');

// const ipfs = new IPFS({
//     host: '127.0.0.1',
//     port: 5002,
//     protocol: 'https'
// });

const ipfs = new IPFS({
    host: '3.224.116.20',
    port: 5002,
    protocol: 'https'
});

export default ipfs;

 
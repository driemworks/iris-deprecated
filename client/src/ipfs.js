const IPFS = require('ipfs-http-client');

const ipfs = new IPFS({
    host: 'ec2-3-84-45-253.compute-1.amazonaws.com',
    port: 5001,
    protocol: 'http'
});

// const ipfs = new IPFS({
//     host: 'ipfs.infura.io',
//     port: 5001,
//     protocol: 'https'
// });

export default ipfs;


const IPFS = require('ipfs-http-client');

// const ipfs = new IPFS({
//     host: '127.0.0.1',
//     port: 5001,
//     protocol: 'http'
// });

const ipfs = new IPFS({
    host: 'ec2-184-72-99-4.compute-1.amazonaws.com',
    port: 5001,
    protocol: 'http'
});

export default ipfs;

 
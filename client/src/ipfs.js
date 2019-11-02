const IPFS = require('ipfs-http-client');
// TODO -> the above might fail, if it does run npm i ipfs-api and replace it with
// const IPFS = require('ipfs-api');
const ipfs = new IPFS({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https'
});

export default ipfs;
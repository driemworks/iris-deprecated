const IPFS = require('ipfs-http-client');

const ipfs = new IPFS({
    host: process.env.NODE_ENV === 'development' ? '127.0.0.1' :'iris-app.de',
    port: process.env.NODE_ENV === 'development' ? 5001 : 443,
    protocol: process.env.NODE_ENV === 'development' ? 'http' : 'https'
}); 

export default ipfs;

 
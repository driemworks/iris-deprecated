const path = require("path");
require('babel-register');
require('babel-polyfill');

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  contracts_build_directory: path.join(__dirname, "client/src/contracts"),
  networks: {
    development: {
      host: '127.0.0.1',
      port: 8545,
      network_id: '*',
      gas_limit: '30000000000'
    },
    ropsten: {
      host: '127.0.0.1',
      port: 8545,
      network_id: '3',
      gas_limit: '290000'
    }
  },
  rpc: {
    host: 'localhost',
    post: 8080
  }
};

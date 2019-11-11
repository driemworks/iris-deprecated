# IPFS-ETHEREUM-DEMO

## Reccomendations

* Development is easiest in a linux based environment, windows presents many issues related to node-gyp

## SETUP

### Local Dev setup

* setup local IPFS node
  * install [go](https://github.com/golang/go/wiki/Ubuntu)
    *

    ``` bash
      sudo add-apt-repository ppa:longsleep/golang-backports
      sudo apt-get update
      sudo apt-get install golang-go
    ```

    * verify installation by running `go version`
  * install ipfs
    * Download distribution from `https://dist.ipfs.io/#go-ipfs`
    * Complete installation by running:

    ``` bash
    sudo apt-get update
    wget https://dist.ipfs.io/go-ipfs/v0.4.18/go-ipfs_v0.4.18_linux-amd64.tar.gz
    tar xvfz go-ipfs_v0.4.18_linux-amd64.tar.gz
    sudo mv go-ipfs/ipfs /usr/local/bin/ipfs
    ```

    * verify installation by running `ipfs version`
    * if you experience CORS issues, run

    ``` bash
    ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["http://localhost"]'
    ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "GET", "POST"]'
    ```


* to migrate truffle contracts
  * `npm i babel-register`
  * `npm i babel-polyfill`
  * `npm i truffle-assertions`
  * if you encounter couldn't find preset "es2015" relative to directory then run `npm install babel-preset-es2015 babel-preset-stage-2 --save`
  * deploying/updating new contract, then install `npm i -g truffle`
  * install ganache-cli `npm i -g ganache-cli`

## Local Development

* `https://www.npmjs.com/package/truffle`
* `truffle migrate`
* `truffle test`
* `truffle deploy`
  * this may have to be done from an elevated terminal session (i.e. use sudo)
* `https://www.npmjs.com/package/ganache-cli`
* open a terminal and run `ganache-cli`
* navigate to the client directory and run `npm start`
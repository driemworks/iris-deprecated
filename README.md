# IRIS

Powered by
<div>
  <img src="https://github.com/driemworks/ipfs-ether-demo/blob/master/resources/ipfs-logo.png" width="250" height="250" >
  <img src="https://github.com/driemworks/ipfs-ether-demo/blob/master/resources/ethereum.jpg" width="250" height="250" />
</div>

### Try the demo at https://iris-app.de/

<br>
Iris is a decentralized web application providing functionality to store and share encrypted data uploaded to IPFS. The ultimate goal is to build a decentralized digital content marketplace.

## Motivation

### 1. The need for decentralization
As governments around the world continue to increase censorship and regulations as they relate to online platforms, in order to retain electronic freedom, decentralization is required. 

#### 2. IPFS uploads are insecure
  > Q: Files that are uploaded to IPFS are not secure. Each file is assigned a unique hash and any node in the network can download that data if the hash is known.
  
  > A: Encrypting the data prior to uploading to IPFS can eliminate the issue of others accessing your data. Ethereum can be used to encrypt, decrypt, and manage/protect your encryption keys. This is accomplished by using ethereum as a user management system (each new iris accounts is equivalent to creating a new etheruem account). Your mnemonic key is stored in your browser's localstorage, encrypted using the browser-passwordify library (in the same way as metamask).

#### 3. IPFS uploads are not simple to download (for those who don't understand IPFS)
  > Q: Files that are added to IPFS are publically available to all nodes within the network. However, the requirement that these files must be downloaded by their hash only can pose a large obstruction for those who are not familiar with what IPFS is.
  
  > A: By providing a consistent and common structure, stored in a user specific directory in IPFS (identified by eth account), data can easily be shared.

## Development recomendations

* Development is easiest in a linux based environment (windows presents many issues related to node-gyp).

## Roadmap

* [x] Ethereum based user management
* [x] Upload/Download/Share encrypted files from IPFS
* [-] add funds to ethereum wallet
* [-] apply paywall or other contract to files

## SETUP

### Local Dev setup

* Running the app
  * setup local IPFS node
  * To run iris locally
    * navigate to the `client` directory and execute `npm install` and then `npm start`
  * contracts are stored in the contracts directory

## Local Development

* if you encounter errors.js 183 then run `echo fs.inotify.max_user_watches=524288 | sudo      tee -a /etc/sysctl.conf && sudo sysctl -p`

* to clear ipfs files uploaded locally, run:

  * ``` bash
      ipfs pin ls --type recursive | cut -d' ' -f1 | xargs -n1 ipfs pin rm
      ipfs repo gc
    ```

* this project is intended to be run alongside the (Mercury API)[https://github.com/driemworks/mercury]. Mocks for this interaction are underway. However, for the time being, mercury must be run alongside iris.
* From the root directory, run `npm install`
  * NOTE: for now, having the nested client dir is NOT needed, so this may change in the future
* navigate to the client directory and run `npm start`

## Testing

* Todo

* Contract tests
  * run `ganache cli`
  * After migrating contract to the blockchain with `truffle deploy` test contracts with `truffle test`

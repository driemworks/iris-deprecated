# IRIS

<div>
  <img src="https://github.com/driemworks/ipfs-ether-demo/blob/master/resources/ipfs-logo.png" width="250" height="250" >
  <img src="https://github.com/driemworks/ipfs-ether-demo/blob/master/resources/ethereum.jpg" width="250" height="250" />
</div>

Developed with ethereum and IPFS.
<br>
Iris is a decentralized web application to upload sensitive data to IPFS.

<!-- * currently build hosted at: http://ec2-54-236-247-216.compute-1.amazonaws.com:8080/ipfs/QmbQsSKLkdh1PVGDNz8BiuGU5Mo6SPKc42mDvfUijcRoSg/ -->

## Reccomendations

* Development is easiest in a linux based environment (windows presents many issues related to node-gyp).

## Roadmap

* [x] Ethereum based user management
* [x] Upload/Donwload encrypted files
* [-] Contribution guidelines, enhance documentation
* [-]  view/search/verify users
* [-] Share files with multiple users
* [-] Pagination for uploads
* [-] add funds to ethereum wallet
  * [-] apply paywall or other contract to files
* [-] view file in browser

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

* From the root directory, run `npm install`
  * NOTE: for now, having the nested client dir is NOT needed, so this may change in the future
* navigate to the client directory and run `npm start`

## Testing

* Todo

* Contract tests
  * run `ganache cli`
  * After migrating contract to the blockchain with `truffle deploy` test contracts with `truffle test`

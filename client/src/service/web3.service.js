import Web3 from "web3";

export const Web3Service = {

    checkAndInstantiateWeb3() {
        if (typeof window.web3 !== 'undefined') {
            console.info('Using injected Web3');
            return new Web3(window.web3.currentProvider);
        } else {
            console.warn('Could not find an injected web3');
            return null;
        }
    }

}

export default Web3Service;
import React from 'react';
import ReactDOM from 'react-dom';

import LockImage from '../../resources/lock_icon.jpg';
import ContractCardComponent from './card/contract-card.component';
import ContractService from '../../service/contract.service';

import './contracts.component.css';

class ContractsComponent extends React.Component {

    constructor(props) {
        super(props);
    }

    async generateEncryptionKeysContract() {
        await ContractService.generateKeys(this.props.web3, this.props.account);
    }

    render() {
        return (
            <div className="contracts-container">
                <div className="contracts-header">
                    Contracts
                </div>
                <div className="card-container">
                    <ContractCardComponent 
                        headerImage={LockImage}
                        contractName='Encryption Keys Contract'
                        cardText='Generate encryption keys and store them in a smart contract deployed to the Ethereum blockchain.
                        This contract then can then be applied to perform assymetric encryption, and send an encrypted file
                        to another user.'
                        onConfirm={this.generateEncryptionKeysContract.bind(this)}
                    />
                </div>
            </div>
        );
    }
}

ReactDOM.render(<ContractCardComponent />, document.getElementById('root'));
export default ContractsComponent;
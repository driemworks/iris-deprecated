import React from 'react';
import ReactDOM from 'react-dom';
import { If, Else } from 'rc-if-else';

import LockImage from '../../resources/lock_icon.jpg';
import ContractCardComponent from './card/contract-card.component';
import {ContractService} from '../../service/contract.service';

import './contracts.component.css';

class ContractsComponent extends React.Component {

    contractCardText = 'Generate encryption keys and store them in a smart contract deployed to the Ethereum blockchain.This contract then can then be applied to perform assymetric encryption, and send an encrypted file to another user.';

    constructor(props) {
        super(props);

        if (props.user && props.user.contract) {
            this.contractCardText = 'Contract deployed at ' + props.user.contract;
        }
    }

    async generateEncryptionKeysContract() {
        const contractResult = await ContractService.generateKeys(
            this.props.web3,
            this.props.user.account);
        await this.props.contractHandler(contractResult);
    }

    render() {
        if (!this.props.user) {
            return (
                <div>
                    Loading...
                </div>
            );
        }
        return (
            <div className="contracts-container">
                <div className="contracts-header">
                    Contracts
                </div>
                <If condition={this.props.user.contract === ''}>
                    <div className="card-container">
                        <ContractCardComponent 
                            headerImage  = {LockImage}
                            contractName = 'Encryption Keys Contract'
                            cardText     = {this.contractCardText}
                            onConfirm    = {this.generateEncryptionKeysContract.bind(this)}
                        />
                    </div>
                    <Else>
                        <div className="card-container">
                            <ContractCardComponent 
                                headerImage  = {LockImage}
                                contractName = 'Encryption Keys Contract'
                                cardText     = {this.contractCardText}
                                contract     = {this.props.user.contract}
                            />
                        </div>
                    </Else>
                </If>
            </div>
        );
    }
}

ReactDOM.render(<ContractCardComponent />, document.getElementById('root'));
export default ContractsComponent;
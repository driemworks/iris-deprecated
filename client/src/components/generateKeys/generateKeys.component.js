import React from "react";
import { ContractService } from '../../service/contract.service';
import { EncryptionService } from '../../service/encrypt.service';
import { IPFSDatabase } from '../../db/ipfs.db';
import {
  encodeBase64
} from 'tweetnacl-util';

import { contractDirectory, uploadDirectory, inboxDirectory } from '../../constants';
import { If, Else } from 'rc-if-else';
import './generateKeys.component.css';

class GenerateKeys extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            ethereumAccountId: props.ethereumAccountId,
            alias: "",
            contractAddress: ""
        };
    }

    generateKeys = async() => {
        const pairA = await EncryptionUtils.generateKeyPair();
        let publicKey = pairA.publicKey;
        let secretKey = pairA.secretKey;

        this.setState({ keysGenerated: true });
        const publicKeyAsString = encodeBase64(publicKey);
        const privateKeyAsString = encodeBase64(secretKey);
        const instance = await ContractService.deployContract(10000, this.props.web3, publicKeyAsString, 
            privateKeyAsString, this.props.ethereumAccountId);
        const contractAddress = instance.address;

        this.props.action(contractAddress);
        this.setState({ contractAddress });
        // create ipfs file and upload
        const contractDir =  contractDirectory(this.props.user.account);
        IPFSDatabase.createDirectory(contractDir);
        await IPFSDatabase.addFile(contractDir, 
            Buffer.from(contractAddress), 'contract.txt', (err, res) => {
        });
    }
    render() {
        return (
            <div className="generate-keys-container">
                <If condition={this.props.ethereumAccountId !== ""}>
                    <If condition={this.state.contractAddress === ""}>
                            <div className="keys-container">
                                <p>
                                    Generate encryption keys to allow you to send encrypted files.
                                    This will cost ethereum.
                                </p>
                                <button className="btn generate-keys-btn" onClick={this.generateKeys.bind(this)}>
                                    Generate Keys
                                </button>
                            </div>
                    </If>
                </If>
            </div>
        );
    }
}

export default GenerateKeys;

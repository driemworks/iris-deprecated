import React, { Component } from "react";
import { IPFSDatabase } from '../../db/ipfs.db';
import { If, Else } from 'rc-if-else';
import './init-user.component.css';
import { 
    aliasDirectory, inboxDirectory, uploadDirectory, 
    publicKeyDirectory, irisResources, localStorageConstants
} from "../../constants";
import { EncryptionService } from '../../service/encrypt.service';
import { box, randomBytes } from 'tweetnacl';
import {
  decodeUTF8,
  encodeUTF8,
  decodeBase64,
  encodeBase64
} from 'tweetnacl-util';

class InitUserComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            creatingAlias: false
        };
    }

    setAlias(e) {
        this.setState({alias: e.target.value});
    }

    createAliasBox() {
        this.setState({creatingAlias: true});
    }

    async generateAlias() {
        // TODO - verify alias uniqueness
        // create user directories
        const aliasDir = aliasDirectory(this.props.user.account);
        const inboxDir = inboxDirectory(this.props.user.account);
        const uploadsDir = uploadDirectory(this.props.user.account);

        await IPFSDatabase.createDirectory(aliasDir);
        await IPFSDatabase.createDirectory(inboxDir);
        await IPFSDatabase.createDirectory(uploadsDir);
        const fileContent = 'alias=' + this.state.alias;
        await IPFSDatabase.addFile(aliasDir, Buffer.from(fileContent), 'data.txt');
        await this.generateKeys(this.props.user.account);
        // add to aliases file
        this.props.aliasHandler(this.state.alias);
    }

    async generateKeys(account) {
        const pairA = box.keyPair();
        const publicKey = pairA.publicKey;
        const secretKey = pairA.secretKey;

        // add public key to IPFS
        const publicKeyDir = publicKeyDirectory(account);
        await IPFSDatabase.createDirectory(publicKeyDir);
        await IPFSDatabase.addFile(publicKeyDir, Buffer.from(publicKey), 'public-key.txt');

        const irisPublicKey = decodeBase64('Qcky1gbmgrkyUladQDyw9532YLlZFeo439mX+wKL630=');

        const sharedKey = await box.before(new Uint8Array(irisPublicKey), new Uint8Array(secretKey));
        const encrypted = EncryptionService.encrypt(sharedKey, Buffer.from(secretKey));
        // add private key to chrome data store
        localStorage.setItem(localStorageConstants.PRIV_KEY, encrypted);
    }

    render() {
        if (!this.props.user) {
            return (
                <div>
                    Loading...
                </div>
            );
        } else {
            return (
                <div className="generate-alias-container">
                    <If condition={this.props.user.alias === ''}>
                        <div className="btn-container">
                            <div className="alias-container">
                                <If condition={this.state.creatingAlias === false}>
                                    <button className="btn generate-keys-btn" onClick={this.createAliasBox.bind(this)}>
                                        Create Alias
                                    </button>
                                    <Else>
                                        <p>
                                            Create alias for account
                                        </p>
                                        <input className="alias-input-box" type="textbox" placeholder="alias" onChange={this.setAlias.bind(this)} />
                                        <button onClick={this.generateAlias.bind(this)}>
                                            Submit
                                        </button>
                                    </Else>
                                </If>
                            </div>
                        </div>
                    </If>
                </div>
            );
        }
    }
}

export default InitUserComponent;

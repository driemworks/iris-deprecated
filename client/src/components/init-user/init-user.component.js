import React, { Component } from "react";
import { IPFSDatabase } from '../../db/ipfs.db';
import { If, Else } from 'rc-if-else';
import './init-user.component.css';
import { 
    aliasDirectory, inboxDirectory, uploadDirectory, 
    publicKeyDirectory, irisResources, localStorageConstants
} from "../../constants";
import { EncryptionUtils } from '../../utils/encryption.utils';
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
        console.log(publicKey);
        const secretKey = pairA.secretKey;
        // add public key to IPFS
        const publicKeyDir = publicKeyDirectory(account);
        await IPFSDatabase.createDirectory(publicKeyDir);
        // encrypt secret key using the IRIS public key, and the secret key itself
        // const irisSecretKey = process.env.REACT_APP_SECRET_KEY;
        // encrypt with my public key, their secret key
        // so later, they can decrypt with my secret key and their public key
        // const irisPublicKeyBase64 = await IPFSDatabase.readFile(irisResources() + 'public-key.txt');
        // console.log(irisPublicKeyBase64);
        // const decoded = String.fromCharCode(...new Uint8Array(irisPublicKeyBase64));
        // console.log(decoded);
        // public key doesn't need to be retrieved from IPFS!
        const irisPublicKey = decodeBase64('Qcky1gbmgrkyUladQDyw9532YLlZFeo439mX+wKL630=');
        console.log(irisPublicKey);
        const sharedKey = box.before(new Uint8Array(irisPublicKey), new Uint8Array(secretKey));
        const encrypted = EncryptionUtils.encrypt(sharedKey, Buffer.from(secretKey));
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

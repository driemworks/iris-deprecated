import React, { Component } from "react";
import { IPFSDatabase } from '../../db/ipfs.db';
import { UserService } from '../../service/user.service';
import { If, Else } from 'rc-if-else';
import './init-user.component.css';
import {
    aliasDirectory, inboxDirectory, uploadDirectory,
    publicKeyDirectory, irisResources, localStorageConstants
} from "../../constants";
import { EncryptionService } from '../../service/encrypt.service';
import { box } from 'tweetnacl';
import { decodeBase64 } from 'tweetnacl-util';
import { Spinner } from 'reactstrap';

class InitUserComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            alias: '',
            createAlias: false,
            creatingAlias: false,
            uniqueAlias: false
        };
    }

    setAlias(e) {
        this.setState({ alias: e.target.value });
    }

    createAliasBox() {
        this.setState({ createAlias: true });
    }

    async generateAlias() {
        this.setState({ creatingAlias: true });
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
        // add alias to alias master list
        await this.updateMasterAliasList(this.state.alias, this.props.user.account);
        await this.generateKeys(this.props.user.account);
        // add to aliases file
        this.props.aliasHandler(this.state.alias);
        this.setState({ creatingAlias: false });
    }

    async updateMasterAliasList(alias, account) {
        // try to read file
        const aliasDir = irisResources();
        const newLine = alias + '|' + account + '\n';
        try {
            let aliasMasterFile = await IPFSDatabase.readFile(aliasDir + 'aliases.txt');
            aliasMasterFile += newLine;
            await IPFSDatabase.deleteFile(aliasDir + 'aliases.txt');
            await IPFSDatabase.addFile(aliasDir, Buffer.from(aliasMasterFile), 'aliases.txt');
        } catch (e) {
            await IPFSDatabase.addFile(aliasDir, Buffer.from(newLine), 'aliases.txt');
        }
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

    async verifyAlias(e) {
        const alias = e.target.value;
        const rawAliases = await UserService.loadPeers();
        // check if this is the first alias
        if (rawAliases.length > 0) {
            // get names array
            const aliases = rawAliases.map(function (value) {
                return value.name;
            });
            if (aliases.includes(alias)) {
                // if not a unique alias
                this.setState({ uniqueAlias: false, alias: ' ' });
            } else {
                // if is a unique alias, but not the first one
                this.setState({ uniqueAlias: true, alias: alias });
            }
        } else {
            // if this is the first alias added, then go ahead!
            this.setState({ uniqueAlias: true, alias: alias });
        }
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
                                <If condition={this.state.createAlias === false}>
                                    <button className="btn generate-keys-btn" onClick={this.createAliasBox.bind(this)}>
                                        Create Alias
                                    </button>
                                    <Else>
                                        <If condition={this.state.creatingAlias === true}>
                                            <Spinner size="lg" color="primary" />
                                            <Else>
                                                <p>
                                                    Create alias for account
                                                </p>
                                                <input className="alias-input-box" type="textbox" placeholder="alias" onChange={this.verifyAlias.bind(this)} />
                                                <If condition={this.state.uniqueAlias === true}>
                                                    <button onClick={this.generateAlias.bind(this)}>
                                                        Submit
                                                    </button>
                                                    <Else>
                                                        <If condition={this.state.alias === ' '}>
                                                            <span>Not a unique alias.</span>
                                                        </If>
                                                    </Else>
                                                </If>
                                            </Else>
                                        </If>
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

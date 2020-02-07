import React from "react";
import { IPFSDatabase } from '../../db/ipfs.db';
import { If, Else } from 'rc-if-else';
import './generateAlias.component.css';

class GenerateAlias extends React.Component {

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
        // create user directory
        const dir = '/content/' + this.props.user.account + '/usr/';
        await IPFSDatabase.createDirectory('/content/' + this.props.user.account);
        await IPFSDatabase.createDirectory(dir);
        const fileContent = 'alias=' + this.state.alias;
        await IPFSDatabase.addFile(dir, Buffer.from(fileContent), 'data.txt', (err, res) => {
        
        });
        this.props.aliasHandler(this.state.alias);
    }

    render() {
        if (!this.props.user) {
            return (
                <div>
                    Loading...?
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
                                        <input type="textbox" placeholder="alias" onChange={this.setAlias.bind(this)} />
                                        <button onClick={this.generateAlias.bind(this)}>
                                            Submit
                                        </button>
                                    </Else>
                                </If>
                            </div>
                        </div>
                    </If>
                    {/* <If condition={this.props.user.ethereumAddress !== ""}>
                        <If condition={this.props.alias === ""}>
                            
                        </If>
                        <Else>
                            {this.props.alias}
                        </Else>
                    </If> */}
                </div>
            );
        }
    }
}

export default GenerateAlias;

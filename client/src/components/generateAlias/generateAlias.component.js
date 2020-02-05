import React from "react";
import { IPFSDatabase } from '../../db/ipfs.db';

import store from '../../state/store/index';
import { If, Else } from 'rc-if-else';
import './generateAlias.component.css';

class GenerateAlias extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            creatingAlias: false,
            user: null
        };
    }

    async componentDidMount() {
        await store.subscribe(() => {
            this.setState({
                user: store.getState().user
            });
        });
    }

    setAlias(e) {
        this.setState({alias: e.target.value});
    }

    createAliasBox() {
        this.setState({creatingAlias: true});
    }

    async generateAlias() {
        // create user directory
        const dir = '/content/' + this.state.user.ethereumAddress + '/usr/';
        await IPFSDatabase.createDirectory('/content/' + this.props.ethereumAddress);
        await IPFSDatabase.createDirectory(dir);
        const fileContent = 'alias=' + this.state.alias;
        await IPFSDatabase.addFile(dir, Buffer.from(fileContent), 'data.txt', (err, res) => {
            if (!err) {
                console.log('added file successfully!');
            } else {
                console.log('********* error ' + err);
            }
        });
    }

    render() {
        if (this.state.user === null) {
            return (
                <div>
                    Loading...
                </div>
            );
        }
        return (
            <div>
                <If condition={this.state.user.ethereumAddress !== ""}>
                    <If condition={this.props.alias === ""}>
                        <div className="btn-container">
                            <div className="alias-container">
                                <If condition={this.state.creatingAlias === false}>
                                    <p>
                                        Create an alias for your ethereum address to allow others to
                                        more easily find you.
                                    </p>
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
                    <Else>
                        {this.props.alias}
                    </Else>
                </If>
            </div>
        );
    }
}

export default GenerateAlias;

import React, { Component } from "react";

import lightwallet from 'eth-lightwallet';
import { Button, ListGroup, ListGroupItem } from "reactstrap";

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

import './user-search.component.css';
import { Tooltip } from "@material-ui/core";

class UserSearchComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            selectedRecords: [],
            data: []
        }
    }

    componentDidMount() {
        if (this.props.peers) {
            this.setState({ data: this.props.peers });
        }
    }

    sendRequest(item) {
        // get your own public key to send in the request
        const publicKey = lightwallet.encryption.addressToPublicEncKey(this.props.wallet.ks,
             this.props.wallet.pwDerivedKey, this.props.wallet.address);
        const sendRequestObject = {
            address: this.props.wallet.address,
            alias: this.props.wallet.alias,
            publicKey: publicKey,
            state: 'REQUESTED'
        };

        const createRequestObject = {
            address: item.key,
            alias: item.value,
            publicKey: '',
            state: 'PENDING'
        };

        const sendRequestJSON = JSON.stringify(sendRequestObject);
        const createRequestJSON = JSON.stringify(createRequestObject);
        console.log(sendRequestJSON);
    }

    emitSelection() {
        this.props.emitSelection(this.state.selectedRecords);
    }

    render() {
        this.sendRequest          = this.sendRequest.bind(this);
        return (
            <div className="user-search-container">
                <div className="user-search-main">
                    <span className="user-search-title">
                        Add users
                    </span>
                    <Button className="share-button">Share</Button>
                </div>

                <div className="selection-container">
                    <TableContainer component={Paper}>
                        <Table className="inbox-table" aria-label="Inbox">
                            <TableHead>
                                <TableRow>
                                    <TableCell>User</TableCell>
                                    <TableCell>Select</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {this.state.data.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            {item.value}
                                        </TableCell>
                                        {/* <TableCell>
                                            TODO
                                        </TableCell> */}
                                        <TableCell>
                                            <input type="radio" value="select" name="select" />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </div>
            </div>
        );
    }

}

export default UserSearchComponent;
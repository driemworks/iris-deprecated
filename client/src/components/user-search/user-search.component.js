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

    // sendRequest(item) {
    //     // get your own public key to send in the request
    //     const publicKey = lightwallet.encryption.addressToPublicEncKey(this.props.wallet.ks,
    //          this.props.wallet.pwDerivedKey, this.props.wallet.address);
    //     const sendRequestObject = {
    //         address: this.props.wallet.address,
    //         alias: this.props.wallet.alias,
    //         publicKey: publicKey,
    //         state: 'REQUESTED'
    //     };

    //     const createRequestObject = {
    //         address: item.key,
    //         alias: item.value,
    //         publicKey: '',
    //         state: 'PENDING'
    //     };

    //     const sendRequestJSON = JSON.stringify(sendRequestObject);
    //     const createRequestJSON = JSON.stringify(createRequestObject);
    //     console.log(sendRequestJSON);
    // }

    selectUser(event) {
        //const checked = event.target.checked;
        const value = event.target.value;
        // add user's alias to selected records
        let selectedRecords = this.state.selectedRecords;
        const isInList = selectedRecords.indexOf(value) > -1;
        if (isInList != true) {
            selectedRecords.push(value);
        } else {
            // update checked param
            document.getElementById(value).checked = false;
            //remove from list
            selectedRecords = selectedRecords.filter(record => record != value);
        }
        
        this.setState({selectedRecords : selectedRecords });
    }

    emitSelection() {
        this.props.emitSelection(this.state.selectedRecords);
    }

    render() {
        this.selectUser = this.selectUser.bind(this);
        this.emitSelection = this.emitSelection.bind(this);
        return (
            <div className="user-search-container">
                <div className="user-search-main">
                    <span className="user-search-title">
                        Add users
                    </span>
                    <Button className="share-button" onClick={this.emitSelection}>Share</Button>
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
                                            <input id={item.value} type="radio" value={item.value} name={item.value} onClick={this.selectUser} />
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
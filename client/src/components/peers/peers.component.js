import React, { Component } from "react";

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import './peers.component.css';
import { IPFSDatabase } from "../../db/ipfs.db";
import { irisResources } from "../../constants";
import UserService from "../../service/user.service";

class PeersComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            peers: []
        };
    }

    async componentDidMount() {
        const peers = await UserService.loadPeers();
        this.setState({ peers:  peers });
    }

    render() {
        return(
            <div className="peers-container">
                <TableContainer component={Paper}>
                    <Table className="inbox-table" aria-label="Inbox">
                        <TableHead>
                            <TableRow>
                                <TableCell>Alias</TableCell>
                                <TableCell>Message</TableCell>
                                {/* <TableCell>Download</TableCell>
                                <TableCell>Delete</TableCell> */}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {this.state.peers.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell>{item}</TableCell>
                                    <TableCell>
                                        <FontAwesomeIcon className="cell message-contact-cell" icon={faExternalLinkAlt} />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>
        );
    }
}

export default PeersComponent;
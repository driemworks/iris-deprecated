import React, { Component } from "react";

import { If, Else, Elif } from 'rc-if-else';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

import './upload-queue.component.css';

class UploadQueueComponent extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        if (!this.props.uploadQueueItems) {
            return (
                <div>
                    
                </div>
            );
        }
        return (
            <div className="upload-queue-container">
                <div className="upload-queue-container-header">
                    Upload Queue
                </div>
                <If condition={this.props.uploadQueueItems.length === 0}>
                    <div>
                        No items in queue
                    </div>
                    <Else>
                        <div className="upload-queue-container-body">
                            <TableContainer component={Paper} className="upload-queue-table-container">
                                <Table className="upload-queue-table" aria-label="Inbox">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Filename</TableCell>
                                            <TableCell>Recipient</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {this.props.uploadQueueItems.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{item.filename}</TableCell>
                                                <TableCell>
                                                    <span className="item-recipient-container">
                                                        {item.recipient}
                                                    </span>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </div>
                    </Else>
                </If>
            </div>
        );
    }

}

export default UploadQueueComponent;
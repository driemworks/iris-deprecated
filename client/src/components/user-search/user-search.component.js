import React, { Component } from "react";

import ReactSearchBox from 'react-search-box';
import { Button, ListGroup, ListGroupItem } from "reactstrap";

import './user-search.component.css';

class UserSearchComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            selectedRecords: [],
            data: []
        }
    }

    componentDidMount() {
        this.loadData(this.props.peers);
    }

    loadData(peers) {
        if (peers) {
            let data = [];
            // alias|account \n
            const lines = peers.split('\n');
            for (let line of lines) {
                if (line !== "") {
                    const split = line.split('|');
                    console.log(split);
                    // don't push yourself
                    if (split[1] !== this.props.wallet.address) {
                        data.push({
                            key: split[1],
                            value: split[0]
                        });
                    }
                }
            }
            console.log('data ' + JSON.stringify(data));
            this.setState({ data: data });
            this.forceUpdate();
        }
    }

    addSelectedRecord(record) {
        // add to selected
        // remove from data
        this.setState(state => {
            const selectedRecords = state.selectedRecords.concat(record);
            const data = state.data.filter(function (obj) {
                return obj.key !== record.key;
            });
            return {
                selectedRecords,
                data
            };
        });
        console.log('data removed! ' + JSON.stringify(this.data));
    }

    removeSelectedRecord(record) {
        // remove from selected
        this.setState(state => {
            const selectedRecords = state.selectedRecords.filter(function (obj) {
                return obj.key !== record.key;
            });
            const data = state.data.concat(record);
            return {
                selectedRecords,
                data
            };
        });
        // add back to data
        // this.data = this.data.concat(record);
        console.log('data added! ' + JSON.stringify(this.data));
    }

    emitSelection() {
        this.props.emitSelection(this.state.selectedRecords);
    }

    render() {
        this.addSelectedRecord    = this.addSelectedRecord.bind(this);
        this.emitSelection        = this.emitSelection.bind(this);
        this.removeSelectedRecord = this.removeSelectedRecord.bind(this);
        return (
            <div>
                <div className = "search-box-container">
                    <ReactSearchBox
                        placeholder = "Select a user"
                        value = ""
                        data = {this.state.data}
                        onSelect = {record => this.addSelectedRecord(record)}
                    />
                </div>
                <Button color="primary" className="send-button" disabled={this.state.selectedRecords.length === 0} size="sm" onClick={this.emitSelection}>
                    Send
                </Button>
                <div className="selection-container">
                    <ListGroup>
                        {this.state.selectedRecords.map(item => (
                            <div className="selection-item">
                                <ListGroupItem>
                                    <span className="display-name">{item.value}</span>
                                    <Button color="danger" className="remove-button" onClick={() => this.removeSelectedRecord(item)}>
                                        Remove
                                    </Button>
                                </ListGroupItem>
                            </div>
                        ))}
                    </ListGroup>
                </div>
            </div>
        );
    }

}

export default UserSearchComponent;
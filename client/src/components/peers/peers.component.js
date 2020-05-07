import React, { Component } from 'react';
import { MDBDataTable } from 'mdbreact';

import { faSync } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
    withRouter
  } from "react-router-dom";

import './peers.component.css';

class PeersComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            data: null
        }
    }

    componentDidMount() {
        if (this.props.peers) {
            this.loadPeers();
        }
    }

    loadPeers() {
        const data = {
            columns: [
                {
                    label: 'Username',
                    field: 'username',
                    sort: 'asc',
                    width: 270,
                    // clickEvent: () => this.handleUsernameClick('')
                },
                // {
                //     label: 'View Profile',
                //     field: 'view',
                //     sort: 'asc',
                //     width: 270
                // }
            ],
            rows: this.createRows(this.props.peers)
        };

        this.setState({data: data});
        this.forceUpdate();
    }

    createRows(peers) {
        let dataArray = [];
        for (const p of peers) {
            dataArray.push({ 
                username: p.value,
                clickEvent: () => this.handleUsernameClick(p.key)
            });
        }
        return dataArray;
    }

    handleUsernameClick(username) {
        console.log(username);
        const route = "/profile/" + username;
        this.props.history.push(route);
    }

    render() {
        this.loadPeers = this.loadPeers.bind(this);
        if (!this.state.data) {
            return (
                <div className="peers-container">
                    Loading...
                </div>
            );
        } else {
            return (
                <div className="peers-container">
                    <MDBDataTable
                        striped hover data={this.state.data}
                    />
                </div>
            );
        }
    }

}

export default withRouter(PeersComponent);
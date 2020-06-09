import React, { Component } from 'react';

import { ApiService } from '../../service/api.service';

import {
    BrowserRouter as Router,
    withRouter
  } from "react-router-dom";

import './peers.component.css';
import { MDBDataTable } from 'mdbreact';

class PeersComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            data: null
        }
    }

    async componentDidMount() {
        await this.loadPeers();
    }

    async loadPeers() {
        const peers = await this.getPeers();
        const data = {
            columns: [
                {
                    label: 'Username',
                    field: 'username',
                    sort: 'asc',
                    width: 270,
                    // clickEvent: () => this.handleUsernameClick(username)
                },
                // {
                //     label: 'View Profile',
                //     field: 'view',
                //     sort: 'asc',
                //     width: 270
                // }
            ],
            rows: this.createRows(peers)
        };

        this.setState({data: data});
    }

    async getPeers() {
        const peers = await ApiService.read('iris.resources', 'user-data.json');

        if (peers.data[0]) {
            return peers.data[0].doc;
        }
        return peers;
    }

    createRows(peers) {
        let dataArray = [];
        for (const p of peers) {
            dataArray.push({ 
                username: p.username,
                clickEvent: () => this.handleUsernameClick(p.address)
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
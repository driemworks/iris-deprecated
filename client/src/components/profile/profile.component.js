import React from 'react';

import { aliasDirectory, publicUploadDirectory } from '../../constants';
import { withRouter } from 'react-router-dom';
// import { IPFSService } from '../../service/ipfs.service';
import { MDBDataTable } from 'mdbreact';

import './profile.component.css';
import ApiService from '../../service/api.service';

class ProfileComponent extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            alias: '',
            uploadData: {}
        };

        // bind functions for render
        this.getUploadsView = this.getUploadsView.bind(this);
    }

    async componentDidMount() {
        if (this.props) {
            // load files
            const address = this.props.match.params.address;

            const userFileResponse = await ApiService.read('iris.resources', 'user-data.json');
            const alias = userFileResponse.data[0].doc.filter((entry) => {
                return entry.address === address;
              })[0].username;

            const filesResponse = await ApiService.read(address, 'upload-data.json');
            let publicUploads = [];
            // if the user has upload any files
            if (filesResponse[0]) {
                publicUploads = filesResponse[0].doc;
            }

            const data = this.formatUploadData(publicUploads);
            this.setState({ alias: alias, uploadData: data });
        }
    }

    formatUploadData(uploadData) {
        return {
            columns: [
                {
                    label: 'Filename',
                    field: 'filename',
                    sort: 'asc',
                    width: 270,
                    // clickEvent: () => this.handleUsernameClick('')
                },
                {
                    label: 'Download',
                    field: 'download',
                    sort: 'asc',
                    width: 270
                }
            ],
            rows: this.createRows(uploadData)
        }
    }

    createRows(uploads) {
        let dataArray = [];
        for (const u of uploads) {
            dataArray.push({ 
                filename: u.filename,
                download: 'TODO'
            });
        }
        return dataArray;
    }

    getUploadsView() {
        console.log(Object.keys(this.state.uploadData).length);
        if (Object.keys(this.state.uploadData).length === 0) {
            return (
                <span>
                    The user has not uploaded any files.
                </span>
            );
        } else {
            return (
                <MDBDataTable
                    striped hover data={this.state.uploadData}
                />
            );
        }
    }

    render() {
        if (!this.props) {
            return (
                <div>
                    Loading...
                </div>
            );
        }

        return (
            <div className="profile-container">
                <div className="user-data-container">
                    <span className="username-container">
                        {this.state.alias}
                    </span>
                </div>
                <div className="public-uploads-container">
                    {this.getUploadsView()}
                </div>
            </div>
        );
    }
}

export default withRouter(ProfileComponent);
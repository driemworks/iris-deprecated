import React from 'react';
import { MDBDataTable } from 'mdbreact';

class FileTable extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            uploadData: []
        };
    }

    componentDidMount() {
        if (this.props) {
            this.setState({ uploadData: this.formatUploadData(this.props.uploadData) });
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
                    label: 'Type',
                    field: 'type',
                    sort: 'asc',
                    width: 270
                },
                {
                    label: 'Upload Date',
                    field: 'uploadTime',
                    sort: 'asc',
                    width: 270
                },
                {
                    label: 'Share',
                    field: 'share',
                    sort: 'asc',
                    width: 270
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

    createRows(uploadData) {
        let dataArray = [];
        if (uploadData) {
            for (const u of uploadData) {
                dataArray.push({ 
                    filename: u.filename,
                    type: u.type,
                    uploadTime: u.uploadTime,
                    share: 'TODO',
                    download: 'TODO'
                });
            }
        }
        return dataArray;
    }

    getUploadsView() {
        if (!this.state.uploadData) {
            return (
                <span>
                    Loading...
                </span>
            );
        } else if (this.state.uploadData.length === 0) {
            return (
                <span>
                    { this.props.emptyText }
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
            <div className="public-uploads-container">
                {this.getUploadsView()}
            </div>
        );
    }
}

export default FileTable;
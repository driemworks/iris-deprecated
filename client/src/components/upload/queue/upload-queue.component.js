import React, { Component } from "react";

import './upload-queue.component.css';

class UploadQueueComponent extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        if (!this.props.uploadQueueItems) {
            return (
                <div>
                    No items
                </div>
            );
        }
        return (
            <div className="upload-queue-container">
                <div className="upload-queue-container-header">
                    Upload Queue
                </div>
                <div className="upload-queue-container-body">
                    {this.props.uploadQueueItems.map((item, index) => 
                        <div className="upload-queue-item-container">
                            <span>{item.filename}</span>
                            <span>{item.recipient}</span>
                        </div>
                    )}
                </div>
            </div>
        );
    }

}

export default UploadQueueComponent;
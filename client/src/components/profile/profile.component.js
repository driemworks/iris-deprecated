import React from 'react';

import { useParams } from 'react-router-dom';

class ProfileComponent extends React.Component {

    constructor(props) {
        super(props);
        // this.state = {
        //     address: ''
        // };
    }

    componentDidMount() {
        if (this.props) {
        }
    }

    render() {
        // let address = useParams();
        if (!this.props) {
            return (
                <div>
                    Loading...
                </div>
            );
        }

        return (
            <div className="profile-container">
                <p>Profile for address {this.props.address}</p>
                <p>
                    Coming Soon.
                </p>
            </div>
        );
    }
}

export default ProfileComponent;
import { connect } from 'react-redux';
import { Component, PropTypes } from 'react';

import { loadUser } from '../actions/index';

class UserContainer extends Component {
    constructor() {
        super();
    }

    render() {
        return null;
    }
}

const mapDispatchToProps = { loadUser }

export default connect(null, mapDispatchToProps)(UserContainer)

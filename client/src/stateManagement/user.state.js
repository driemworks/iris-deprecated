import {Container} from 'unstated';

/**
 * State management for the user object
 */
class UserContainer extends Container {
    state = {
        accounts: []
    }

    populateAccounts = (ethereumAccounts) => {
        this.setState({ accounts: ethereumAccounts });
    }

}

export default UserContainer;


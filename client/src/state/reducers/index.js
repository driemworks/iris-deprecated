import { SET_VAULT_VARS, SET_JWT, ADD_ERROR, ADD_EVENT_DATA } from "../constants/action-types";

const initialState = {
    wallet: {
        ks           : null,
        pwDerivedKey : null,
        address      : ''
    },
    jwt: null,
    errors: [],
    events: []
};

function rootReducer(state = initialState, action) {
    if (action.type === SET_VAULT_VARS) {
        return Object.assign({}, state, {
            wallet: action.payload
        });
    } else if (action.type === SET_JWT) {
        return Object.assign({}, state, {
            jwt: action.payload
        });
    } else if (action.type === ADD_ERROR) {
        return Object.assign({}, state, {
            errors: state.errors.concat(action.payload)
        });
    } else if (action.type === ADD_EVENT_DATA) {
        return Object.assign({}, state, {
            events: state.events.concat(action.payload)
        });
    }

    return state;
}

export default rootReducer;
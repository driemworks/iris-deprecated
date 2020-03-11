import { LOAD_USER, ADD_TO_QUEUE, REMOVE_FROM_QUEUE, CONTRACT_DEPLOYING, SET_ADDRESS, SET_VAULT_VARS, LOAD_PEERS, ERROR } from "../constants/action-types";

const initialState = {
    wallet: {
        ks           : null,
        pwDerivedKey : null,
        address      : '',
        alias        : ''
    },
    peers            : null,
    uploadQueue      : [],
    error            : ""
};

function rootReducer(state = initialState, action) {
    if (action.type === ADD_TO_QUEUE) {
        return Object.assign({}, state, {
           uploadQueue: state.uploadQueue.concat(action.payload)
        });
    } else if (action.type === REMOVE_FROM_QUEUE) {
        return Object.assign({}, state, {
            uploadQueue: state.uploadQueue.filter(function(obj) {
                return !uploadObjEqualsItem(obj, action.payload);
            })
         });
    } else if (action.type === SET_VAULT_VARS) {
        return Object.assign({}, state, {
            wallet: action.payload
        });
    } else if (action.type === LOAD_PEERS) {
        return Object.assign({}, state, {
            peers: action.payload
        });
    } else if (action.type === ERROR) {
        return Object.assign({}, state, {
            error: action.payload
        });
    }

    return state;
}

function uploadObjEqualsItem(obj, item) {
    return obj.startTime === item.startTime 
            && obj.filename === item.filename 
            && obj.recipient === item.recipient;
}

export default rootReducer;
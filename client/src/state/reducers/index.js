import { LOAD_USER, ADD_TO_QUEUE, REMOVE_FROM_QUEUE } from "../constants/action-types";

const initialState = {
    user: {
        alias:    '',
        contract: '',
        accounts: [],
        account:  ''
    },
    uploadQueue: []
};

/*
uploadqueue entries will look like:

{
    startTime: '',
    filename: '',
    recipient: ''
}
*/

function rootReducer(state = initialState, action) {
    if (action.type == LOAD_USER) {
        return Object.assign({}, state, {
            user: action.payload
        });
    } else if (action.type == ADD_TO_QUEUE) {
        return Object.assign({}, state, {
           uploadQueue: state.uploadQueue.concat(action.payload)
        });
    } else if (action.type == REMOVE_FROM_QUEUE) {
        return Object.assign({}, state, {
            uploadQueue: state.uploadQueue.filter(function(obj) {
                return uploadObjEqualsItem(obj, action.payload);
            })
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
import { LOAD_USER } from "../constants/action-types";

const initialState = {
    user: {}
};

function rootReducer(state = initialState, action) {
    if (action.type == LOAD_USER) {
        return Object.assign({}, state, {
            user: action.payload
        });
    }
    return state;
}

export default rootReducer;
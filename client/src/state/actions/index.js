import { LOAD_USER } from '../constants/action-types';

export function loadUser(payload) {
    return { 
        type: LOAD_USER, 
        payload: payload 
    }
}
import { 
    ADD_TO_QUEUE, REMOVE_FROM_QUEUE, SET_VAULT_VARS, LOAD_PEERS, ERROR
} from '../constants/action-types';

export function setVaultVars(payload) {
    return {
        type    : SET_VAULT_VARS,
        payload : payload
    }
}

export function loadPeers(payload) {
    return {
        type    : LOAD_PEERS,
        payload : payload
    }
}

export function error(payload) {
    return {
       type    : ERROR,
       payload : payload 
    }
}

/*
    queueing for uploads
*/
export function addToQueue(payload) {
    return {
        type: ADD_TO_QUEUE,
        payload: payload
    }
}

export function removeFromQueue(payload) {
    return {
        type: REMOVE_FROM_QUEUE,
        payload: payload
    }   
}
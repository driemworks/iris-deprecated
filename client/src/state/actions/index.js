import { LOAD_USER, ADD_TO_QUEUE, REMOVE_FROM_QUEUE, CONTRACT_DEPLOYING } from '../constants/action-types';

/*
USER function
*/
export function loadUser(payload) {
    return { 
        type: LOAD_USER, 
        payload: payload 
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

/*
queueing for contract
*/
export function toggleContractStatus() {
    return {
        type: CONTRACT_DEPLOYING
    }
}

/*
queueing for downloads
*/
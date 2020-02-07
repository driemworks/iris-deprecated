import { LOAD_USER, ADD_TO_QUEUE, REMOVE_FROM_QUEUE } from '../constants/action-types';

export function loadUser(payload) {
    return { 
        type: LOAD_USER, 
        payload: payload 
    }
}

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
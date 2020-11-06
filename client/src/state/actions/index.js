import { ADD_ERROR, ADD_EVENT_DATA, SET_JWT, SET_VAULT_VARS } from '../constants/action-types';

export function setVaultVars(payload) {
    return {
        type    : SET_VAULT_VARS,
        payload : payload
    }
}

export function setJWT(payload) {
    return {
        type: SET_JWT,
        payload: payload
    }
}

export function addError(payload) {
    return {
        type: ADD_ERROR,
        payload: payload
    }
}

export function setEventData(payload) {
    return {
        type: ADD_EVENT_DATA,
        payload: payload
    }
}
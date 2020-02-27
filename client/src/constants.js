// components to render
export const viewConstants = {
    UPLOAD    : 'UPLOAD',
    INBOX     : 'INBOX',
    CONTRACTS : 'CONTRACTS',
    ALIAS     : 'ALIAS',
    PEERS     : 'PEERS'
}

export const localStorageConstants = {
    PRIV_KEY : 'irisPrivateKey'
}

// hash of the content directory
export const content = '/content/';

export function irisResources() {
    return content + 'resources/';
}

// sub directories
export function aliasDirectory(account) {
    return content + account + '/usr/';
}

export function contractDirectory(account) {
    return content + account + '/contract/';
}

export function uploadDirectory(account) {
    return content + account + '/uploads/';
}

export function inboxDirectory(account) {
    return content + account + '/inbox/';
}

export function publicKeyDirectory(account) {
    return content + account + '/public-key/';
}

export function resources() {
    return content + 'resources/'
}


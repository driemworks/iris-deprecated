// components to render
export const viewConstants = {
    UPLOAD    : 'UPLOAD',
    INBOX     : 'INBOX',
    CONTRACTS : 'CONTRACTS',
    ALIAS     : 'ALIAS',
    PEERS     : 'PEERS'
}

// hash of the content directory
export const content = '/iris-content-directory/';

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


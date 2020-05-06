// components to render
export const viewConstants = {
    INBOX     : 'INBOX',
    PEERS     : 'USERS',
    PROFILE   : 'PROFILE'
}

export const HD_PATH_STRING = "m/44'/60'/0'/0";

export const localStorageConstants = {
    MNEMONIC : 'MNEMONIC'
}

export const content = '/content/';

export function irisResources(filename) {
    return content + 'resources/' + (filename ? filename : '');
}

export function aliasDirectory(account, filename) {
    return content + account + '/usr/' + (filename ? filename : '');
}

export function contractDirectory(account, filename) {
    return content + account + '/contract/' + (filename ? filename : '');
}

export function privateUploadDirectory(account, filename) {
    return content + account + '/uploads/private/' + (filename ? filename : '');
}

export function publicUploadDirectory(account, filename) {
    return content + account + '/uploads/public/' + (filename ? filename : '');
}

export function inboxDirectory(account, filename) {
    return content + account + '/inbox/' + (filename ? filename : '');
}

export function publicKeyDirectory(account, filename) {
    return content + account + '/public-key/' + (filename ? filename : '');
}

export function resources() {
    return content + 'resources/'
}


import { box, randomBytes } from 'tweetnacl';
import {
  decodeUTF8,
  encodeUTF8,
  decodeBase64,
  encodeBase64
} from 'tweetnacl-util';

export const EncryptionUtils = {
    newNonce: function() {
        return randomBytes(box.nonceLength);  
    },
    
    generateKeyPair: function() {
        return box.keyPair();
    },

    /**
     * Encrypt the json with the given keys
     * @param {*} secretOrSharedKey 
     * @param {*} json 
     * @param {*} key 
     */
    encrypt: function(secretOrSharedKey, json, key) {
    const nonce = this.newNonce();
    const messageUint8 = decodeUTF8(JSON.stringify(json));
    const encrypted = key ? box(messageUint8, nonce, key, secretOrSharedKey) 
                            : box.after(messageUint8, nonce, secretOrSharedKey);
    
    const fullMessage = new Uint8Array(nonce.length + encrypted.length);
    fullMessage.set(nonce);
    fullMessage.set(encrypted, nonce.length);

    const base64FullMessage = encodeBase64(fullMessage);
    // console.log(base64FullMessage);
    return base64FullMessage;
    },

    /**
     * Decrypt the message with the given keys
     * @param {*} secretOrSharedKey 
     * @param {*} messageWithNonce 
     * @param {*} key 
     */
    decrypt: function(secretOrSharedKey, messageWithNonce, key) {
    const messageWithNonceAsUint8Array = decodeBase64(messageWithNonce);
    const nonce = messageWithNonceAsUint8Array.slice(0, box.nonceLength);
    const message = messageWithNonceAsUint8Array.slice(box.nonceLength, 
        messageWithNonce.length);

    const decrypted = key ? box.open(message, nonce, key, secretOrSharedKey)
                            : box.open.after(message, nonce, secretOrSharedKey);

    if (!decrypted) {
        throw new Error('Could not decrypt message.');
    }

    const base64DecryptedMessage = encodeUTF8(decrypted);
    return JSON.parse(base64DecryptedMessage);
    }
}

// export default EncryptionUtils;
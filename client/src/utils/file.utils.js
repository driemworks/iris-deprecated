
// export const FileUtils = {
//     async createSharedKeyEncryption = (senderContractAddress, recipientContractAddress) => {
//         // sender secret key
//         const senderContract = await this.getContract(senderContractAddress);
//         const secretKeySendingAccount = await senderContract.getPrivateKey(
//           { from: this.state.defaultAccount }
//         );
    
//         // recipient public key
//         const recipientContract = await this.getContract(recipientContractAddress);
//         const publicKeySelectedAccount = await recipientContract.getPublicKey(
//           { from: this.state.selectedAccount }
//         );
    
//         const publicKeyRecipient = decodeBase64(publicKeySelectedAccount.logs[0].args['0']);
//         const secretKeySender = decodeBase64(secretKeySendingAccount.logs[0].args['0']);
//         // create shared key
//         return box.before(
//           publicKeyRecipient,
//           secretKeySender
//         );
//       }    
// }
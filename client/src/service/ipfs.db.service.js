import ipfs from '../ipfs';

export const OrbitDBService = {

    async init() {
        const OrbitDB = require('orbit-db');
        const orbitdb = await OrbitDB.createInstance(ipfs);
        return orbitdb;
    },

    async put(orbitdb, name, index, documentsIdObj) {
        const docstore = await orbitdb.docstore(name);
        for (let item of documentsIdObj) {
            console.log('item ' + JSON.stringify(item));
            docstore.put({ _id: item.id, doc: item.doc })
                .then((hash) => console.log('hash ' + hash))
                .then(() => docstore.get(item.id))
                .then((value) => console.log('retrieved first time ' + JSON.stringify(value)));    
        }
    },

    async query(orbitdb, name, queryParamOrFunction) {
        const docstore = await orbitdb.docstore(name);
        return docstore.get(queryParamOrFunction);
    }

}

export default OrbitDBService;

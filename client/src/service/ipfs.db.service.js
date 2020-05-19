import ipfs from '../ipfs';

export const OrbitDBService = {

    async initDocstore(name) {
        const OrbitDB = require('orbit-db');
        const orbitdb = await OrbitDB.createInstance(ipfs);
        const docstore = await orbitdb.docstore(name, { indexBy: 'name' });
        return docstore;
    },

    async put(docstore, documentsIdObj) {
        // const docstore = await orbitdb.docstore(name);
        for (let item of documentsIdObj) {
            await docstore.put({ _id: item.id, name: item.id, doc: item.doc });
        }
    },

    async getById(docstore, queryParamOrFunction) {
        return docstore.get(queryParamOrFunction);
    }

}

export default OrbitDBService;

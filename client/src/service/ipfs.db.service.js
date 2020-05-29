// import ipfs from '../ipfs';

export const OrbitDBService = {

    async initDocstore(name, ipfs) {
        const OrbitDB = require('orbit-db');
        const orbitdb = await OrbitDB.createInstance(ipfs);
        const dbConfig = {
            // If database doesn't exist, create it
            create: true,
            // Don't wait to load from the network
            sync: false,
            // Load only the local version of the database
            // localOnly: true,
            // Allow anyone to write to the database,
            // otherwise only the creator of the database can write
            accessController: {
              write: ['*'],
            }
          }
        const docstore = await orbitdb.docstore(name, dbConfig);
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

export const OrbitDBService = {

    async init(ipfs) {
        const OrbitDB = require('orbit-db');
        const orbitdb = await OrbitDB.createInstance(ipfs);
        const db = await orbitdb.log("hello orbitdb");
        await db.load();
        debugger;
    }

}

export default OrbitDBService;

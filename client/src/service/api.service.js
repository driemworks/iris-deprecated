import axios from 'axios';

export const ApiService = {
    async upload(docstorename, filename, json) {
        let url = 'http://localhost:4000/update/' + docstorename + '/' + filename;
        return await axios.patch(url, json);
    }, 

    async read(docstoreName, filename) {
        let url = 'http://localhost:4000/read/' + docstoreName + '/' + filename;
        return await axios.get(url);
    }
}

export default ApiService;
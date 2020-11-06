import Axios from 'axios';
import axios from 'axios';
import { addError, setEventData, setJWT } from '../state/actions';
import store from '../state/store/index';
const mercuryHost = 'http://localhost:4000/';

export const MercuryApiService = {
    async login(address, rawMessage, signedMessage) {
        var url = mercuryHost + address + '/login';
        var requestBody = {
            message: rawMessage,
            v: signedMessage.v, 
            r: signedMessage.r,
            s: signedMessage.s
        }
        await axios.post(url, requestBody)
            .then(async (res) => {
                store.dispatch(setJWT(res.data.accessToken));
                const events = await this.retrieveEvents(res.data.accessToken, address, 10);
                if (events) {
                    store.dispatch(setEventData(events.data));
                }
            }).catch(err => {
                store.dispatch(addError({
                    message: err
                }));
            });
    },

    async addEvent(accessToken, address, event) {
        var url = mercuryHost + address + '/events';
        await axios.post(url, event, {
            headers: {
                Authorization: 'Bearer ' + accessToken
            }
        }).catch(err => {
            store.dispatch(addError({
                message: err
            }));
        });
    },

    async retrieveEvents(accessToken, address, limit) {
        var url = mercuryHost + address + '/events/' + limit;
        return await axios.get(url, {
            headers: {
                Authorization: 'Bearer ' + accessToken
            }
        }).catch(err => {
            store.dispatch(addError({
                message: err
            }));
        });
    }
}
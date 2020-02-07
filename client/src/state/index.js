import store from './store/index';
import { loadUser } from './actions/index';

window.store = store;
window.loadUser = loadUser;
import React from 'react';
import ReactDOM, { render } from 'react-dom';

import { Provider } from 'react-redux';
import store from './state/store/index';
import index from './state/index';

import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

import './bootstrap-4.3.1-dist/css/bootstrap.min.css';

require('dotenv').config();

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();

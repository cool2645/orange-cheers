import honoka from 'honoka';
import React from 'react';
import ReactDOM from 'react-dom';

import App from './components/App';
import { site } from './config';
import registerServiceWorker from './registerServiceWorker';
import './styles/layout.css';
import './styles/main.css';

honoka.defaults.baseURL = site.apiEndpoint;
ReactDOM.render(<App/>, document.getElementById('root'));
registerServiceWorker();

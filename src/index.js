import React from 'react';
import ReactDOM from 'react-dom';
import './styles/layout.css';
import './styles/main.css'
import honoka from 'honoka'
import { site } from "./config";
import App from './components/App';
import registerServiceWorker from './registerServiceWorker';

honoka.defaults.baseURL = site.apiEndpoint;
ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();

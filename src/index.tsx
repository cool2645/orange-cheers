import honoka from 'honoka';
import React from 'react';
import ReactDOM from 'react-dom';
import { I18nextProvider } from 'react-i18next';

import App from './components/App';
import { site } from './config';
import i18n from './i18n';
import registerServiceWorker from './registerServiceWorker';
import './styles/layout.css';
import './styles/main.css';

honoka.defaults.baseURL = site.apiEndpoint;
ReactDOM.render(
  <I18nextProvider i18n={i18n}>
    <App />
  </I18nextProvider>,
  document.getElementById('root'));
registerServiceWorker();

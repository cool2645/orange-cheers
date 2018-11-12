import React, { Component } from 'react';
import { translate, InjectedTranslateProps } from 'react-i18next';
import { RouteProps } from 'react-router';

import '../styles/Loader.css';

import { MicrosoftLoader } from './Loader';

interface IRedirectProps extends InjectedTranslateProps, RouteProps {

}

class Redirect extends Component<IRedirectProps> {

  public componentDidMount() {
    // to avoid redirect too many times to fast
    setTimeout(() => {
      navigator.serviceWorker.getRegistration().then(reg => {
        if (reg) {
          reg.unregister().then(() => { location.reload(true); });
        } else {
          location.reload(true);
        }
      });
    }, 1000);
  }

  public render() {

    const { t } = this.props;

    return (
      <div className="container page">
        <div className="page-container">
          <div className="full-page-loader">
            {MicrosoftLoader}
            <h1>{t('redirect')}</h1>
          </div>
        </div>
      </div>
    );
  }
}

export default translate()(Redirect);

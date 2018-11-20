import React, { Component } from 'react';
import { translate, InjectedTranslateProps } from 'react-i18next';

import '../styles/Loader.css';

class NotFound extends Component<InjectedTranslateProps> {
  public render() {

    const { t } = this.props;
    document.title = t('notfound');

    return (
      <div className="container page">
        <div className="page-container">
          <div className="full-page-loader">
            <h1>{t('notfound')}</h1>
          </div>
        </div>
      </div>
    );
  }
}

export default translate()(NotFound);

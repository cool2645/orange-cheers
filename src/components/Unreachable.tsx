import React, { Component } from 'react';
import { translate, InjectedTranslateProps } from 'react-i18next';

interface IUnreachableProps extends InjectedTranslateProps {
  retry(): void;
}

class Unreachable extends Component<IUnreachableProps> {
  public render() {
    const { t } = this.props;
    const onRetry = (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      this.props.retry();
    };
    const retry = this.props.retry ?
      <a href="" onClick={onRetry}>{t('unreachable.retry')}</a> :
      <a href="">{t('unreachable.refresh')}</a>;

    return <h1>{t('unreachable.title')} {retry}</h1>;
  }
}

export default translate()(Unreachable);

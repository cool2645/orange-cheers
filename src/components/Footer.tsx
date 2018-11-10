import React, { Component } from 'react';
import { translate, InjectedTranslateProps } from 'react-i18next';

import { nav } from '../config';
import '../styles/Footer.css';

class Footer extends Component<InjectedTranslateProps, { top: boolean }> {

  constructor(props: InjectedTranslateProps) {
    super(props);
    this.state = {
      top: true,
    };
    window.addEventListener('scroll', () => {
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      if (scrollTop <= 100) {
        this.setState({ top: true });
      } else {
        this.setState({ top: false });
      }
    });
  }

  private scrollToTop = () => {
    let currentY = document.documentElement.scrollTop || document.body.scrollTop;
    const needScrollTop = 0 - currentY;
    setTimeout(() => {
      currentY += Math.ceil(needScrollTop / 10);
      window.scrollTo(0, currentY);
      if (needScrollTop > 10 || needScrollTop < -10) {
        this.scrollToTop();
      } else {
        window.scrollTo(0, 0);
      }
    }, 1);
  }

  public render() {
    const { t } = this.props;
    const arr = nav.footer.bottom
      .map((p, i) => <div className="item" key={i} dangerouslySetInnerHTML={{ __html: p }} />);
    arr.push(
      <div className="item" key="wordpress">{t('wordpress')}</div>,
      <div className="item" key="theme">
        {t('theme')} <a target="_blank" href="https://github.com/cool2645/orange-cheers">Orange Cheers</a>
      </div>
    );
    return (
      <footer className="page-footer orange">
        <div className="row responsive-container">
          {
            nav.footer.top.map((item, index) =>
              <div key={index} className="col">
                <h5>{item.title}</h5>
                {
                  item.contents
                    .map((p, i) => <p key={i} dangerouslySetInnerHTML={{ __html: p }} />)
                }
              </div>
            )
          }
        </div>
        <div className="footer-copyright">
          <div className="responsive-container">
            <div className="center">
              {arr}
            </div>
          </div>
        </div>
        <div className={`totop ${this.state.top ? 'hide' : ''}`} onClick={this.scrollToTop}>
          <i className="fa fa-angle-up" />
        </div>
      </footer>
    );
  }
}

export default translate('common')(Footer);

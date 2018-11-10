import React, { Component } from 'react';
import { translate, InjectedTranslateProps } from 'react-i18next';

import '../styles/Settings.css';
import themes from '../themes';

import { INavControlProps } from './Nav';

enum RefreshLevel {
  Always,
  Cache,
  Never,
}

interface IRefreshConfig {
  indexes: RefreshLevel;
  posts: RefreshLevel;
  categories: RefreshLevel;
  tags: RefreshLevel;
  commentCounts: RefreshLevel;
  siblings: RefreshLevel;
  comments: RefreshLevel;
}

const DefaultRefreshConfig = {
  indexes: RefreshLevel.Always,
  posts: RefreshLevel.Cache,
  categories: RefreshLevel.Cache,
  tags: RefreshLevel.Cache,
  commentCounts: RefreshLevel.Cache,
  siblings: RefreshLevel.Cache,
  comments: RefreshLevel.Always,
};

const RefreshSettings = {
  indexes: [RefreshLevel.Always, RefreshLevel.Cache],
  posts: [RefreshLevel.Always, RefreshLevel.Cache],
  categories: [RefreshLevel.Always, RefreshLevel.Cache],
  tags: [RefreshLevel.Always, RefreshLevel.Cache],
  commentCounts: [RefreshLevel.Always, RefreshLevel.Cache, RefreshLevel.Never],
  siblings: [RefreshLevel.Always, RefreshLevel.Cache, RefreshLevel.Never],
  comments: [RefreshLevel.Always, RefreshLevel.Never],
};

function initSettings() {
  if (!localStorage.theme) localStorage.theme = themes.default;
  document.body.className = localStorage.theme;
  document.querySelector('meta[name="theme-color"]').setAttribute('content', themes.themeColor[localStorage.theme]);
  if (!localStorage.refreshConfig) localStorage.refreshConfig = JSON.stringify(DefaultRefreshConfig);
}

interface ISettingsProps extends InjectedTranslateProps, INavControlProps {
}

interface ISettingsState {
  refreshConfig: IRefreshConfig;
  unclearable: boolean;
}

class Settings extends Component<ISettingsProps, ISettingsState> {

  constructor(props: ISettingsProps) {
    super(props);
    this.state = {
      refreshConfig: JSON.parse(localStorage.refreshConfig),
      unclearable: !(localStorage.indexes || localStorage.posts || localStorage.categories || localStorage.tags),
    };
  }

  public componentDidMount() {
    this.props.startProgress();
    this.setState({
      unclearable: !(localStorage.indexes || localStorage.posts || localStorage.categories || localStorage.tags),
    });
    if (document.readyState === 'complete') {
      this.props.doneProgress();
      return;
    }
    document.onreadystatechange = () => {
      if (document.readyState === 'complete') {
        this.props.doneProgress();
      }
    };
  }

  public componentWillUnmount() {
    document.onreadystatechange = null;
  }

  private setTheme = (theme: string) => {
    localStorage.theme = theme;
    document.body.className = theme;
    document.querySelector('meta[name="theme-color"]').setAttribute('content', themes.themeColor[theme]);
    this.forceUpdate();
  }

  private setRefreshConfig = (key: string, value: RefreshLevel) => {
    const refreshConfig = Object.assign({}, this.state.refreshConfig);
    refreshConfig[key] = value;
    this.setState({ refreshConfig });
    localStorage.refreshConfig = JSON.stringify(refreshConfig);
  }

  private clearCache = () => {
    localStorage.removeItem('indexes');
    localStorage.removeItem('posts');
    localStorage.removeItem('categories');
    localStorage.removeItem('tags');
    this.setState({
      unclearable: !(localStorage.indexes || localStorage.posts || localStorage.categories || localStorage.tags),
    });
  }

  public render() {
    const { t } = this.props;
    const clearCache = (e: React.MouseEvent<HTMLInputElement>) => {
      e.preventDefault();
      this.clearCache();
    };
    return (
      <div className="container page">
        <div className="page-container settings page-box">
          <div className="page-control">
            <h1>{t('theme.title')}</h1>
            <ul className="themes nf">
              {
                themes.themes.map(theme => {
                  const active = theme === localStorage.theme ? 'active' : '';
                  const setTheme = (e: React.MouseEvent<HTMLAnchorElement>) => {
                    e.preventDefault();
                    this.setTheme(theme);
                  };
                  return (<li key={theme} className={`${theme} ${active}`}>
                    <a href="" className="nf" onClick={setTheme}>
                      <div className="color" />
                      <div className="name">{t(`theme.${theme}`)}</div>
                    </a>
                  </li>);
                })
              }
            </ul>
          </div>
          <div className="page-control">
            <h1>{t('datasaving.title')}</h1>
            {
              Object.keys(RefreshSettings).map(key =>
                <div key={key}>
                  <h2>{t(`${key}.name`)}</h2>
                  <p>
                    {
                      RefreshSettings[key].filter((level: RefreshLevel) =>
                        level === this.state.refreshConfig[key]).map((level: RefreshLevel) => t(`${key}.${level}.prompt`))
                    }
                  </p>
                  <ul className="nf">
                    {
                      RefreshSettings[key].map((level: RefreshLevel) => {
                        const active = level === this.state.refreshConfig[key] ? 'active' : '';
                        const setRefreshConfig = (e: React.MouseEvent<HTMLAnchorElement>) => {
                          e.preventDefault();
                          this.setRefreshConfig(key, level);
                        };
                        return (<li key={level} className={active}>
                            <a href="" className="nf" onClick={setRefreshConfig}>
                              <div className="color" />
                              <div className="name">
                                {
                                  t(`${key}.${level}.level`)
                                }
                                {
                                  level === DefaultRefreshConfig[key] ? t('default') : ''
                                }
                              </div>
                            </a>
                          </li>
                        );
                      })
                    }
                  </ul>
                </div>
              )
            }
          </div>
          <div className="page-control">
            <h1>{t('clearcache.title')}</h1>
            <input type="button" disabled={this.state.unclearable} onClick={clearCache} value={t('clearcache.btn')} />
          </div>
        </div>
      </div>
    );
  }
}

export { RefreshLevel, IRefreshConfig, initSettings };
export default translate('settings')(Settings);

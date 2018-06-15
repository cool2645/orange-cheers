import React, { Component } from 'react';

import themes from '../themes';

import '../styles/Settings.css';

enum RefreshLevel {
  Always,
  Cache,
  Never,
}

const DefaultRefreshConfig = {
  indexes: RefreshLevel.Always,
  posts: RefreshLevel.Always,
  categories: RefreshLevel.Cache,
  tags: RefreshLevel.Cache,
  commentCounts: RefreshLevel.Cache,
  siblings: RefreshLevel.Cache,
  comments: RefreshLevel.Always,
};

const RefreshConfig = {
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
  if (!localStorage.refreshConfig) localStorage.refreshConfig = JSON.stringify(DefaultRefreshConfig);
}

interface ISettingsState {
  refreshConfig: { [key: string]: RefreshLevel };
}

class Settings extends Component<object, ISettingsState> {

  constructor(props: object) {
    super(props);
    this.state = {
      refreshConfig: JSON.parse(localStorage.refreshConfig),
    };
    this.setTheme = this.setTheme.bind(this);
  }

  private setTheme(theme: string) {
    localStorage.theme = theme;
    document.body.className = theme;
    this.forceUpdate();
  }

  private setRefreshConfig(key: string, value: RefreshLevel) {
    const refreshConfig = Object.assign({}, this.state.refreshConfig);
    refreshConfig[key] = value;
    this.setState({ refreshConfig });
    localStorage.refreshConfig = JSON.stringify(refreshConfig);
  }

  public render() {
    return (
      <div className="container page">
        <div className="page-container">
          <div className="page-control settings">
            <h2>主题</h2>
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
                      <div className="name">{theme}</div>
                    </a>
                  </li>);
                })
              }
            </ul>
          </div>
          <div className="page-control settings">
            <h2>流量节省</h2>
            {
              Object.keys(RefreshConfig).map(key =>
                <div key={key}>
                  <h3>{key}</h3>
                  <ul className="nf">
                    {
                      RefreshConfig[key].map((level: RefreshLevel) => {
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
                                  level === RefreshLevel.Always ? '总是刷新' :
                                    level === RefreshLevel.Cache ? '使用缓存' :
                                      '禁用'
                                }
                                {
                                  level === DefaultRefreshConfig[key] ? '（默认）' : ''
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
        </div>
      </div>
    );
  }
}

export { RefreshLevel, initSettings };
export default Settings;

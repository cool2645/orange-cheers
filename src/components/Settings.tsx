import React, { Component } from 'react';

import themes from '../themes';

import '../styles/Settings.css';

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
  indexes: [
    { level: RefreshLevel.Always, prompt: '拉取最新的文章列表数据。' },
    { level: RefreshLevel.Cache, prompt: '警告：将不会更新文章列表。' },
  ],
  posts: [
    { level: RefreshLevel.Always, prompt: '显示文章页面时重新拉取最新的文章数据。' },
    { level: RefreshLevel.Cache, prompt: '显示文章页面时不会拉取文章更新，文章将会在刷新文章列表时更新。' },
  ],
  categories: [
    { level: RefreshLevel.Always, prompt: '总是重新拉取分类数据。' },
    { level: RefreshLevel.Cache, prompt: '不更新已知分类数据。' },
  ],
  tags: [
    { level: RefreshLevel.Always, prompt: '总是重新拉取标签数据。' },
    { level: RefreshLevel.Cache, prompt: '不更新已知标签数据。' },
  ],
  commentCounts: [
    { level: RefreshLevel.Always, prompt: '总是重新拉取评论数。' },
    { level: RefreshLevel.Cache, prompt: '不更新已加载过的评论数。' },
    { level: RefreshLevel.Never, prompt: '不显示评论数。' },
  ],
  siblings: [
    { level: RefreshLevel.Always, prompt: '总是重新拉取相邻的文章。' },
    { level: RefreshLevel.Cache, prompt: '如果能够从缓存的文章列表中读取相邻的文章，则使用此数据。' },
    { level: RefreshLevel.Never, prompt: '不显示相邻的文章。' },
  ],
  comments: [
    { level: RefreshLevel.Always, prompt: '总是重新拉取文章评论。' },
    { level: RefreshLevel.Never, prompt: '不显示文章评论。' },
  ],
};

function initSettings() {
  if (!localStorage.theme) localStorage.theme = themes.default;
  document.body.className = localStorage.theme;
  if (!localStorage.refreshConfig) localStorage.refreshConfig = JSON.stringify(DefaultRefreshConfig);
}

interface ISettingsProps {
  startProgress(): void;

  joinProgress(): void;

  doneProgress(): void;
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
    this.setTheme = this.setTheme.bind(this);
    this.setRefreshConfig = this.setRefreshConfig.bind(this);
    this.clearCache = this.clearCache.bind(this);
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

  private clearCache() {
    localStorage.removeItem('indexes');
    localStorage.removeItem('posts');
    localStorage.removeItem('categories');
    localStorage.removeItem('tags');
    this.setState({
      unclearable: !(localStorage.indexes || localStorage.posts || localStorage.categories || localStorage.tags),
    });
  }

  public render() {
    const clearCache = (e: React.MouseEvent<HTMLInputElement>) => {
      e.preventDefault();
      this.clearCache();
    };
    return (
      <div className="container page">
        <div className="page-container settings page-box">
          <div className="page-control">
            <h1>主题</h1>
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
          <div className="page-control">
            <h1>流量节省</h1>
            {
              Object.keys(RefreshSettings).map(key =>
                <div key={key}>
                  <h2>{key}</h2>
                  <p>
                    {
                      RefreshSettings[key].filter((level: { level: RefreshLevel, prompt: string }) =>
                        level.level === this.state.refreshConfig[key]).map((level: { level: RefreshLevel, prompt: string }) => level.prompt)
                    }
                  </p>
                  <ul className="nf">
                    {
                      RefreshSettings[key].map((level: { level: RefreshLevel, prompt: string }) => {
                        const active = level.level === this.state.refreshConfig[key] ? 'active' : '';
                        const setRefreshConfig = (e: React.MouseEvent<HTMLAnchorElement>) => {
                          e.preventDefault();
                          this.setRefreshConfig(key, level.level);
                        };
                        return (<li key={level.level} className={active}>
                            <a href="" className="nf" onClick={setRefreshConfig}>
                              <div className="color" />
                              <div className="name">
                                {
                                  level.level === RefreshLevel.Always ? '总是刷新' :
                                    level.level === RefreshLevel.Cache ? '使用缓存' :
                                      '禁用'
                                }
                                {
                                  level.level === DefaultRefreshConfig[key] ? '（默认）' : ''
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
            <h1>清除所有缓存</h1>
            <input type="button" disabled={this.state.unclearable} onClick={clearCache} value="清空本地缓存" />
          </div>
        </div>
      </div>
    );
  }
}

export { RefreshLevel, IRefreshConfig, initSettings };
export default Settings;

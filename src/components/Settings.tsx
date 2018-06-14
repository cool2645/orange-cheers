import React, { Component } from 'react';

import themes from '../themes';

import '../styles/Settings.css';

class Settings extends Component {

  constructor(props: object) {
    super(props);
    this.setTheme = this.setTheme.bind(this);
  }

  private setTheme(theme: string) {
    localStorage.theme = theme;
    document.body.className = theme;
    this.forceUpdate();
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
          <div className="page-control">
            <h2>流量节省</h2>
          </div>
        </div>
      </div>
    );
  }
}

export default Settings;

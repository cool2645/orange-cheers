import React, { Component } from 'react';
import logo from '../icons/logo.svg';
import { BrowserRouter as Router, NavLink, Link } from 'react-router-dom'
import '../styles/Nav.css'

class Nav extends Component {
  render() {
    return (<div>
      <div id="inb"
           style={{ width: '100%', height: '8px', zIndex: 9999, top: '0px', float: 'left', position: 'absolute' }}>
        <div
          style={{
            backgroundColor: 'rgb(190, 219, 236)',
            width: '0px',
            height: '100%',
            clear: 'both',
            transition: 'height 0.28s',
            float: 'left'
          }}></div>
      </div>
      <div className="top">
        <Router>
          <div className="header container center">
            <div className="logo-container">
              <NavLink exact to="/">
                <img height="100%" src={logo} className="App-logo" alt="logo" />
              </NavLink>
            </div>
            <div className="top-menu">
              <ul>
                <li>
                  <NavLink activeClassName="active" to="/tech">技术</NavLink>
                </li>
                <li>
                  <NavLink activeClassName="active" to="/archives">归档</NavLink>
                </li>
                <li>
                  <NavLink activeClassName="active" to="/about">关于</NavLink>
                </li>
              </ul>
            </div>
            <div className="social">
              <div className="icon">
                <a href="" onClick={(e) => e.preventDefault()} title="搜索" className="fas fa-search"></a>
              </div>
              <div className="icon">
                <Link to="/rss" title="RSS" className="fas fa-rss"></Link>
              </div>
              <div className="icon">
                <a href="https://www.cool2645.com" target="_blank" rel="noopener noreferrer" title="2645 工作室"
                   className="fas fa-home"></a>
              </div>
              <div className="icon">
                <a href="" onClick={(e) => e.preventDefault()} title="主题" className="fas fa-paint-brush"></a>
              </div>
            </div>
          </div>
        </Router>
      </div>
    </div>)
  }
}

export default Nav
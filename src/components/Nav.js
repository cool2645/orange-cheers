import React, { Component } from 'react';
import { BrowserRouter as Router, NavLink, Link } from 'react-router-dom'
import '../styles/Nav.css'

class Nav extends Component {
  constructor() {
    super();
    this.state = {
      collapse: ""
    };
    document.onmousewheel = document.DOMMouseScroll = Nav.handleCollapse.bind(this)
  }
  static handleCollapse(e) {
    if (document.body.scrollTop === 0) {
      if ((e.wheelDelta && e.wheelDelta > 0) || (e.detail && e.detail < 0)) {
        this.setState({collapse: ""})
      } else {
        this.setState({collapse: "collapse"})
      }
    }
  }
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
            <div className={`logo-container ${this.state.collapse}`}>
              <NavLink exact to="/" activeClassName="active">
                <h1>2645 Laboratory</h1>
              </NavLink>
            </div>
            <div className={`nav-container ${this.state.collapse}`}>
              <div className="top-menu">
                <ul>
                  <li>
                    <NavLink className="collapse-show" activeClassName="active" to="/category/tech">技术</NavLink>
                  </li>
                  <li>
                    <NavLink className="collapse-hide" activeClassName="active" to="/category/tech/webdev">Web 開發</NavLink>
                  </li>
                  <li>
                    <NavLink className="collapse-hide" activeClassName="active" to="/category/tech/operation">運維</NavLink>
                  </li>
                  <li>
                    <NavLink className="collapse-hide" activeClassName="active" to="/category/tech/linux">Linux</NavLink>
                  </li>
                  <li>
                    <NavLink className="collapse-hide" activeClassName="active" to="/category/tech/desktopdev">桌面開發</NavLink>
                  </li>
                  <li>
                    <NavLink className="collapse-hide" activeClassName="active" to="/category/tech/algorithm">算法</NavLink>
                  </li>
                  <li>
                    <NavLink activeClassName="active" to="/archives">歸檔</NavLink>
                  </li>
                  <li>
                    <NavLink activeClassName="active" to="/about">關於</NavLink>
                  </li>
                </ul>
              </div>
              <div className="social">
                <div className="icon">
                  <a href="" onClick={(e) => e.preventDefault() } title="搜索" className="fas fa-search"></a>
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
          </div>
        </Router>
      </div>
    </div>)
  }
}

export default Nav
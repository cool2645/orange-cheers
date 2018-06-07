import React, { Component } from 'react';
import { BrowserRouter as Router, NavLink, Link } from 'react-router-dom'
import Typed from 'typed.js'
import Sidebar from 'react-sidebar';
import '../styles/Nav.css'

class Nav extends Component {
  constructor() {
    super();
    this.state = {
      collapse: "",
      sidebarOpen: false
    };
    this.onSetSidebarOpen = this.onSetSidebarOpen.bind(this);
    document.onmousewheel = this.handleCollapse.bind(this);
    document.addEventListener("DOMMouseScroll", this.handleCollapse.bind(this))
  }

  handleCollapse(e) {
    if (document.body.scrollTop === 0) {
      if ((e.wheelDelta && e.wheelDelta > 0) || (e.detail && e.detail < 0)) {
        if (this.state.collapse !== "") {
          this.setState({ collapse: "" });
          setTimeout(() => this.typed.reset(), 750);
        }
      } else {
        if (this.state.collapse !== "collapse") {
          this.setState({ collapse: "collapse" });
          setTimeout(() => this.typed.reset(), 750);
        }
      }
    }
  }

  onSetSidebarOpen(open) {
    this.setState({ sidebarOpen: open });
  }

  componentDidMount() {
    // You can pass other options here, such as typing speed, back speed, etc.
    const options = {
      strings: ["2645 Laboratory"],
      typeSpeed: 50,
      backSpeed: 50
    };
    // this.el refers to the <span> in the render() method
    this.typed = new Typed(this.el, options);
  }

  componentWillUnmount() {
    // Make sure to destroy Typed instance on unmounting
    // to prevent memory leaks
    this.typed.destroy();
  }

  render() {
    let sidebarContent = <div className="sidebar">
      <div className="sidebar-banner">
        <h2>
          (´・ω・`)
        </h2>
      </div>
      <div className="top-menu">
        <ul>
          <li>
            <NavLink activeClassName="active" onClick={() => this.onSetSidebarOpen(false)} to="/category/tech">技术</NavLink>
          </li>
          <li>
            <NavLink activeClassName="active" onClick={() => this.onSetSidebarOpen(false)} to="/category/tech/webdev">Web 開發</NavLink>
          </li>
          <li>
            <NavLink activeClassName="active" onClick={() => this.onSetSidebarOpen(false)} to="/category/tech/operation">運維</NavLink>
          </li>
          <li>
            <NavLink activeClassName="active" onClick={() => this.onSetSidebarOpen(false)} to="/category/tech/linux">Linux</NavLink>
          </li>
          <li>
            <NavLink activeClassName="active" onClick={() => this.onSetSidebarOpen(false)} to="/category/tech/desktopdev">桌面開發</NavLink>
          </li>
          <li>
            <NavLink activeClassName="active" onClick={() => this.onSetSidebarOpen(false)} to="/category/tech/algorithm">算法</NavLink>
          </li>
          <li>
            <NavLink activeClassName="active" onClick={() => this.onSetSidebarOpen(false)} to="/archives">歸檔</NavLink>
          </li>
          <li>
            <NavLink activeClassName="active" onClick={() => this.onSetSidebarOpen(false)} to="/about">關於</NavLink>
          </li>
        </ul>
      </div>
      <div className="social center">
        <div className="icon">
          <a href="" onClick={(e) => e.preventDefault()} title="搜索" className="fas fa-search"></a>
        </div>
        <div className="icon">
          <Link to="/rss" title="RSS" onClick={() => this.onSetSidebarOpen(false)} className="fas fa-rss"></Link>
        </div>
        <div className="icon">
          <a href="https://www.cool2645.com" target="_blank" rel="noopener noreferrer" title="2645 工作室"
             className="fas fa-home"></a>
        </div>
        <div className="icon">
          <a href="" onClick={(e) => e.preventDefault()} title="主题" className="fas fa-paint-brush"></a>
        </div>
      </div>
    </div>;
    let sidebarStyle = {
      root: {
        position: 'fixed',
      },
      sidebar: {
        zIndex: 999,
        width: '14.375rem'
      }
    };
    return (<div>
      <Router>
        <Sidebar styles={sidebarStyle} sidebar={sidebarContent}
                 open={this.state.sidebarOpen}
                 onSetOpen={this.onSetSidebarOpen}>
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
            <div className="top-banner"></div>
            <div className="header container center">
              <div className="mobile-show icon">
                <a href="" onClick={(e) => {
                  this.onSetSidebarOpen(true);
                  e.preventDefault()
                }} title="搜索" className="fas fa-bars"></a>
              </div>
              <div className={`logo-container ${this.state.collapse}`}>
                <NavLink exact to="/" activeClassName="active">
                  <h1><span
                    style={{ whiteSpace: 'pre' }}
                    ref={(el) => {
                      this.el = el;
                    }}
                  ></span></h1>
                </NavLink>
              </div>
              <div className={`nav-container ${this.state.collapse}`}>
                <div className="top-menu">
                  <ul>
                    <li className="collapse-show">
                      <NavLink activeClassName="active" to="/category/tech">技术</NavLink>
                    </li>
                    <li className="collapse-hide">
                      <NavLink activeClassName="active" to="/category/tech/webdev">Web 開發</NavLink>
                    </li>
                    <li className="collapse-hide">
                      <NavLink activeClassName="active" to="/category/tech/operation">運維</NavLink>
                    </li>
                    <li className="collapse-hide">
                      <NavLink activeClassName="active" to="/category/tech/linux">Linux</NavLink>
                    </li>
                    <li className="collapse-hide">
                      <NavLink activeClassName="active" to="/category/tech/desktopdev">桌面開發</NavLink>
                    </li>
                    <li className="collapse-hide">
                      <NavLink activeClassName="active" to="/category/tech/algorithm">算法</NavLink>
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
            </div>
          </div>
        </Sidebar>
      </Router>
    </div>)
  }
}

export default Nav
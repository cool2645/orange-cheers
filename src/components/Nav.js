import React, { Component } from 'react';
import { BrowserRouter as Router, NavLink } from 'react-router-dom'
import Typed from 'typed.js'
import Sidebar from 'react-sidebar';
import '../styles/Nav.css'
import { site, nav } from '../config'

class Nav extends Component {
  constructor() {
    super();
    this.state = {
      collapse: "",
      sidebarOpen: false
    };
    this.setSidebarOpen = this.setSidebarOpen.bind(this);
    this.retype = this.retype.bind(this);
    document.onmousewheel = this.handleCollapse.bind(this);
    document.addEventListener("DOMMouseScroll", this.handleCollapse.bind(this))
  }

  setSidebarOpen(open) {
    this.setState({ sidebarOpen: open });
  }

  retype(timeout) {
    // BUG: https://github.com/mattboldt/typed.js/issues/283
    console.log(this.typed.strings);
    timeout = timeout || 0;
    setTimeout(() => {
      this.typed.reset();
    }, timeout);
  }

  handleCollapse(e) {
    if (document.body.scrollTop === 0) {
      if ((e.wheelDelta && e.wheelDelta > 0) || (e.detail && e.detail < 0)) {
        if (this.state.collapse !== "") {
          this.setState({ collapse: "" });
          this.retype(750);
        }
      } else {
        if (this.state.collapse !== "collapse") {
          this.setState({ collapse: "collapse" });
          this.retype(750);
        }
      }
    }
  }

  componentDidMount() {
    // You can pass other options here, such as typing speed, back speed, etc.
    const options = {
      strings: [site.banner, site.title],
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

  renderLinks(on) {
    return nav.links.map((link) => {
      if ((on === 'sidebar' && link.hideInSidebar) ||
        (on === 'header' && link.hideInBanner && link.hideInHeader)
      ) return '';
      const className = on === 'header' ?
        link.hideInBanner ? ["collapse-show"] : link.hideInHeader ? ["collapse-hide"] : []
        : [];
      const internal = link.path && (link.path.charAt(0) === '/' || link.path.charAt(0) === '#');
      return internal ? (
        <li className={className} key={link.name}>
          <NavLink activeClassName="active" onClick={() => {
            if (on === 'sidebar') this.setSidebarOpen(false);
            if (link.typed) this.typed.strings = [link.typed, site.title];
          }} to={link.path}>{link.name}</NavLink>
        </li>
      ) : (
        <li key={link.name}>
          <a onClick={on === 'sidebar' ? () => this.setSidebarOpen(false) : null} href={link.path} target="_blank"
             rel="noopener noreferrer">{link.name}</a>
        </li>
      );
    });
  }

  renderIcons(on) {
    return nav.icons.map((icon) => {
      const internal = icon.path && (icon.path.charAt(0) === '/' || icon.path.charAt(0) === '#');
      return internal ? (
        <div className="icon" key={icon.icon}>
          <NavLink activeClassName="active" onClick={() => {
            if (on === 'sidebar') this.setSidebarOpen(false);
            if (icon.typed) this.typed.strings = [icon.typed, site.title];
          }} to={icon.path} title={icon.title} className={icon.icon}></NavLink>
        </div>
      ) : (
        <div className="icon" key={icon.icon}>
          <a onClick={on === 'sidebar' ? () => this.setSidebarOpen(false) : null} href={icon.path} title={icon.title}
             className={icon.icon} target="_blank" rel="noopener noreferrer"></a>
        </div>
      );
    });
  }

  render() {
    const progressbar = (
      <div id="inb"
           style={{
             width: '100%',
             height: '8px',
             zIndex: 9999,
             top: '0px',
             float: 'left',
             position: 'absolute'
           }}>
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
    );
    const sidebarLinks = this.renderLinks.bind(this)('sidebar');
    const sidebarIcons = this.renderIcons.bind(this)('sidebar');
    const headerLinks = this.renderLinks.bind(this)('header');
    const headerIcons = this.renderIcons.bind(this)('header');
    const sidebarContent = <div className="sidebar">
      <div className="sidebar-banner">
        <h2>
          {nav.sidebar.title}
        </h2>
      </div>
      <div className="top-menu">
        <ul>
          {sidebarLinks}
        </ul>
      </div>
      <div className="social center">
        {sidebarIcons}
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
                 onSetOpen={this.setSidebarOpen}>
          {progressbar}
          <div className="top">
            <div className="top-banner"></div>
            <div className="header container center">
              <div className="mobile-show icon">
                <a href="" onClick={(e) => {
                  this.setSidebarOpen(true);
                  e.preventDefault()
                }} title="菜单" className="fas fa-bars"></a>
              </div>
              <div className={`logo-container ${this.state.collapse}`}>
                <NavLink exact to="/" onClick={() => {
                  this.typed.strings = [site.banner, site.title];
                }} activeClassName="active">
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
                    {headerLinks}
                  </ul>
                </div>
                <div className="social">
                  {headerIcons}
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
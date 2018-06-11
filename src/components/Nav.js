import React, { Component } from 'react'
import { NavLink } from 'react-router-dom'
import Typed from 'typed.js'
import Sidebar from 'react-sidebar'
import '../styles/Nav.css'
import { site, nav } from '../config'

class Nav extends Component {
  constructor() {
    super();
    this.state = {
      collapse: "",
      animationLock: false,
      touchStartY: 0,
      sidebarOpen: false,
    };
    this.setSidebarOpen = this.setSidebarOpen.bind(this);
    this.retype = this.retype.bind(this);
    this.setTyped = this.setTyped.bind(this);
    this._onProgress = this._onProgress.bind(this);
    this.startProgress = this.startProgress.bind(this);
    this.joinProgress = this.joinProgress.bind(this);
    this.doneProgress = this.doneProgress.bind(this);
    document.ontouchstart = (e) => {
      this.setState({ touchStartY: e.touches[0].clientY })
    };
    document.onmousewheel = document.ontouchmove = document.onscroll = this.handleCollapse.bind(this);
    document.addEventListener("DOMMouseScroll", this.handleCollapse.bind(this));
    window.addEventListener('scroll', () => {
      if (this._progressing) return;
      let scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      let windowHeight = window.visualViewport.height || window.innerHeight;
      let documentHeight = document.body.clientHeight;
      let perc = 100 * scrollTop / (documentHeight - windowHeight);
      let inb = document.getElementById('inb');
      inb.style.height = '100%';
      inb.style.width = perc > 100 ? 100 : perc + '%';
    });
    setInterval(this.retype, 15000)
  }

  setSidebarOpen(open) {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'auto';
    this.setState({ sidebarOpen: open });
  }

  retype(timeout) {
    // BUG: https://github.com/mattboldt/typed.js/issues/283
    timeout = timeout || 0;
    setTimeout(() => {
      this.typed.reset();
    }, timeout);
  }

  setTyped(text) {
    if (this.typed) {
      this.typed.strings = [text, site.title];
      this.retype(0);
    }
  }

  handleCollapse(e) {
    let scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    if ((e.wheelDelta && e.wheelDelta > 0) || (e.detail && e.detail < 0) || (e.changedTouches && e.changedTouches[0].clientY > this.state.touchStartY)) {
      if (scrollTop === 0 && window.matchMedia("(min-width: 865px)").matches && this.state.collapse !== "") {
        this.setState({ collapse: "" });
        this.retype(750);
      }
    } else {
      if (this.state.animationLock) {
        if (e.cancelable) e.preventDefault();
        return;
      }
      if (window.matchMedia("(min-width: 865px)").matches && this.state.collapse !== "collapse") {
        this.setState({ collapse: "collapse", animationLock: true });
        this.retype(750);
        setTimeout(() => {
          this.setState({ animationLock: false });
          if (typeof window.onscroll === 'function') window.onscroll(e);
        }, 750);
        if (e.cancelable) e.preventDefault();
      }
    }
    if (e.changedTouches) this.setState({ touchStartY: e.changedTouches[0].clientY })
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
    this.startProgress();
  }

  componentWillUnmount() {
    // Make sure to destroy Typed instance on unmounting
    // to prevent memory leaks
    this.typed.destroy();
  }

  renderLinks(on) {
    return nav.links.map(link => {
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
            if (link.typed) this.setTyped(link.typed);
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
    return nav.icons.map(icon => {
      const internal = icon.path && (icon.path.charAt(0) === '/' || icon.path.charAt(0) === '#');
      return internal ? (
        <div className="icon" key={icon.icon}>
          <NavLink activeClassName="active" onClick={() => {
            if (on === 'sidebar') this.setSidebarOpen(false);
            if (icon.typed) this.setTyped(icon.typed);
          }} to={icon.path} title={icon.title} className={icon.icon} />
        </div>
      ) : (
        <div className="icon" key={icon.icon}>
          <a onClick={on === 'sidebar' ? () => this.setSidebarOpen(false) : null} href={icon.path} title={icon.title}
             className={icon.icon} target="_blank" rel="noopener noreferrer" />
        </div>
      );
    });
  }

  _onProgress() {
    let inb = document.getElementById('inb');
    let step = (Math.random() > 0.7) * 5;
    if (this._progress + step > 98) return;
    else if (this._progress + step > 90) step = 0.1;
    this._progress += step;
    inb.style.width = this._progress + '%';
  }

  joinProgress() {
    let inb = document.getElementById('inb');
    let step = Math.random() * 10 + 20;
    if (this._progress >= 90) return;
    else if (this._progress + step > 90) this._progress = 90;
    else this._progress += step;
    inb.style.width = this._progress + '%';
  }

  doneProgress() {
    if (!this._progressing) return;
    let inb = document.getElementById('inb');
    this._progress = 100;
    clearInterval(this._progressing);
    this._progressing = null;
    inb.style.width = '100%';
    setTimeout(() => inb.style.height = '0', 500);
  }

  startProgress() {
    if (this._progressing) return;
    let inb = document.getElementById('inb');
    inb.style.width = 0;
    inb.style.height = '100%';
    this._progress = 0;
    this._progressing = setInterval(this._onProgress, 200);
  }

  render() {
    const progressbar = (
      <div className="progressbar">
        <div id="inb" className="bar" />
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
      <div className="social nf center">
        {sidebarIcons}
      </div>
    </div>;
    return (<div className="top-container">
      <Sidebar rootClassName="side-root" sidebarClassName="side-side fix-mobile"
               overlayClassName="fix-mobile" contentClassName="out-sidebar-content"
               sidebar={sidebarContent} open={this.state.sidebarOpen} onSetOpen={this.setSidebarOpen}>
        {progressbar}
        <div className="top">
          <div className="top-banner" />
          <div className="header nf container">
            <div className="mobile-show icon">
              <a href="" onClick={(e) => {
                this.setSidebarOpen(true);
                e.preventDefault()
              }} title="菜单" className="fas fa-bars" />
            </div>
            <div className={`logo-container ${this.state.collapse}`}>
              <NavLink exact to="/" onClick={() => {
                this.setTyped(site.banner);
              }} activeClassName="active">
                <h1><span
                  style={{ whiteSpace: 'pre' }}
                  ref={(el) => {
                    this.el = el;
                  }}
                /></h1>
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
    </div>)
  }
}

export default Nav
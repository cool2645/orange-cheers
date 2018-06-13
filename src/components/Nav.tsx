import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import Sidebar from 'react-sidebar';
import Typed from 'typed.js';

import { nav, site } from '../config';
import '../styles/Nav.css';

interface INavProps {
  ref: React.RefObject<Nav>;
}

enum Collapse {
  true = 'collapse',
  false = '',
}

enum NavHolder {
  Header,
  Sidebar,
}

interface INavStates {
  collapse: Collapse;
  animationLock: boolean;
  touchStartY: number;
  sidebarOpen: boolean;
}

class Nav extends Component<INavProps, INavStates> {

  private progress: number;
  private progressing: null | number;
  private typed: Typed;
  private el: HTMLElement;

  constructor(props: INavProps) {
    super(props);
    this.state = {
      collapse: Collapse.false,
      animationLock: false,
      touchStartY: 0,
      sidebarOpen: false,
    };
    this.setSidebarOpen = this.setSidebarOpen.bind(this);
    this.retype = this.retype.bind(this);
    this.setTyped = this.setTyped.bind(this);
    this.onProgress = this.onProgress.bind(this);
    this.startProgress = this.startProgress.bind(this);
    this.joinProgress = this.joinProgress.bind(this);
    this.doneProgress = this.doneProgress.bind(this);
    document.ontouchstart = (e) => {
      this.setState({ touchStartY: e.touches[0].clientY });
    };
    document.onmousewheel = document.ontouchmove = document.onscroll = this.handleCollapse.bind(this);
    document.addEventListener('DOMMouseScroll', this.handleCollapse.bind(this));
    window.addEventListener('scroll', () => {
      if (this.progressing) return;
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      const windowHeight = (window as any).visualViewport ? (window as any).visualViewport.height : window.innerHeight;
      const documentHeight = document.body.clientHeight;
      const perc = 100 * scrollTop / (documentHeight - windowHeight);
      const inb = document.getElementById('inb');
      if (inb) inb.style.height = '100%';
      if (inb) inb.style.width = perc > 100 ? '100%' : perc + '%';
    });
    setInterval(this.retype, 15000);
  }

  public setTyped(text: string) {
    if (this.typed) {
      this.typed.strings = [text, site.title];
      this.retype(0);
    }
  }

  public componentDidMount() {
    const options = {
      strings: [site.banner, site.title],
      typeSpeed: 50,
      backSpeed: 50,
    };
    this.typed = new Typed(this.el, options);
    this.startProgress();
  }

  public componentWillUnmount() {
    this.typed.destroy();
  }

  public joinProgress() {
    const inb = document.getElementById('inb');
    const step = Math.random() * 10 + 20;
    if (this.progress >= 90) return;
    else if (this.progress + step > 90) this.progress = 90;
    else this.progress += step;
    if (inb) inb.style.width = this.progress + '%';
  }

  public doneProgress() {
    if (!this.progressing) return;
    const inb = document.getElementById('inb');
    this.progress = 100;
    clearInterval(this.progressing);
    if (inb) inb.style.width = '100%';
    setTimeout(() => {
      if (inb) inb.style.height = '0';
      this.progressing = null;
    }, 500);
  }

  public startProgress() {
    if (this.progressing) return;
    const inb = document.getElementById('inb');
    if (inb) inb.style.width = '0';
    if (inb) inb.style.height = '100%';
    this.progress = 0;
    this.progressing = window.setInterval(this.onProgress, 200);
  }

  private onProgress() {
    const inb = document.getElementById('inb');
    let step = +(Math.random() > 0.7) * 5;
    if (this.progress + step > 98) return;
    else if (this.progress + step > 90) step = 0.1;
    this.progress += step;
    if (inb) inb.style.width = this.progress + '%';
  }

  private retype(timeout: number) {
    // BUG: https://github.com/mattboldt/typed.js/issues/283
    timeout = timeout || 0;
    setTimeout(() => {
      this.typed.reset();
    }, timeout);
  }

  private setSidebarOpen(open: boolean) {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'auto';
    this.setState({ sidebarOpen: open });
  }

  private handleCollapse(e: WheelEvent & TouchEvent) {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    if ((e.wheelDelta && e.wheelDelta > 0) || (e.detail && e.detail < 0) || (e.changedTouches && e.changedTouches[0].clientY > this.state.touchStartY)) {
      if (scrollTop === 0 && window.matchMedia('(min-width: 865px)').matches && this.state.collapse !== Collapse.false) {
        this.setState({ collapse: Collapse.false });
        this.retype(750);
      }
    } else {
      if (this.state.animationLock) {
        if (e.cancelable) e.preventDefault();
        return;
      }
      if (window.matchMedia('(min-width: 865px)').matches && this.state.collapse !== Collapse.true) {
        this.setState({ collapse: Collapse.true, animationLock: true });
        this.retype(750);
        setTimeout(() => {
          this.setState({ animationLock: false });
          if (typeof window.onscroll === 'function') window.onscroll(e);
        }, 750);
        if (e.cancelable) e.preventDefault();
      }
    }
    if (e.changedTouches) this.setState({ touchStartY: e.changedTouches[0].clientY });
  }

  private renderLinks(on: NavHolder) {
    return nav.links.map(link => {
      if ((on === NavHolder.Sidebar && link.hideInSidebar) ||
        (on === NavHolder.Sidebar && link.hideInBanner && link.hideInHeader)
      ) return '';
      const className = on === NavHolder.Header ?
        link.hideInBanner ? 'collapse-show' : link.hideInHeader ? 'collapse-hide' : ''
        : '';
      const internal = link.path && (link.path.charAt(0) === '/' || link.path.charAt(0) === '#');
      const navigateInternalLink = () => {
        if (on === NavHolder.Sidebar) this.setSidebarOpen(false);
        if (link.typed) this.setTyped(link.typed);
      };
      const navigateExternalLink = () => {
        if (on === NavHolder.Sidebar) this.setSidebarOpen(false);
      };
      return internal ? (
        <li className={className} key={link.name}>
          <NavLink activeClassName="active" onClick={navigateInternalLink} to={link.path}>{link.name}</NavLink>
        </li>
      ) : (
        <li key={link.name}>
          <a onClick={navigateExternalLink} href={link.path} target="_blank"
             rel="noopener noreferrer">{link.name}</a>
        </li>
      );
    });
  }

  private renderIcons(on: NavHolder) {
    return nav.icons.map(icon => {
      const internal = icon.path && (icon.path.charAt(0) === '/' || icon.path.charAt(0) === '#');
      const navigateInternalLink = () => {
        if (on === NavHolder.Sidebar) this.setSidebarOpen(false);
        if (icon.typed) this.setTyped(icon.typed);
      };
      const navigateExternalLink = () => {
        if (on === NavHolder.Sidebar) this.setSidebarOpen(false);
      };
      return internal ? (
        <div className="icon" key={icon.icon}>
          <NavLink activeClassName="active" onClick={navigateInternalLink} to={icon.path} title={icon.title}
                   className={icon.icon} />
        </div>
      ) : (
        <div className="icon" key={icon.icon}>
          <a onClick={navigateExternalLink} href={icon.path} title={icon.title}
             className={icon.icon} target="_blank" rel="noopener noreferrer" />
        </div>
      );
    });
  }

  public render() {
    const progressbar = (
      <div className="progressbar">
        <div id="inb" className="bar" />
      </div>
    );
    const sidebarLinks = this.renderLinks.bind(this)(NavHolder.Sidebar);
    const sidebarIcons = this.renderIcons.bind(this)(NavHolder.Sidebar);
    const headerLinks = this.renderLinks.bind(this)(NavHolder.Header);
    const headerIcons = this.renderIcons.bind(this)(NavHolder.Header);
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
    const openSidebar = (e: React.MouseEvent<HTMLAnchorElement>) => {
      this.setSidebarOpen(true);
      e.preventDefault();
    };
    const setDefaultTyped = () => this.setTyped(site.banner);
    return (<div className="top-container">
      <Sidebar rootClassName="side-root" sidebarClassName="side-side fix-mobile"
               overlayClassName="fix-mobile" contentClassName="out-sidebar-content"
               sidebar={sidebarContent} open={this.state.sidebarOpen} onSetOpen={this.setSidebarOpen}>
        {progressbar}
        <div className="top">
          <div className="top-banner" />
          <div className="header nf container">
            <div className="mobile-show icon">
              <a href="" onClick={openSidebar} title="菜单" className="fas fa-bars" />
            </div>
            <div className={`logo-container ${this.state.collapse}`}>
              <NavLink exact={true} to="/" onClick={setDefaultTyped} activeClassName="active">
                <h1><span
                  style={{ whiteSpace: 'pre' }}
                  ref={el => {
                    if (el) this.el = el;
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
    </div>);
  }
}

export default Nav;

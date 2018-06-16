import React, { Component, ComponentClass } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import '../styles/App.css';
import '../styles/themes/aoi-no-shinwa.css';
import '../styles/themes/ice-blue-no-shunkan.css';
import '../styles/themes/junpaku-romance.css';
import '../styles/themes/momoiro-egao.css';
import '../styles/themes/orange-cheers.css';
import '../styles/themes/ring-a-yellow-bell.css';
import '../styles/themes/scarlet-princess.css';
import '../styles/themes/violet-moon.css';
import '../styles/themes/wakakusa-no-season.css';

import Archives from './Archives';
import Index from './Index';
import Nav from './Nav';
import NotFound from './NotFound';
import Post from './Post';
import withPost from './PostHelper';
import Settings, { initSettings } from './Settings';

class App extends Component {

  private readonly nav: React.RefObject<Nav>;

  constructor(props: object) {
    super(props);
    this.nav = React.createRef();
    this.setTyped = this.setTyped.bind(this);
    this.startProgress = this.startProgress.bind(this);
    this.joinProgress = this.joinProgress.bind(this);
    this.doneProgress = this.doneProgress.bind(this);
    this.renderArchives = this.renderArchives.bind(this);
    this.renderIndex = this.renderIndex.bind(this);
    this.renderPost = this.renderPost.bind(this);
    this.renderSettings = this.renderSettings.bind(this);
    this.renderComponent = this.renderComponent.bind(this);
    this.renderComponentWithPost = this.renderComponentWithPost.bind(this);
    initSettings();
  }

  public setTyped(text: string) {
    if (this.nav.current) this.nav.current.setTyped(text);
  }

  public startProgress() {
    if (this.nav.current) this.nav.current.startProgress();
  }

  public joinProgress() {
    if (this.nav.current) this.nav.current.joinProgress();
  }

  public doneProgress() {
    if (this.nav.current) this.nav.current.doneProgress();
  }

  private renderIndex(props: object) {
    return this.renderComponent(Index, props);
  }

  private renderPost(props: object) {
    return this.renderComponentWithPost(Post, props);
  }

  private renderArchives(props: object) {
    return this.renderComponent(Archives, props);
  }

  private renderSettings(props: object) {
    return this.renderComponent(Settings, props);
  }

  private renderComponent(Comp: ComponentClass<any>, props: object) {
    return <Comp {...props}
                 setTyped={this.setTyped}
                 startProgress={this.startProgress}
                 joinProgress={this.joinProgress}
                 doneProgress={this.doneProgress}
    />;
  }

  private renderComponentWithPost(Comp: ComponentClass<any>, props: object) {
    const WithPostComp = withPost<any>(Comp);
    return (<WithPostComp {...props}
                 setTyped={this.setTyped}
                 startProgress={this.startProgress}
                 joinProgress={this.joinProgress}
                 doneProgress={this.doneProgress}
    />);
  }

  public render() {
    return (
      <Router basename={process.env.PUBLIC_URL}>
        <div className="app">
          <Nav ref={this.nav} />
          <Switch>
            <Route exact={true} path="/" render={this.renderIndex} />
            <Route exact={true} path="/archives" render={this.renderArchives} />
            <Route exact={true} path="/settings" render={this.renderSettings} />
            <Route exact={true} path="/page/:page" render={this.renderIndex} />
            <Route exact={true} path="/category/:category" render={this.renderIndex} />} />
            <Route exact={true} path="/category/:category/page/:page"
                   render={this.renderIndex} />
            <Route exact={true} path="/tag/:tag" render={this.renderIndex} />
            <Route exact={true} path="/tag/:tag/page/:page" render={this.renderIndex} />
            <Route exact={true} path="/:slug" render={this.renderPost} />
            <Route component={NotFound} />
          </Switch>
        </div>
      </Router>
    );
  }

}

export default App;

import React, { Component, ComponentClass } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import '../styles/App.css';
import '../styles/themes/orange-cheers.css';

import Nav from './Nav';
import NotFound from './NotFound';
import Post from './Post';

class App extends Component {

  private readonly nav: React.RefObject<Nav>;

  constructor(props: object) {
    super(props);
    this.nav = React.createRef();
    this.setTyped = this.setTyped.bind(this);
    this.startProgress = this.startProgress.bind(this);
    this.joinProgress = this.joinProgress.bind(this);
    this.doneProgress = this.doneProgress.bind(this);
    this.renderPost = this.renderPost.bind(this);
    this.renderComponent = this.renderComponent.bind(this);
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

  private renderPost(props: object) {
    return this.renderComponent(Post, props);
  }

  private renderComponent(Comp: ComponentClass<any>, props: object) {
    return <Comp {...props}
                 setTyped={this.setTyped}
                 startProgress={this.startProgress}
                 joinProgress={this.joinProgress}
                 doneProgress={this.doneProgress}
    />;
  }

  public render() {
    return (
      <Router basename={process.env.PUBLIC_URL}>
        <div className="App orange-cheers">
          <Nav ref={this.nav} />
          <Switch>
            <Route exact={true} path="/" render={this.renderPost} />
            <Route exact={true} path="/page/:page" render={this.renderPost} />
            <Route exact={true} path="/category/:category" render={this.renderPost} />} />
            <Route exact={true} path="/category/:category/page/:page"
                   render={this.renderPost} />
            <Route exact={true} path="/tag/:tag" render={this.renderPost} />
            <Route exact={true} path="/tag/:tag/page/:page" render={this.renderPost} />
            <Route exact={true} path="/:slug" render={this.renderPost} />
            <Route component={NotFound} />
          </Switch>
        </div>
      </Router>
    );
  }

}

export default App;

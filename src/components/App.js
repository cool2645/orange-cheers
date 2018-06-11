import React, { Component } from 'react'
import '../styles/App.css'
import '../styles/themes/orange-cheers.css'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import Nav from "./Nav"
import NotFound from './404'
import Home from './Home'
import Post from './Post'

class App extends Component {

  constructor() {
    super();
    this.nav = React.createRef();
    this.setTyped = this.setTyped.bind(this);
    this.startProgress = this.startProgress.bind(this);
    this.joinProgress = this.joinProgress.bind(this);
    this.doneProgress = this.doneProgress.bind(this);
  }

  setTyped(text) {
    if (this.nav.current) this.nav.current.setTyped(text);
  }
  startProgress() {
    if (this.nav.current) this.nav.current.startProgress();
  }
  joinProgress() {
    if (this.nav.current) this.nav.current.joinProgress();
  }
  doneProgress() {
    if (this.nav.current) this.nav.current.doneProgress();
  }
  renderComponent(Comp, props) {
    return <Comp {...props}
                 setTyped={this.setTyped}
                 startProgress={this.startProgress}
                 joinProgress={this.joinProgress}
                 doneProgress={this.doneProgress}
    />
  }

  render() {
    return (
      <Router basename={process.env.PUBLIC_URL}>
        <div className="App orange-cheers">
          <Nav ref={this.nav} />
          <Switch>
            <Route exact path="/" render={(props) => this.renderComponent(Post, props)} />
            <Route exact path="/page/:page" render={(props) => this.renderComponent(Post, props)} />
            <Route exact path="/category/:category" render={(props) => this.renderComponent(Post, props)} />} />
            <Route exact path="/category/:category/page/:page" render={(props) => this.renderComponent(Post, props)} />
            <Route exact path="/tag/:tag" render={(props) => this.renderComponent(Post, props)} />
            <Route exact path="/tag/:tag/page/:page" render={(props) => this.renderComponent(Post, props)} />
            <Route exact path="/:slug" render={(props) => this.renderComponent(Post, props)} />
            <Route component={NotFound} />
          </Switch>
        </div>
      </Router>
    );
  }
}

export default App;

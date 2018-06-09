import React, { Component } from 'react'
import '../styles/App.css'
import '../styles/themes/orange-cheers.css'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import Nav from "./Nav"
import _404 from './404'
import Home from './Home'
import Post from './Post'

class App extends Component {
  render() {
    return (
      <Router>
        <div className="App orange-cheers">
          <Nav />
          <Switch>
            <Route exact path="/" component={Home} />
            <Route exact path="/:slug" component={Post} />
            <Route component={_404} />
          </Switch>
        </div>
      </Router>
    );
  }
}

export default App;

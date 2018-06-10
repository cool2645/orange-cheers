import React, { Component } from 'react'
import '../styles/App.css'
import '../styles/themes/orange-cheers.css'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import Nav from "./Nav"
import NotFound from './404'
import Home from './Home'
import Post from './Post'

class App extends Component {
  render() {
    return (
      <Router basename={process.env.PUBLIC_URL}>
        <div className="App orange-cheers">
          <Nav />
          <Switch>
            <Route exact path="/" component={Home} />
            <Route exact path="/:slug" component={Post} />
            <Route component={NotFound} />
          </Switch>
        </div>
      </Router>
    );
  }
}

export default App;

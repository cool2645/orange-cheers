import React, { Component } from 'react';
import logo from '../icons/logo.svg';
import '../styles/App.css';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import Home from './Home'
import Nav from "./Nav";

class App extends Component {
  render() {
    return (
      <div className="App">
        <Nav />
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <Router>
          <Switch>
            <Route exact path="/" component={Home} />
            <Route path="/about" component={Home} />
            <Route path="/topics" component={Home} />
          </Switch>
        </Router>
        <p className="App-intro">

          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
      </div>
    );
  }
}

export default App;

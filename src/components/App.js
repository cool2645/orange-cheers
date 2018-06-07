import React, { Component } from 'react';
import '../styles/App.css';
import '../styles/themes/orange-cheers.css'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import Home from './Home'
import Nav from "./Nav";

class App extends Component {
  render() {
    return (
      <div className="App orange-cheers">
        <Nav />
        <Router>
          <Switch>
            <Route exact path="/" component={Home} />
            <Route path="/404" component={Home} />
          </Switch>
        </Router>
      </div>
    );
  }
}

export default App;

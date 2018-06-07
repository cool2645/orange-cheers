import React, { Component } from 'react';
import { BrowserRouter as Router, NavLink } from 'react-router-dom'

class Nav extends Component {
  render() {
    return (<div>
      <Router>
        <div>
          <ul>
            <li>
              <NavLink to="/">Home</NavLink>
            </li>
            <li>
              <NavLink to="/about">About</NavLink>
            </li>
            <li>
              <NavLink to="/topics">Topics</NavLink>
            </li>
          </ul>
        </div>
      </Router>
    </div>)
  }
}

export default Nav
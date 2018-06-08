import React, { Component } from 'react';
import '../styles/App.css';
import '../styles/themes/orange-cheers.css'

const NotFound = <h1>404 Not Found</h1>;

class _404 extends Component {
  render() {
    return NotFound;
  }
}

export { NotFound, _404 };

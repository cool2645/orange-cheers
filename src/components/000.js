import React, { Component } from 'react'
import '../styles/App.css'
import '../styles/themes/orange-cheers.css'

class _000 extends Component {
  render() {
    let retry = this.props.retry ?
      <a href="" onClick={(e) => {
        e.preventDefault();
        this.props.retry();
      }}>Retry</a> :
      <a href="">Refresh</a>;

    return <h1>000 Unreachable {retry}</h1>;
  }
}

export default _000

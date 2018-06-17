import React, { Component } from 'react';

import '../styles/Loader.css';

class NotFound extends Component {
  public render() {
    return  (
      <div className="container page">
        <div className="page-container">
          <div className="full-page-loader">
            <h1>404 Not Found</h1>
          </div>
        </div>
      </div>
    );
  }
}

export default NotFound;

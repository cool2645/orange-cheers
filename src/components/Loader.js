import React from 'react';
import Loading from '../images/loading'
import '../styles/Loader.css'

const spinnerStyle = {
  backgroundImage: Loading
};

export default (
  <div className="loader">
    <div className="spinner" style={spinnerStyle} />
    <h1>载入中...</h1>
  </div>
)
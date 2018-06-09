import React from 'react';
import Loading from '../images/loading'
import '../styles/Loader.css'

const spinnerStyle = {
  backgroundImage: Loading
};

const FullPageLoader = (
  <div className="full-page-loader">
    <div className="spinner" style={spinnerStyle} />
    <h1>载入中...</h1>
  </div>
);

const ClassicalLoader = (
  <div className="classical-loader">
    <div className="spinner-container container1">
      <div className="circle1" />
      <div className="circle2" />
      <div className="circle3" />
      <div className="circle4" />
    </div>
    <div className="spinner-container container2">
      <div className="circle1" />
      <div className="circle2" />
      <div className="circle3" />
      <div className="circle4" />
    </div>
    <div className="spinner-container container3">
      <div className="circle1" />
      <div className="circle2" />
      <div className="circle3" />
      <div className="circle4" />
    </div>
  </div>
);

export { FullPageLoader, ClassicalLoader }

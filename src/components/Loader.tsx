import React from 'react';

import '../styles/Loader.css';

const FullPageLoader = (
  <div className="full-page-loader">
    <div className="lds-css ng-scope">
      <div className="lds-pacman">
        <div>
          <div />
          <div />
          <div />
        </div>
        <div>
          <div />
          <div />
        </div>
      </div>
    </div>
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

const InlineLoader = (
  <div className="inline-loader">
    <div className="loader-inner ball-clip-rotate">
      <div />
    </div>
  </div>
);

export { FullPageLoader, ClassicalLoader, InlineLoader };

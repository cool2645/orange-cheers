import React, { Component } from 'react';
import '../styles/Post.css'
import '../styles/themes/orange-cheers.css'
import { Link } from 'react-router-dom'
import Loader from './Loader'

class Post extends Component {
  render() {
    return (
      <div className="container page">
        <div className="post loading">
          {Loader}
        </div>
      </div>
    );
  }
}

export default Post;
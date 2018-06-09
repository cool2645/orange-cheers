import React, { Component } from 'react';
import '../styles/Comments.css'
import '../styles/themes/orange-cheers.css'
import { Link } from 'react-router-dom'

class CommentSender extends Component {
  render() {
    return (
      <div className="comment-box page-control">
        <div className="comment-send">
          <textarea name="text" id="textarea" cols="100%" rows="10" tabIndex="4"
                      placeholder="把你变成小鸟的点心 (・8・)"></textarea>
          <div className="author-info nf">
            <input type="text" name="author" id="author" value="" placeholder="昵称" size="22" tabIndex="1"
                   aria-required="true" />
            <input type="text" name="mail" id="mail" value="" placeholder="邮箱" size="22" tabIndex="2" />
            <input type="text" name="url" id="url" value="" placeholder="网址" size="22" tabIndex="3" />
            <input name="submit" className="btn" type="button" id="submit" tabIndex="5" value="发射=A=" />
          </div>
        </div>
      </div>
    );
  }
}

class Comments extends Component {
  render() {
    return (
      <div className="page-container">
        <CommentSender />
        <div className="comments">
        </div>
      </div>
    );
  }
}

export default Comments

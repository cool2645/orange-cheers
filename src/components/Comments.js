import React, { Component } from 'react';
import '../styles/Comments.css'
import '../styles/themes/orange-cheers.css'
import { ClassicalLoader as Loader } from './Loader'
import { Link } from 'react-router-dom'

class CommentSender extends Component {
  render() {
    return (
      <div className="comment-box">
        <div className="comment-send">
          <textarea name="text" id="textarea" cols="100%" rows="10" tabIndex="4"
                    placeholder="把你变成小鸟的点心 (・8・)"></textarea>
          <div className="author-info nf">
            <input type="text" name="author" id="author" value="" placeholder="昵称" size="22" tabIndex="1"
                   aria-required="true" />
            <input type="text" name="mail" id="mail" value="" placeholder="邮箱" size="22" tabIndex="2" />
            <input type="text" name="url" id="url" value="" placeholder="网址" size="22" tabIndex="3" />
            { this.props.replyId ?
              <input name="submit" className="btn reply-btn" type="button" tabIndex="5" value="取消" /> : ''
            }
            <input name="submit" className={ this.props.replyId ? 'btn reply-btn' : 'btn' } type="button" tabIndex="5" value="发射=A=" />
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
        <h1 className="title fee page-control">
          以下是评论惹(´Д｀)
        </h1>
        <div className="comments page-control">
          <CommentSender />
          <div className="comment nf">
            <div className="avatar-control">
              <img className="avatar"
                   src="https://secure.gravatar.com/avatar/06bd7a0d2a6c1d0dc78758ecb0a99b88?s=100&r=G&d=https://kotori.love/usr/themes/default/assets/img/default-avatar.jpg" />
            </div>
            <div className="comment-control">
              空樱酱 twitter 的ラブライブ pixiv bot 怎么啦 好久不见它了 (•̥́ ˍ •̀ू)
              <div className="comment-author">
                <a href="#" className="username">梨子</a>
                <span>学院生</span>
                <label>1 年前</label>
                <a href="">回复</a>
              </div>
            </div>
            <CommentSender />
          </div>
          <div className="comment reply nf">
            <div className="avatar-control">
              <img className="avatar"
                   src="https://secure.gravatar.com/avatar/06bd7a0d2a6c1d0dc78758ecb0a99b88?s=100&r=G&d=https://kotori.love/usr/themes/default/assets/img/default-avatar.jpg" />
            </div>
            <div className="comment-control">
              空樱酱 twitter 的ラブライブ pixiv bot 怎么啦 好久不见它了 (•̥́ ˍ •̀ू)
              <div className="comment-author">
                <a href="#" className="username">梨子</a>
                <span>学院生</span>
                <label>1 年前</label>
                <a href="">回复</a>
              </div>
            </div>
            <CommentSender replyId={10} />
          </div>
        </div>
        <div className="info eef">
          <center>已经没有更多评论了呢</center>
        </div>
      </div>
    );
  }
}

export default Comments

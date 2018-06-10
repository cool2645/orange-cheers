import React, { Component } from 'react'
import '../styles/Comments.css'
import '../styles/themes/orange-cheers.css'
import { ClassicalLoader as Loader } from './Loader'
import { Link } from 'react-router-dom'
import Unreachable from "./000"
import honoka from "honoka";
import { comment as config } from "../config"
import urlEncode from "../utils/url";
import { human } from "../utils/datetime";

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
            {this.props.replyId ?
              <input name="submit" className="btn reply-btn" type="button" tabIndex="5" value="取消" /> : ''
            }
            <input name="submit" className={this.props.replyId ? 'btn reply-btn' : 'btn'} type="button" tabIndex="5"
                   value="发射=A=" />
          </div>
        </div>
      </div>
    );
  }
}

class Comments extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ready: true,
      comments: [],
      page: 0,
      end: false,
      error: null,
    };
    this.fetchMoreComments = this.fetchMoreComments.bind(this);
    this.fetchComments = this.fetchComments.bind(this);
    this.fetchReplies = this.fetchReplies.bind(this);
    this.fetchReply = this.fetchReply.bind(this);
    let getElementTop = function (element) {
      let actualTop = element.offsetTop;
      let current = element.offsetParent;
      while (current !== null) {
        actualTop += current.offsetTop;
        current = current.offsetParent;
      }
      return actualTop;
    };
    window.onscroll = () => {
      let scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      let commentTop = getElementTop(document.getElementById('comment-ending'));
      //let scrollHeight = document.body.clientHeight;
      let windowHeight = window.visualViewport.height;
      if (!this.state.end && scrollTop + windowHeight >= commentTop) this.fetchMoreComments();
    }
  }

  componentDidMount() {
    this.fetchMoreComments()
  }

  fetchReply(id, page, totalPage, comment) {
    return fetch(honoka.defaults.baseURL + '/comments?' + urlEncode({
      page: page,
      parent: id
    })).then(response => {
      let total = response.headers.get("x-wp-totalpages");
      totalPage = +total;
      return response.json();
    }).then(data => {
      comment.children = [...comment.children, ...data];
      page++;
      if (page <= totalPage) {
        this.setState({
          comments: [...this.state.comments.filter(c => {
            return c.id !== comment.id
          }), comment]
        });
        return this.fetchReply(id, page, totalPage, comment)
      }
    })
  }

  fetchReplies(comments) {
    let promise = new Promise((resolve, reject) => {
      resolve();
    });
    for (let comment of comments) {
      comment.children = [];
      promise = promise.then(() => this.fetchReply(comment.id, 1, 1, comment))
        .then(() => {
          this.setState({
            comments: [...this.state.comments.filter(c => {
              return c.id !== comment.id
            }), comment]
          });
        });
    }
    return promise.then(() => {
      return comments;
    })
  }

  fetchComments(id, page) {
    return honoka.get('/comments', {
      data: {
        post: id,
        parent: 0,
        per_page: config.perPage,
        page: page,
      }
    })
      .then(data => this.fetchReplies(data))
  }

  fetchMoreComments() {
    if (!this.state.ready) return;
    this.setState({ ready: false, error: null });
    this.fetchComments(this.props.id, this.state.page + 1)
      .then((data) => {
        let end = data.length === 0;
        this.setState({ ready: true, page: this.state.page + 1, end: end });
        console.log(this.state)
      })
      .catch(err => {
        console.log(err);
        this.setState({ ready: true, error: this.fetchMoreComments });
      })
  }

  renderComment(data) {
    const isReply = data.parent === 0 ? '' : 'reply';
    return (
      <div key={data.id} className={`comment ${isReply} nf`}>
        <div className="avatar-control">
          <img alt={data.author_name} className="avatar"
               src={data.author_avatar_urls['96']} />
        </div>
        <div className="comment-control">
          <div dangerouslySetInnerHTML={{ __html: data.content.rendered }} />
          <div className="comment-author">
            <a href={data.author_url} target="_blank" rel="noopener noreferrer" className="username">
              {data.author_name}
            </a>
            <span>学院生</span>
            <label>{human(data.date_gmt + '.000Z')}</label>
            <a href="">回复</a>
          </div>
        </div>
        <CommentSender replyId={data.id} />
      </div>
    )
  }

  render() {
    let comments = [];
    for (let cmt of this.state.comments) {
      comments.push(this.renderComment(cmt));
      for (let chl of cmt.children) {
        comments.push(this.renderComment(chl));
      }
    }
    return (
      <div className="page-container">
        <h1 className="title fee page-control">
          以下是评论惹(´Д｀)
        </h1>
        <div className="comments page-control">
          <CommentSender />
          {comments}
          {!this.state.ready ? Loader : this.state.error ? <Unreachable retry={this.state.error} /> : ''}
        </div>
        <div id="comment-ending" />
        {
          this.state.end ?
            <div className="info eef">
              <center>已经没有更多评论了呢</center>
            </div>
            : ''
        }
      </div>
    );
  }
}

export default Comments

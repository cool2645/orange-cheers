import honoka from 'honoka';
import React, { Component } from 'react';
import * as WP from 'wordpress';

import { comment as config } from '../config';
import '../styles/Comments.css';
import { human } from '../utils/datetime';
import urlEncode from '../utils/url';

import { ClassicalLoader as Loader } from './Loader';
import Unreachable from './Unreachable';

const getElementTop = (element: HTMLElement | null): number => {
  if (element === null) return 0;
  let actualTop = element.offsetTop;
  let current = element.offsetParent;
  while (current !== null) {
    actualTop += (current as HTMLElement).offsetTop;
    current = (current as HTMLElement).offsetParent;
  }
  return actualTop;
};

interface ICommentSenderProps {
  replyId?: number; // TODO: send reply
  cancel?(f: React.MouseEvent<HTMLInputElement>): void;
}

class CommentSender extends Component<ICommentSenderProps> {
  public render() {
    return (
      <div className="comment-box">
        <div className="comment-send">
          <textarea name="text" id="textarea" rows={10} tabIndex={4}
                    placeholder="把你变成小鸟的点心 (・8・)" />
          <div className="author-info nf">
            <input type="text" name="author" id="author" value="" placeholder="昵称" size={22} tabIndex={1}
                   aria-required="true" />
            <input type="text" name="mail" id="mail" value="" placeholder="邮箱" size={22} tabIndex={2} />
            <input type="text" name="url" id="url" value="" placeholder="网址" size={22} tabIndex={3} />
            {this.props.replyId ?
              <input name="submit" className="btn reply-btn" type="button" tabIndex={5} value="取消"
                     onClick={this.props.cancel} /> : ''
            }
            <input name="submit" className={this.props.replyId ? 'btn reply-btn' : 'btn'} type="button" tabIndex={5}
                   value="发射=A=" />
          </div>
        </div>
      </div>
    );
  }
}

interface ICommentsProps {
  id: number;
}

interface ICommentsState {
  ready: boolean;
  comments: WP.Comment[];
  replyFocus: boolean;
  page: number;
  end: boolean;
  error: (() => void) | null;
}

class Comments extends Component<ICommentsProps, ICommentsState> {

  private unmounted: boolean;

  public setState<K extends keyof ICommentsState>(
    newState: ((prevState: Readonly<ICommentsState>, props: ICommentsProps) =>
      (Pick<ICommentsState, K> | ICommentsState | null)) | (Pick<ICommentsState, K> | ICommentsState | null),
    callback?: () => void
  ): void {
    if (!this.unmounted) super.setState(newState, callback);
  }

  constructor(props: ICommentsProps) {
    super(props);
    this.state = {
      ready: true,
      comments: [],
      replyFocus: true,
      page: 0,
      end: false,
      error: null,
    };
    this.update = this.update.bind(this);
    this.fetchMoreComments = this.fetchMoreComments.bind(this);
    this.fetchComments = this.fetchComments.bind(this);
    this.fetchReplies = this.fetchReplies.bind(this);
    this.fetchReply = this.fetchReply.bind(this);
  }

  public componentDidMount() {
    this.fetchMoreComments();
    window.onscroll = this.update;
    this.unmounted = false;
  }

  public componentWillUnmount() {
    window.onscroll = null;
    this.unmounted = true;
  }

  private fetchReply(id: number, page: number, totalPage: number, comment: WP.Comment): Promise<object> {
    return fetch(honoka.defaults.baseURL + '/comments?' + urlEncode({
      page,
      parent: id,
    })).then(response => {
      const total = response.headers.get('x-wp-totalpages');
      totalPage = total !== null ? +total : 1;
      return response.json();
    }).then(data => {
      comment.children = [...comment.children, ...data];
      page++;
      if (page <= totalPage) {
        this.setState({
          comments: [...this.state.comments.map(c =>
            c.id !== comment.id ? c : comment)],
        });
        return this.fetchReply(id, page, totalPage, comment);
      }
      return {};
    });
  }

  private fetchReplies(comments: WP.Comment[]): Promise<WP.Comment[]> {
    let promise = new Promise<void>((resolve, reject) => {
      resolve();
    });
    for (const comment of comments) {
      comment.children = [];
      promise = promise.then(() => this.fetchReply(comment.id, 1, 1, comment))
        .then((o: object) => {
          this.setState({
            comments: [...this.state.comments.map(c =>
              c.id !== comment.id ? c : comment)],
          });
        });
    }
    return promise.then(() =>
      comments);
  }

  private fetchComments(id: number, page: number) {
    return honoka.get('/comments', {
      data: {
        post: id,
        parent: 0,
        per_page: config.perPage,
        page,
      },
    })
      .then(data => {
        this.setState({
          comments: [...this.state.comments, ...data.map((comment: WP.Comment) => {
            comment.children = [];
            return comment;
          })],
        });
        return data;
      });
  }

  private update() {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const commentTop = getElementTop(document.getElementById('comment-ending'));
    // let scrollHeight = document.body.clientHeight;
    const windowHeight = (window as any).visualViewport ? (window as any).visualViewport.height : window.innerHeight + 100;
    if (!this.state.end && scrollTop + windowHeight >= commentTop) this.fetchMoreComments();
  }

  private fetchMoreComments() {
    if (!this.state.ready) return;
    this.setState({ ready: false, error: null }, () =>
      this.fetchComments(this.props.id, this.state.page + 1)
        .then((data) => {
          const end = data.length === 0;
          this.setState({ ready: true, page: this.state.page + 1, end });
          this.update();
          return data;
        })
        .catch(err => {
          console.log(err);
          this.setState({ ready: true, error: this.fetchMoreComments });
        })
        .then(data => this.fetchReplies(data))
        .catch(err => {
          console.log(err);
        })
    );
  }

  private renderComment(data: WP.Comment) {
    const isReply = data.parent === 0 ? '' : 'reply';
    const reply = (e: React.MouseEvent<HTMLAnchorElement>) => {
      this.setState({
        replyFocus: false,
        comments: this.state.comments.map(comment => {
          comment.replyFocus = comment.id === data.id;
          return comment;
        }),
      });
      e.preventDefault();
    };
    const cacel = (e: React.MouseEvent<HTMLInputElement>) => {
      this.setState({
        replyFocus: true,
        comments: this.state.comments.map(comment => {
          comment.replyFocus = false;
          return comment;
        }),
      });
    };
    return (
      <div key={data.id} className={`comment ${isReply} nf`}>
        <div className="avatar-control">
          <img alt={data.author_name} className="avatar"
               src={data.author_avatar_urls['96']} />
        </div>
        <div className="comment-control">
          <div className="comment-content post-content" dangerouslySetInnerHTML={{ __html: data.content.rendered }} />
          <div className="comment-author">
            <a href={data.author_url} target="_blank" rel="noopener noreferrer" className="username">
              {data.author_name}
            </a>
            <span>学院生</span>
            <label>{human(data.date_gmt + '.000Z')}</label>
            <a href="" onClick={reply}>回复</a>
          </div>
        </div>
        {
          data.replyFocus ?
            <CommentSender replyId={data.id} cancel={cacel} />
            : ''
        }
      </div>
    );
  }

  public render() {
    const comments = [];
    for (const cmt of this.state.comments) {
      comments.push(this.renderComment(cmt));
      for (const chl of cmt.children) {
        comments.push(this.renderComment(chl));
      }
    }
    return (
      <div className="page-container">
        <h1 className="title fee page-control">
          以下是评论惹(´Д｀)
        </h1>
        <div className="comments page-control">
          {
            this.state.replyFocus ? <CommentSender /> : ''
          }
          {comments}
          {!this.state.ready ? Loader : this.state.error ? <Unreachable retry={this.state.error} /> : ''}
        </div>
        <div id="comment-ending" />
        {
          this.state.end ?
            <div className="info eef page-control no-more">
              {this.state.comments.length ? '已经没有更多评论了呢' : '来第一个评论吧 |･ω･｀)'}
            </div>
            : ''
        }
      </div>
    );
  }
}

export default Comments;

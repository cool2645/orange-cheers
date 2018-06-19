import honoka from 'honoka';
import React, { Component } from 'react';
import * as WP from 'wordpress';

import { comment as config } from '../config';
import '../styles/Comments.css';
import { human } from '../utils/datetime';
import { getElementTop } from '../utils/element';
import urlEncode from '../utils/url';

import Alert from './Alert';
import { ClassicalLoader as Loader } from './Loader';

interface ICommentSenderProps {
  postId: number;
  parentId?: number;
  reply?: WP.Comment;

  addComment(cmt: IComment): void;

  cancel?(): void;
}

interface ICommentConfig {
  author_name?: string;
  author_email?: string;
  author_url?: string;
  content?: string;
}

interface IComment extends WP.Comment {
  children?: WP.Comment[];
}

const emptyCommentConfig = () => Object.assign({}, {
  author_name: '',
  author_email: '',
  author_url: '',
  content: '',
});

interface ICommentSenderState {
  data: ICommentConfig;
}

class CommentSender extends Component<ICommentSenderProps, ICommentSenderState> {

  private readonly alert: React.RefObject<Alert>;

  constructor(props: ICommentSenderProps) {
    super(props);
    this.state = {
      data: emptyCommentConfig(),
    };
    this.alert = React.createRef();
    this.onSubmit = this.onSubmit.bind(this);
    this.vModel = this.vModel.bind(this);
  }

  private onSubmit(e: React.MouseEvent<HTMLInputElement>) {
    e.preventDefault();
    if (!this.alert) return;
    const cmt: any = this.state.data;

    cmt.content = cmt.content.trim();
    if (!cmt.content) {
      this.alert.current.show('乃什么都没输！', 'warning', 0, {
        title: '嗷', callback: () => undefined,
      });
      return;
    }

    cmt.author_name = cmt.author_name.trim();
    if (!cmt.author_name) {
      this.alert.current.show('昵称是必填的！', 'warning', 0, {
        title: '嗷', callback: () => undefined,
      });
      return;
    }

    cmt.author_email = cmt.author_email.trim();
    if (!/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(cmt.author_email.toLowerCase())) {
      this.alert.current.show('请输入正确的邮箱！', 'warning', 0, {
        title: '嗷', callback: () => undefined,
      });
      return;
    }

    this.alert.current.show('发射中...', 'info', 0, null);

    cmt.post = this.props.postId;
    if (this.props.parentId) cmt.parent = this.props.parentId;
    if (this.props.reply) cmt.content = `<a href="#Comment-${this.props.reply.id}" >@${this.props.reply.author_name}</a> ${cmt.content}`;
    honoka.post('/comments', {
      data: cmt,
    })
      .then(data => {
        this.alert.current.show('发射成功！', 'success', 3000, null);
        this.props.addComment(data);
        this.setState({ data: emptyCommentConfig() });
        setTimeout(() => {
          if (this.props.cancel) this.props.cancel();
        }, 3000);
      })
      .catch(err => {
        console.log(err);
        this.alert.current.show('发射失败了喵...', 'danger', 0, {
          title: '重试', callback: () => { this.onSubmit(e); },
        });
      });
  }

  private vModel(e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) {
    const data = this.state.data;
    data[e.target.name] = e.target.value;
    this.setState({ data });
  }

  public render() {
    return (
      <div className="comment-box">
        <Alert ref={this.alert} show={false} type="shadow" />
        <div className="comment-send">
          <textarea id="textarea" name="content" rows={10} tabIndex={1} value={this.state.data.content}
                    placeholder="把你变成小鸟的点心 (・8・)" onChange={this.vModel} />
          <div className="author-info nf">
            <input type="text" id="author" name="author_name" placeholder="昵称" size={22} tabIndex={2}
                   value={this.state.data.author_name} aria-required="true" onChange={this.vModel} />
            <input type="text" id="mail" name="author_email" placeholder="邮箱" size={22} tabIndex={3}
                   value={this.state.data.author_email} onChange={this.vModel} />
            <input type="text" id="url" name="author_url" placeholder="网址" size={22} tabIndex={4}
                   value={this.state.data.author_url} onChange={this.vModel} />
            {this.props.parentId ?
              <input name="submit" className="btn reply-btn" type="button" value="取消"
                     onClick={this.props.cancel} /> : ''
            }
            <input name="submit" className={this.props.parentId ? 'btn reply-btn' : 'btn'} type="button" tabIndex={5}
                   value="发射=A=" onClick={this.onSubmit} />
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
  comments: IComment[];
  replyFocus: boolean;
  page: number;
  end: boolean;
  error: boolean;
}

class Comments extends Component<ICommentsProps, ICommentsState> {

  private unmounted: boolean;
  private readonly alert: React.RefObject<Alert>;

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
    this.alert = React.createRef();
    this.update = this.update.bind(this);
    this.fetchMoreComments = this.fetchMoreComments.bind(this);
    this.fetchComments = this.fetchComments.bind(this);
    this.fetchReplies = this.fetchReplies.bind(this);
    this.fetchReply = this.fetchReply.bind(this);
    this.addComment = this.addComment.bind(this);
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

  private fetchReply(id: number, page: number, totalPage: number, comment: IComment): Promise<object> {
    return fetch(honoka.defaults.baseURL + '/comments?' + urlEncode({
      page,
      parent: id,
      order: 'asc',
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

  private fetchReplies(comments: IComment[]): Promise<IComment[]> {
    let promise = new Promise<void>((resolve) => {
      resolve();
    });
    for (const comment of comments) {
      comment.children = [];
      promise = promise.then(() => this.fetchReply(comment.id, 1, 1, comment))
        .then(() => {
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
          comments: [...this.state.comments, ...data.map((comment: IComment) => {
            comment.children = [];
            return comment;
          })],
        });
        return data;
      });
  }

  public addComment(cmt: IComment) {
    cmt.children = [];
    this.setState({
      comments: cmt.parent === 0 ? [cmt, ...this.state.comments] :
        this.state.comments.map(comment => {
          if (comment.id === cmt.parent) comment.children.push(cmt);
          return comment;
        }),
    });
  }

  private update() {
    if (this.state.error) return;
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const commentTop = getElementTop(document.getElementById('comment-ending'));
    // let scrollHeight = document.body.clientHeight;
    const windowHeight = (window as any).visualViewport ? (window as any).visualViewport.height : window.innerHeight + 100;
    if (!this.state.end && scrollTop + windowHeight >= commentTop) this.fetchMoreComments();
  }

  private fetchMoreComments() {
    if (!this.state.ready) return;
    this.setState({ ready: false, error: false }, () =>
      this.fetchComments(this.props.id, this.state.page + 1)
        .then((data) => {
          const end = data.length === 0;
          this.setState({ ready: true, page: this.state.page + 1, end });
          this.update();
          return data;
        })
        .catch(err => {
          console.log(err);
          this.setState({ ready: true, error: true }, () => {
            if (this.alert) this.alert.current.show();
          });
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
          if (comment.children && comment.children.length) {
            comment.children.forEach(childComment => {
              childComment.replyFocus = childComment.id === data.id;
            });
          }
          return comment;
        }),
      });
      e.preventDefault();
    };
    const cancel = () => {
      this.setState({
        replyFocus: true,
        comments: this.state.comments.map(comment => {
          comment.replyFocus = false;
          if (comment.children && comment.children.length) {
            comment.children.forEach(childComment => {
              childComment.replyFocus = false;
            });
          }
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
            <CommentSender postId={this.props.id} parentId={data.parent ? data.parent : data.id} reply={data}
                           addComment={this.addComment} cancel={cancel} />
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
            this.state.replyFocus ? <CommentSender addComment={this.addComment} postId={this.props.id} /> : ''
          }
          {comments}
          {!this.state.ready ? Loader : ''}
        </div>
        <div id="comment-ending" />
        <Alert ref={this.alert} show={false} content="评论拉取失败了"
               handle={{ title: '重试', callback: this.fetchMoreComments }} />
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

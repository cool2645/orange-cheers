import honoka from 'honoka';
import React, { Component } from 'react';
import { translate, InjectedTranslateProps } from 'react-i18next';
import * as WP from 'wordpress';

import { comment as config } from '../config';
import '../styles/Comments.css';
import { human } from '../utils/datetime';
import { getElementTop } from '../utils/element';
import urlEncode from '../utils/url';

import Alert from './Alert';
import { ClassicalLoader as Loader } from './Loader';

interface ICommentSenderProps extends InjectedTranslateProps {
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
  }

  private onSubmit = async (e: React.MouseEvent<HTMLInputElement>) => {
    e.preventDefault();
    const { t } = this.props;
    if (!this.alert) return;
    const cmt: any = this.state.data;

    cmt.content = cmt.content.trim();
    if (!cmt.content) {
      this.alert.current.show(t('invalid.content'), 'warning', 0, {
        title: t('invalid.ok'), callback: () => undefined,
      });
      return;
    }

    cmt.author_name = cmt.author_name.trim();
    if (!cmt.author_name) {
      this.alert.current.show(t('invalid.name'), 'warning', 0, {
        title: t('invalid.ok'), callback: () => undefined,
      });
      return;
    }

    cmt.author_email = cmt.author_email.trim();
    if (!/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(cmt.author_email.toLowerCase())) {
      this.alert.current.show(t('invalid.email'), 'warning', 0, {
        title: t('invalid.ok'), callback: () => undefined,
      });
      return;
    }

    this.alert.current.show(t('sending'), 'info', 0, null);

    cmt.post = this.props.postId;
    if (this.props.parentId) cmt.parent = this.props.parentId;
    if (this.props.reply) {
      cmt.content = `<a href="#Comment-${this.props.reply.id}" >@${this.props.reply.author_name}</a> ${cmt.content}`;
    }
    try {
      const data = await honoka.post('/comments', {
        data: cmt,
      });
      this.alert.current.show(t('sent'), 'success', 3000, null);
      this.props.addComment(data);
      this.setState({ data: emptyCommentConfig() });
      setTimeout(() => {
        if (this.props.cancel) this.props.cancel();
      }, 3000);
    } catch (err) {
      console.log(err);
      this.alert.current.show(t('sendFail'), 'danger', 0, {
        title: t('retry'), callback: () => {
          this.onSubmit(e);
        },
      });
    }
  }

  private vModel = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const data = this.state.data;
    data[e.target.name] = e.target.value;
    this.setState({ data });
  }

  public render() {
    const { t } = this.props;
    return (
      <div className="comment-box">
        <Alert ref={this.alert} show={false} type="shadow" />
        <div className="comment-send">
          <textarea id="textarea" name="content" rows={10} tabIndex={1} value={this.state.data.content}
                    placeholder={t('placeHolder')} onChange={this.vModel} />
          <div className="author-info nf">
            <input type="text" id="author" name="author_name" placeholder={t('name')} size={22} tabIndex={2}
                   value={this.state.data.author_name} aria-required="true" onChange={this.vModel} />
            <input type="text" id="mail" name="author_email" placeholder={t('email')} size={22} tabIndex={3}
                   value={this.state.data.author_email} onChange={this.vModel} />
            <input type="text" id="url" name="author_url" placeholder={t('website')} size={22} tabIndex={4}
                   value={this.state.data.author_url} onChange={this.vModel} />
            {this.props.parentId ?
              <input name="submit" className="btn reply-btn" type="button" value={t('cancel')}
                     onClick={this.props.cancel} /> : ''
            }
            <input name="submit" className={this.props.parentId ? 'btn reply-btn' : 'btn'} type="button" tabIndex={5}
                   value={t('submit')} onClick={this.onSubmit} />
          </div>
        </div>
      </div>
    );
  }
}

interface ICommentsProps extends InjectedTranslateProps {
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

  private fetchReply = async (id: number, page: number, totalPage: number,
                              comment: IComment): Promise<object> => {
    const response = await fetch(honoka.defaults.baseURL + '/comments?' + urlEncode({
      page,
      parent: id,
      order: 'asc',
    }));
    const total = response.headers.get('x-wp-totalpages');
    totalPage = total !== null ? +total : 1;
    const data = await response.json();
    comment.children = [...comment.children, ...data];
    page++;
    if (page <= totalPage) {
      this.setState({
        comments: [...this.state.comments.map(c =>
          c.id !== comment.id ? c : comment)],
      });
      return await this.fetchReply(id, page, totalPage, comment);
    }
    return {};
  }

  private fetchReplies = async (comments: IComment[]): Promise<IComment[]> => {
    for (const comment of comments) {
      comment.children = [];
      await this.fetchReply(comment.id, 1, 1, comment);
      this.setState({
        comments: [...this.state.comments.map(c =>
          c.id !== comment.id ? c : comment)],
      });
    }
    return comments;
  }

  private fetchComments = async (id: number, page: number) => {
    const data = await honoka.get('/comments', {
      data: {
        post: id,
        parent: 0,
        per_page: config.perPage,
        page,
      },
    });
    this.setState({
      comments: [...this.state.comments, ...data.map((comment: IComment) => {
        comment.children = [];
        return comment;
      })],
    });
    return data;
  }

  public addComment = (cmt: IComment) => {
    cmt.children = [];
    this.setState({
      comments: cmt.parent === 0 ? [cmt, ...this.state.comments] :
        this.state.comments.map(comment => {
          if (comment.id === cmt.parent) comment.children.push(cmt);
          return comment;
        }),
    });
  }

  private update = () => {
    if (this.state.error) return;
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const commentTop = getElementTop(document.getElementById('comment-ending'));
    // let scrollHeight = document.body.clientHeight;
    const windowHeight = (window as any).visualViewport ? (window as any).visualViewport.height : window.innerHeight + 100;
    if (!this.state.end && scrollTop + windowHeight >= commentTop) this.fetchMoreComments();
  }

  private fetchMoreComments = () => {
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
    const { t } = this.props;
    const CommentSenderWithTrans = translate('comment')(CommentSender);
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
            {/*<span>学院生</span>*/}
            <label>{human(data.date_gmt + '.000Z')}</label>
            <a href="" onClick={reply}>{t('reply')}</a>
          </div>
        </div>
        {
          data.replyFocus ?
            <CommentSenderWithTrans postId={this.props.id} parentId={data.parent ? data.parent : data.id} reply={data}
                                    addComment={this.addComment} cancel={cancel} />
            : ''
        }
      </div>
    );
  }

  public render() {
    const { t } = this.props;
    const CommentSenderWithTrans = translate('comment')(CommentSender);
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
          {t('title')}
        </h1>
        <div className="comments page-control">
          {
            this.state.replyFocus ? <CommentSenderWithTrans addComment={this.addComment} postId={this.props.id} /> : ''
          }
          {comments}
          {!this.state.ready ? Loader : ''}
        </div>
        <div id="comment-ending" />
        <Alert ref={this.alert} show={false} content={t('fail')}
               handle={{ title: t('retry'), callback: this.fetchMoreComments }} />
        {
          this.state.end ?
            <div className="info eef page-control no-more">
              {this.state.comments.length ? t('noMore') : t('noComment')}
            </div>
            : ''
        }
      </div>
    );
  }
}

export default translate('comment')(Comments);

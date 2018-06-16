import React, { Component } from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';

import '../styles/Post.css';
import '../styles/PostContent.css';
import { formatDate, human } from '../utils/datetime';

import Comments from './Comments';
import { FullPageLoader as Loader, InlineLoader } from './Loader';
import NotFound from './NotFound';
import { IPostData, IQueryParams, IViewComponentProps } from './PostHelper';
import { IRefreshConfig, RefreshLevel } from './Settings';
import Unreachable from './Unreachable';

interface IQuery {
  params: IQueryParams;
  offset: number | null;
}

interface IParams {
  slug: string;
}

interface IPostProps extends RouteComponentProps<IParams>, IViewComponentProps {
  startProgress(): void;

  joinProgress(): void;

  doneProgress(): void;

  setTyped(text: string): void;
}

interface IPostState {
  slug: string;
  ready: boolean;
  query?: IQuery;
  error: (() => void) | null;
  refreshConfig: IRefreshConfig;
}

const initialState: IPostState = {
  slug: '',
  ready: false,
  error: null,
  refreshConfig: JSON.parse(localStorage.refreshConfig),
};

class Post extends Component<IPostProps, IPostState> {

  constructor(props: IPostProps) {
    super(props);
    this.state = initialState;
    this.onReady = this.onReady.bind(this);
    this.fetchData = this.fetchData.bind(this);
  }

  public componentDidMount() {
    this.props.startProgress();
    const refreshConfig = JSON.parse(localStorage.refreshConfig);
    this.setState({
      slug: this.props.match.params.slug,
      refreshConfig,
      query: this.props.location.state ? {
        params: this.props.location.state.params,
        offset: this.props.location.state.offset,
      } : { params: undefined, offset: undefined },
    });
    initialState.refreshConfig = refreshConfig;
    document.onreadystatechange = () => {
      if (document.readyState === 'complete') {
        if (this.state.ready) this.props.doneProgress();
        else this.props.joinProgress();
      }
    };
    this.fetchData();
  }

  public componentWillReceiveProps(nextProps: IPostProps) {
    if (nextProps.match.params.slug === this.state.slug) return;
    this.props.startProgress();
    this.setState(initialState);
    this.setState({
      slug: nextProps.match.params.slug,
      query: this.props.location.state ? {
        params: nextProps.location.state.params,
        offset: nextProps.location.state.offset,
      } : { params: undefined, offset: undefined },
    }, this.fetchData);
  }

  public componentWillUnmount() {
    document.onreadystatechange = null;
  }

  private onReady(error: any): void {
    if (error === null) this.setState({ ready: true, error: null }, (window as any).initMonacoEditor);
    else if (typeof error === 'function') this.setState({ ready: true, error });
    else this.setState({ ready: true });
    if (document.readyState === 'complete') this.props.doneProgress();
    else this.props.joinProgress();
  }

  private fetchData() {
    if (this.state.slug) {
      this.setState({ ready: false, error: null }, () =>
        this.props.getPostData(
          this.state.slug,
          this.state.query.params,
          this.state.query.offset,
          this.onReady
        )
      );
    }
  }

  private renderPost(postData: IPostData) {
    const post = postData.post;
    const categories = postData.categories.map(cate =>
      <Link key={cate.slug} className="category-link"
            to={`/category/${cate.slug}`}>{cate.name}</Link>);
    const tags = postData.tags.map(tag =>
      <Link key={tag.slug} className="tag-link"
            to={`/tag/${tag.slug}`}>{tag.name}</Link>);
    let commentCount;
    if (this.state.refreshConfig.comments !== RefreshLevel.Never) {
      if (post.commentCount === undefined) {
        commentCount =
          <span className="fas fa-comments">评论数拉取中 {InlineLoader}</span>;
      } else {
        commentCount = post.commentCount === 0 ? '还没有评论耶' : post.commentCount === 1 ?
          `${post.commentCount} 条评论` : `${post.commentCount} 条评论`;
        commentCount =
          <span className="fas fa-comments"><Link to={`/${post.slug}#Comments`}>{commentCount}</Link></span>;
      }
    }
    const dateStr = formatDate(post.date_gmt + '.000Z');
    const date = [];
    date.push(<span key="date" className="fas fa-calendar">发表于 {dateStr}</span>);
    if (formatDate(post.modified_gmt + '.000Z') !== dateStr) {
      date.push(<span key="modified"
                      className="fas fa-pencil-alt">最后更新于 {human(post.modified_gmt + '.000Z')}</span>);
    }
    return (
      <div className="post">
        <h1 className="title fee page-control" dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
        <div className="info fee page-control">
          {date}
          {commentCount}
          <span className="fas fa-folder">
            {categories}
            </span>
          {/*<span className="fas fa-eye" >498 Hits</span>*/}
          {
            tags.length === 0 ? '' :
              <span className="fas extra fa-tags">
              {tags}
            </span>
          }
        </div>
        <div className="content page-control">
          <div className="post-content" dangerouslySetInnerHTML={{ __html: post.content.rendered }} />
        </div>
        {
          postData.siblings ?
            <div className="info eef sibling page-control">
              {
                // next on the list (i.e. older published)
                postData.siblings.next === null ?
                  <span>已经是第一篇了</span> : postData.siblings.next ?
                  <span>上一篇：<Link to={{
                    pathname: `/${postData.siblings.next.post.slug}`,
                    state: {
                      params: this.state.query.params,
                      offset: postData.siblings.next.offset,
                    },
                  }} dangerouslySetInnerHTML={{ __html: postData.siblings.next.post.title.rendered }} />
                  </span> :
                  <span>上一篇：加载中 {InlineLoader} </span>
              }
              {
                // previous on the list (i.e. newer published)
                postData.siblings.prev === null ?
                  <span>已经是最后一篇了</span> : postData.siblings.prev ?
                  <span>
                    下一篇：<Link to={{
                    pathname: `/${postData.siblings.prev.post.slug}`,
                    state: {
                      params: this.state.query.params,
                      offset: postData.siblings.prev.offset,
                    },
                  }} dangerouslySetInnerHTML={{ __html: postData.siblings.prev.post.title.rendered }} />
                  </span> :
                  <span>下一篇：加载中 {InlineLoader} </span>
              }
            </div> : ''
        }
      </div>
    );
  }

  public render() {
    if (!this.state.ready) {
      return (
        <div className="container page">
          <div className="page-container">
            {Loader}
          </div>
        </div>
      );
    }
    if (this.state.error) {
      return <Unreachable retry={this.state.error} />;
    }
    if (!this.props.data) {
      return <NotFound />;
    }
    return (
      <div className="container page post">
        <div className="page-container">
          {this.renderPost(this.props.data as IPostData)}
        </div>
        {
          (this.props.data as IPostData).post.comment_status === 'open' && this.state.refreshConfig.comments !== RefreshLevel.Never ?
            <Comments id={(this.props.data as IPostData).post.id} />
            : ''
        }
      </div>
    );
  }
}

export default Post;

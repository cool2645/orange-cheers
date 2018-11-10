import React, { Component } from 'react';
import { translate, InjectedTranslateProps } from 'react-i18next';
import { Link, RouteComponentProps } from 'react-router-dom';

import '../styles/Post.css';
import '../styles/PostContent.css';
import { formatDate, human } from '../utils/datetime';

import Alert from './Alert';
import Comments from './Comments';
import { FullPageLoader as Loader, InlineLoader } from './Loader';
import { INavControlProps } from './Nav';
import NotFound from './NotFound';
import withPost, { IPostData, IQueryParams, IViewComponentProps } from './PostHelper';
import { IRefreshConfig, RefreshLevel } from './Settings';

interface IQuery {
  params: IQueryParams;
  offset: number | null;
}

interface IParams {
  slug: string;
}

interface IPostProps extends RouteComponentProps<IParams>, IViewComponentProps, INavControlProps, InjectedTranslateProps {
}

interface IPostState {
  slug: string;
  ready: boolean;
  query?: IQuery;
  notfound: boolean;
  refreshConfig?: IRefreshConfig;
}

const initialState: IPostState = {
  slug: '',
  ready: false,
  notfound: false,
};

const initState = (): IPostState => Object.assign({}, initialState);

class Post extends Component<IPostProps, IPostState> {

  private readonly alert: React.RefObject<Alert>;

  constructor(props: IPostProps) {
    super(props);
    this.state = initState();
    this.alert = React.createRef();
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
    this.setState(initState());
    this.setState({
      slug: nextProps.match.params.slug,
      query: nextProps.location.state ? {
        params: nextProps.location.state.params,
        offset: nextProps.location.state.offset,
      } : { params: undefined, offset: undefined },
    }, this.fetchData);
  }

  public componentWillUnmount() {
    document.onreadystatechange = null;
  }

  private onReady = (error: any): void => {
    const { t } = this.props;
    if (error instanceof Error) {
      if (error.message === '404') this.setState({ notfound: true });
      else {
        this.setState({ ready: true }, () => {
          if (this.alert) {
            this.alert.current.show(
              t('post.fail'), 'danger', null, {
                title: t('post.retry'),
                callback: this.fetchData,
              }
            );
          }
        });
      }
    } else this.setState({ ready: true }, (window as any).initMonacoEditor);
    if (document.readyState === 'complete') this.props.doneProgress();
    else this.props.joinProgress();
  }

  private onUpdated = (error: any): void => {
    const { t } = this.props;
    if (!this.alert) return;
    if (error instanceof Error) {
      this.alert.current.show(
        t('post.updateFail'), 'danger', null, {
          title: t('retry'),
          callback: this.fetchData,
        }
      );
    } else {
      this.alert.current.show(
        t('post.update'), 'info', 3000
      );
      (window as any).initMonacoEditor();
    }
  }

  private fetchData = () => {
    if (this.state.slug) {
      this.setState({ ready: false }, () =>
        this.props.getPostData(
          this.state.slug,
          this.state.query.params,
          this.state.query.offset,
          this.onReady,
          this.onUpdated
        )
      );
    }
  }

  private renderPost(postData: IPostData) {
    const { t } = this.props;
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
          <span className="fas fa-comments">{t('commentCount.loading')} {InlineLoader}</span>;
      } else {
        commentCount = t(post.commentCount === 0 ? 'commentCount.noComment' : 'commentCount.comment', { count: post.commentCount });
        commentCount =
          <span className="fas fa-comments"><Link to={`/${post.slug}#Comments`}>{commentCount}</Link></span>;
      }
    }
    const dateStr = formatDate(post.date_gmt + '.000Z');
    const date = [];
    date.push(<span key="date" className="fas fa-calendar">{t('date', { date: dateStr })}</span>);
    if (formatDate(post.modified_gmt + '.000Z') !== dateStr) {
      date.push(<span key="modified"
                      className="fas fa-pencil-alt">{t('modifiedDate', { date: human(post.modified_gmt + '.000Z') })}</span>);
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
                  <span>{t('siblings.first')}</span> : postData.siblings.next ?
                  <span>{t('siblings.prev')}<Link to={{
                    pathname: `/${postData.siblings.next.post.slug}`,
                    state: {
                      params: this.state.query.params,
                      offset: postData.siblings.next.offset,
                    },
                  }} dangerouslySetInnerHTML={{ __html: postData.siblings.next.post.title.rendered }} />
                  </span> :
                  <span>{t('siblings.prev')}{t('siblings.loading')} {InlineLoader} </span>
              }
              {
                // previous on the list (i.e. newer published)
                postData.siblings.prev === null ?
                  <span>{t('siblings.last')}</span> : postData.siblings.prev ?
                  <span>
                    {t('siblings.next')}<Link to={{
                    pathname: `/${postData.siblings.prev.post.slug}`,
                    state: {
                      params: this.state.query.params,
                      offset: postData.siblings.prev.offset,
                    },
                  }} dangerouslySetInnerHTML={{ __html: postData.siblings.prev.post.title.rendered }} />
                  </span> :
                  <span>{t('siblings.next')}{t('siblings.loading')} {InlineLoader} </span>
              }
            </div> : ''
        }
      </div>
    );
  }

  public render() {
    if (this.state.notfound) {
      return <NotFound />;
    }
    return (
      <div className="container page post">
        <Alert ref={this.alert} rootClassName="page-container" show={false} />
        {
          this.state.ready ? '' :
            <div className="page-container">
              {Loader}
            </div>
        }
        {
          this.state.ready && this.props.data ?
            <div className="page-container">
              {this.renderPost(this.props.data as IPostData)}
            </div> : ''
        }
        {
          this.state.ready && this.props.data ?
            (this.props.data as IPostData).post.comment_status === 'open' && this.state.refreshConfig.comments !== RefreshLevel.Never ?
              <Comments id={(this.props.data as IPostData).post.id} />
              : ''
            : ''
        }
      </div>
    );
  }
}

export default translate('post')(withPost(Post));

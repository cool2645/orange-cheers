import honoka from 'honoka';
import React, { Component } from 'react';
import ReactRouter, { Link } from 'react-router-dom';
import * as WP from 'wordpress';

import { post as config, site } from '../config';
import '../styles/Post.css';
import '../styles/PostContent.css';
import { formatDate, human } from '../utils/datetime';
import urlEncode from '../utils/url';

import Comments from './Comments';
import { FullPageLoader as Loader, InlineLoader } from './Loader';
import NotFound from './NotFound';
import { IRefreshConfig, RefreshLevel } from './Settings';
import Unreachable from './Unreachable';

interface IQueryParams {
  per_page: number;
  categories?: number[];
  tags?: number[];
  search?: string;

  page?: number;

  after?: string;
  before?: string;
  order?: string;
}

interface IQuery {
  key: string;
  params: IQueryParams;
  offset: number | null;
}

interface IIndex {
  posts: { [key: string]: IPost[]; };
  totalPage: number;
}

interface ISiblings {
  prev: undefined | null | IPost;
  prevOffset: number;
  next: undefined | null | IPost;
  nextOffset: number;
}

interface IParams {
  page?: number;
  slug?: string;
  category?: string;
  tag?: string;
  search?: string;
}

interface IPost extends WP.Post {
  offset?: number;
  commentCount?: number;
}

interface IPostProps {
  match: ReactRouter.match<IParams>;

  startProgress(): void;

  joinProgress(): void;

  doneProgress(): void;

  setTyped(text: string): void;
}

interface IPostState {
  params: IParams;
  page: number;
  totalPage: number;
  ready: boolean;
  post: null | IPost;
  posts: null | IPost[];
  category: null | number[];
  tag: null | number[];
  siblings: null | ISiblings;
  error: (() => void) | null;
  refreshConfig: IRefreshConfig;
}

const initialState: IPostState = {
  ready: false,
  post: null,
  posts: null,
  page: 1,
  totalPage: 0,
  category: null,
  tag: null,
  params: {},
  siblings: null,
  error: null,
  refreshConfig: JSON.parse(localStorage.refreshConfig),
};

class Post extends Component<IPostProps, IPostState> {

  private categories: Map<number, WP.Category>;
  private tags: Map<number, WP.Tag>;
  private posts: Map<string, IPost>;
  private indexes: Map<string, IIndex>;
  private query: IQuery;
  private seq: number;

  public setState<K extends keyof IPostState>(
    newState: ((prevState: Readonly<IPostState>, props: IPostProps) =>
      (Pick<IPostState, K> | IPostState | null)) | (Pick<IPostState, K> | IPostState | null),
    seq?: number | (() => void),
    callback?: () => void
  ): void {
    if (typeof seq !== 'number') super.setState(newState, seq);
    else if (seq === this.seq) super.setState(newState, callback);
  }

  constructor(props: IPostProps) {
    super(props);
    const state = initialState;
    state.params = props.match.params;
    state.page = +props.match.params.page || 1;
    this.state = state;
    this.categories = localStorage.categories ? JSON.parse(localStorage.categories) : {};
    this.tags = localStorage.tags ? JSON.parse(localStorage.tags) : {};
    this.posts = localStorage.posts ? JSON.parse(localStorage.posts) : {};
    this.indexes = localStorage.indexes ? JSON.parse(localStorage.indexes) : {};
    this.seq = 0;
    this.update = this.update.bind(this);
    this.onReady = this.onReady.bind(this);
    this.challengeParams = this.challengeParams.bind(this);
    this.fetchData = this.fetchData.bind(this);
    this.fetchPostData = this.fetchPostData.bind(this);
    this.fetchPosts = this.fetchPosts.bind(this);
    this.fetchTagData = this.fetchTagData.bind(this);
    this.fetchCommentCount = this.fetchCommentCount.bind(this);
    this.fetchCommentCounts = this.fetchCommentCounts.bind(this);
    this.buildAndUpdateQuery = this.buildAndUpdateQuery.bind(this);
    this.buildAndUpdateQuery();
  }

  public componentDidMount() {
    this.props.startProgress();
    const refreshConfig = JSON.parse(localStorage.refreshConfig);
    this.setState({ refreshConfig });
    initialState.refreshConfig = refreshConfig;
    document.onreadystatechange = () => {
      if (document.readyState === 'complete') {
        if (this.state.ready) this.props.doneProgress();
        else this.props.joinProgress();
      }
    };
    this.seq++;
    this.update(this.seq);
  }

  public componentWillReceiveProps(nextProps: IPostProps) {
    const page: number = +nextProps.match.params.page || 1;
    if (nextProps.match.params.slug === this.state.params.slug &&
      page === this.state.page &&
      nextProps.match.params.category === this.state.params.category &&
      nextProps.match.params.tag === this.state.params.tag &&
      nextProps.match.params.search === this.state.params.search
    ) return;
    this.props.startProgress();
    this.setState(initialState);
    this.seq++;
    this.setState({ params: nextProps.match.params, page }, () => this.update(this.seq));
  }

  public componentWillUnmount() {
    localStorage.categories = JSON.stringify(this.categories);
    localStorage.tags = JSON.stringify(this.tags);
    localStorage.posts = JSON.stringify(this.posts);
    localStorage.indexes = JSON.stringify(this.indexes);
    this.seq++;
    document.onreadystatechange = null;
  }

  private onReady(seq: number, error: any): void {
    if (error === null) this.setState({ ready: true, error: null }, seq, (window as any).initMonacoEditor);
    else if (typeof error === 'function') this.setState({ ready: true, error }, seq);
    else this.setState({ ready: true }, seq);
    if (document.readyState === 'complete') this.props.doneProgress();
    else this.props.joinProgress();
  }

  private buildAndUpdateQuery(): IQueryParams {
    const params: IQueryParams = {
      per_page: config.perPage,
    };
    if (this.state.category) params.categories = this.state.category;
    if (this.state.tag) params.tags = this.state.tag;
    if (this.state.params.search) params.search = this.state.params.search;
    const query = urlEncode(params);
    this.query = { key: query, params, offset: null };
    return Object.assign({}, params);
  }

  private update(seq: number): void {
    this.challengeParams(seq)
      .then(() => this.fetchData(seq));
  }

  private challengeParams(seq: number): Promise<void> {
    let promise = new Promise<void>((resolve) => {
      resolve();
    });
    if (this.state.params.slug) {
      this.props.setTyped(site.banner);
      return promise;
    }
    if (this.state.params.category) {
      promise = promise.then(() => honoka.get('/categories', {
        data: {
          slug: this.state.params.category,
        },
      })
        .then(data => {
          const cat = data.length === 0 ? null : data[0];
          if (cat === null) {
            this.onReady(seq, 404);
            throw new Error('404');
          }
          this.setState({ category: cat.id }, seq);
          this.props.setTyped(cat.name);
        }));
    }
    if (this.state.params.tag) {
      promise = promise.then(() => honoka.get('/tags', {
        data: {
          slug: this.state.params.tag,
        },
      })
        .then(data => {
          const tag = data.length === 0 ? null : data[0];
          if (tag === null) {
            this.onReady(seq, 404);
            throw new Error('404');
          }
          this.setState({ tag: tag.id }, seq);
          this.props.setTyped(tag.name);
        }));
    }
    return promise;
  }

  private fetchData(seq: number) {
    if (this.state.params.slug) {
      this.setState({ ready: false, error: null }, seq, () =>
        this.fetchPostData(seq, this.state.params.slug)
          .then(post => this.fetchCategoryData(post.categories, post))
          .then(post => this.fetchTagData((post as IPost).tags, post))
          .then(post => {
            if (this.state.refreshConfig.siblings !== RefreshLevel.Never) this.getSiblings(seq, post as IPost);
          })
          .then(() => {
            this.onReady(seq, null);
          })
          .catch(err => {
            console.log(err);
            if (err.message !== '404') this.onReady(seq, this.fetchData);
          })
      );
    } else {
      this.setState({ ready: false, error: null }, seq, () =>
        this.fetchPosts(seq, this.state.page)
          .then(posts => {
            let categories: number[] = [];
            posts.forEach((post: IPost) => {
              categories = categories.concat(post.categories);
            });
            return this.fetchCategoryData(categories, posts);
          })
          .then(posts => {
            let tags: number[] = [];
            (posts as IPost[]).forEach((post: IPost) => {
              tags = tags.concat(post.tags);
            });
            return this.fetchTagData(tags, posts);
          })
          .then(data => {
            this.onReady(seq, null);
            return data;
          })
          .catch(err => {
            console.log(err);
            if (err.message !== '404') this.onReady(seq, this.fetchData);
          })
      );
    }
  }

  private getSiblings(seq: number, post: IPost): IPost {
    const siblings: ISiblings = {
      prev: undefined,
      prevOffset: this.query.offset - 1,
      next: undefined,
      nextOffset: this.query.offset + 1,
    };

    // has query
    if (this.query.offset !== null) {
      const page = Math.floor(this.query.offset / config.perPage) + 1;
      const j = this.query.offset % config.perPage;

      // has cache
      if (this.indexes[this.query.key]) {
        // need to look at previous page
        if (j === 0) {
          // no previous page, no need any more
          if (page === 1) siblings.prev = null;
          // try previous page
          else {
            const prevPage = this.indexes[this.query.key].posts[page - 1];
            if (prevPage && prevPage.length) {
              siblings.prev = this.posts[prevPage[prevPage.length - 1].slug];
            }
          }
        }
        // need to look at next page
        if (j === config.perPage - 1) {
          // no next page, no need any more
          if (page === this.indexes[this.query.key].totalPage) siblings.next = null;
          // try next page
          else {
            const nextPage = this.indexes[this.query.key].posts[page + 1];
            if (nextPage && nextPage.length) {
              siblings.next = this.posts[nextPage[0].slug];
            }
          }
        }
        // look at current page
        const currPage = this.indexes[this.query.key].posts[page];
        if (currPage && currPage.length) {
          siblings.prev = j > 0 ? this.posts[currPage[j - 1].slug] : siblings.prev;
          siblings.next = j < currPage.length - 1 ? this.posts[currPage[j + 1].slug] : siblings.next;
        }
      }
    }

    if (this.state.refreshConfig.siblings === RefreshLevel.Always || siblings.prev === undefined) {
      const params: IQueryParams = Object.assign({}, this.query.params);
      params.per_page = 1;
      params.after = post.date;
      params.order = 'asc';
      honoka.get('/posts', {
        data: params,
      })
        .then(data => {
          if (!data.length) siblings.prev = null;
          else {
            this.posts[data[0].slug] = data[0];
            siblings.prev = data[0];
          }
          this.setState({ siblings }, seq);
        })
        .catch(err => {
          console.log(err);
        });
    }
    if (this.state.refreshConfig.siblings === RefreshLevel.Always || siblings.next === undefined) {
      const params = Object.assign({}, this.query.params);
      params.per_page = 1;
      params.before = post.date;
      honoka.get('/posts', {
        data: params,
      })
        .then(data => {
          if (!data.length) siblings.next = null;
          else {
            this.posts[data[0].slug] = data[0];
            siblings.next = data[0];
          }
          this.setState({ siblings }, seq);
        })
        .catch(err => {
          console.log(err);
        });
    }
    this.setState({ siblings }, seq);
    return post;
  }

  private fetchPosts(seq: number, page: number): Promise<IPost[]> {
    const params = this.buildAndUpdateQuery();
    const query = this.query.key;
    let cached = false;
    let cachedData: IPost[];
    if (this.indexes[query] && this.indexes[query].posts[page]) {
      cachedData = this.indexes[query].posts[page].map((index: IPost) => {
        const post = this.posts[index.slug];
        post.offset = index.offset;
        return post;
      });
      this.setState({ posts: cachedData, totalPage: this.indexes[query].totalPage },
        seq, () => {
          if (this.state.refreshConfig.commentCounts !== RefreshLevel.Never) this.fetchCommentCounts(seq, cachedData);
        });
      if (this.state.refreshConfig.indexes === RefreshLevel.Cache) {
        return new Promise(resolve => {
          resolve(cachedData);
        });
      }
      cached = true;
    }
    params.page = page;
    const promise = fetch(honoka.defaults.baseURL + '/posts?' + urlEncode(params))
      .then(response => {
        const totalPage = +response.headers.get('x-wp-totalpages');
        this.setState({ totalPage }, seq);
        return response.json()
          .then(data => {
            data.forEach((post: IPost, i: number) => {
              if (this.posts[post.slug]) post.commentCount = this.posts[post.slug].commentCount;
              this.posts[post.slug] = post;
              post.offset = (page - 1) * config.perPage + i;
            });
            if (!this.indexes[query]) this.indexes[query] = { posts: {}, totalPage: 0 };
            this.indexes[query].totalPage = totalPage;
            this.indexes[query].posts[page] = data.map((post: IPost) =>
              ({ slug: post.slug, offset: post.offset }));
            this.setState({
              posts: data,
            }, seq, () => {
              if (this.state.refreshConfig.commentCounts !== RefreshLevel.Never) this.fetchCommentCounts(seq, data);
            });
            return data;
          });
      });
    if (cached) {
      return new Promise(resolve => {
        resolve(cachedData);
      });
    } else {
      return promise;
    }
  }

  private fetchPostData(seq: number, slug: string): Promise<IPost> {
    let cached = false;
    if (this.posts[slug]) {
      this.setState({ post: this.posts[slug] }, seq);
      if (this.state.refreshConfig.posts === RefreshLevel.Cache) {
        return new Promise(resolve => {
          resolve(this.posts[slug]);
        });
      }
      cached = true;
    }
    const promise = honoka.get('/posts', {
      data: {
        slug,
      },
    })
      .then(data => {
        const post = data.length === 0 ? null : data[0];
        if (post === null) {
          this.onReady(seq, 404);
          throw new Error('404');
        }
        return post;
      })
      .then(post => {
        this.posts[post.slug] = post;
        if (this.state.params.slug === post.slug) this.setState({ post }, seq);
        if (this.state.refreshConfig.commentCounts !== RefreshLevel.Never) this.fetchCommentCount(seq, post);
        return post;
      });
    if (cached) {
      return new Promise(resolve => {
        resolve(this.posts[slug]);
      });
    } else {
      return promise;
    }
  }

  private fetchCommentCounts(seq: number, posts: IPost[]): Promise<IPost[]> {
    let promise = new Promise((resolve) => {
      resolve();
    });
    for (const post of posts) {
      if (post.commentCount !== undefined && this.state.refreshConfig.commentCounts === RefreshLevel.Cache) continue;
      promise = promise.then(() => this.fetchCommentCount(seq, post));
    }
    return promise.then(() =>
      posts);
  }

  private fetchCommentCount(seq: number, post: IPost): Promise<IPost> {
    return fetch(honoka.defaults.baseURL + '/comments?' + urlEncode({
      post: post.id,
      per_page: 1,
    }))
      .then(response => {
        const total = +response.headers.get('x-wp-total');
        post.commentCount = total;
        this.posts[post.slug].commentCount = total;
        if (this.state.post !== null && this.state.post.slug === post.slug) this.setState({ post }, seq);
        else if (this.state.posts !== null) {
          this.setState({
            posts: this.state.posts.map(p =>
              p.id === post.id ? post : p),
          }, seq);
        }
        return post;
      });
  }

  private fetchCategoryData(cats: number[], o: IPost | IPost[]): IPost | IPost[] | Promise<IPost | IPost[]> {
    let flag = true;
    for (const cat of cats) {
      if (!this.categories[cat]) {
        flag = false;
        break;
      }
    }
    if (flag && this.state.refreshConfig.categories === RefreshLevel.Cache) return o;
    return honoka.get('/categories', {
      data: {
        include: cats.join(','),
        per_page: 100,
      },
    })
      .then(data => {
        data.forEach((cat: WP.Category) => {
          this.categories[cat.id] = cat;
        });
        return o;
      });
  }

  private fetchTagData(tags: number[], o: IPost | IPost[]): IPost | IPost[] | Promise<IPost | IPost[]> {
    if (tags.length === 0) {
      return o;
    }
    let flag = true;
    for (const tag of tags) {
      if (!this.tags[tag]) {
        flag = false;
        break;
      }
    }
    if (flag && this.state.refreshConfig.tags === RefreshLevel.Cache) return o;
    return honoka.get('/tags', {
      data: {
        include: tags.join(','),
        per_page: 100,
      },
    })
      .then(data => {
        data.forEach((tag: WP.Tag) => {
          this.tags[tag.id] = tag;
        });
        return o;
      });
  }

  private renderPost(post: IPost, fold: boolean) {
    const categories = post.categories.filter(cate =>
      this.categories[cate]).map(cate =>
      <Link key={this.categories[cate].slug} className="category-link"
            to={`/category/${this.categories[cate].slug}`}>{this.categories[cate].name}</Link>);
    const tags = post.tags.filter(tag =>
      this.tags[tag]).map(tag =>
      <Link key={this.tags[tag].slug} className="tag-link"
            to={`/tag/${this.tags[tag].slug}`}>{this.tags[tag].name}</Link>);
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
    const setPostOffset = () => {
      if (post.offset) this.query.offset = post.offset;
    };
    const setNextOffset = () => {
      if (this.state.siblings) this.query.offset = this.state.siblings.nextOffset;
    };
    const setPrevOffset = () => {
      if (this.state.siblings) this.query.offset = this.state.siblings.prevOffset;
    };
    return fold ? (
      <div className="post">
        <Link className="post-title-link" to={`/${post.slug}`}
              onClick={setPostOffset}>
          <h1 className="title fee page-control" dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
        </Link>
        <div className="content page-control">
          <div className="post-content" dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }} />
        </div>
        <div className="info eef page-control">
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
      </div>
    ) : (
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
          this.state.siblings ?
            <div className="info eef sibling page-control">
              {
                // next on the list (i.e. older published)
                this.state.siblings.next === null ?
                  <span>已经是第一篇了</span> : this.state.siblings.next ?
                  <span>上一篇：<Link to={`/${this.state.siblings.next.slug}`}
                                  onClick={setNextOffset}
                                  dangerouslySetInnerHTML={{ __html: this.state.siblings.next.title.rendered }} />
                  </span> :
                  <span>上一篇：加载中 {InlineLoader} </span>
              }
              {
                // previous on the list (i.e. newer published)
                this.state.siblings.prev === null ?
                  <span>已经是最后一篇了</span> : this.state.siblings.prev ?
                  <span>
                    下一篇：<Link to={`/${this.state.siblings.prev.slug}`}
                              onClick={setPrevOffset}
                              dangerouslySetInnerHTML={{ __html: this.state.siblings.prev.title.rendered }} />
                  </span> :
                  <span>下一篇：加载中 {InlineLoader} </span>
              }
            </div> : ''
        }
      </div>
    );
  }

  private renderPagination() {
    if (this.state.totalPage === 1) return '';
    let slug = '';
    if (this.state.params.category) slug += `/category/${this.state.params.category}`;
    else if (this.state.params.tag) slug += `/tag/${this.state.params.tag}`;
    return (
      <div className="page-container pagination">
        <div className="nav-links">
          {
            this.state.page > 1 ?
              <Link className="prev" to={`${slug}/page/${this.state.page - 1}`}><i
                className="fas fa-chevron-left" /></Link>
              : ''
          }
          {
            this.state.page > 3 ?
              <Link className="page-number" to={`${slug}/page/1`}>1</Link>
              : ''
          }
          {
            this.state.page > 4 ?
              <span className="space">…</span>
              : ''
          }
          {
            this.state.page > 2 ?
              <Link className="page-number" to={`${slug}/page/${this.state.page - 2}`}>{this.state.page - 2}</Link>
              : ''
          }
          {
            this.state.page > 1 ?
              <Link className="page-number" to={`${slug}/page/${this.state.page - 1}`}>{this.state.page - 1}</Link>
              : ''
          }
          <span className="page-number current">{this.state.page}</span>
          {
            this.state.page < this.state.totalPage ?
              <Link className="page-number" to={`${slug}/page/${this.state.page + 1}`}>{this.state.page + 1}</Link>
              : ''
          }
          {
            this.state.page + 1 < this.state.totalPage ?
              <Link className="page-number" to={`${slug}/page/${this.state.page + 2}`}>{this.state.page + 2}</Link>
              : ''
          }
          {
            this.state.page + 3 < this.state.totalPage ?
              <span className="space">…</span>
              : ''
          }
          {
            this.state.page + 2 < this.state.totalPage ?
              <Link className="page-number" to={`${slug}/page/${this.state.totalPage}`}>{this.state.totalPage}</Link>
              : ''
          }
          {
            this.state.page < this.state.totalPage ?
              <Link className="next" to={`${slug}/page/${this.state.page + 1}`}><i
                className="fas fa-chevron-right" /></Link>
              : ''
          }
        </div>
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
    if (this.state.params.slug) {
      if (!this.state.post) {
        return <NotFound />;
      }
      return (
        <div className="container page post">
          <div className="page-container">
            {this.renderPost(this.state.post, false)}
          </div>
          {
            this.state.post.comment_status === 'open' && this.state.refreshConfig.comments !== RefreshLevel.Never ?
              <Comments id={this.state.post.id} />
              : ''
          }
        </div>
      );
    }
    if (this.state.posts === null) {
      return <NotFound />;
    }
    return (
      <div className="container page">
        {
          this.state.posts.map(post =>
            <div key={post.id} className="page-container">
              {this.renderPost(post, true)}
            </div>)
        }
        {this.renderPagination()}
      </div>
    );
  }
}

export default Post;

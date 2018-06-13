import honoka from 'honoka';
import React, { Component } from 'react';
import ReactRouter, { Link } from 'react-router-dom';
import * as WP from 'wordpress';

import { post as config } from '../config';
import '../styles/Post.css';
import '../styles/PostContent.css';
import '../styles/themes/orange-cheers.css';
import { formatDate, human } from '../utils/datetime';
import urlEncode from '../utils/url';

import Comments from './Comments';
import { FullPageLoader as Loader, InlineLoader } from './Loader';
import NotFound from './NotFound';
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
  offset: number;
}

interface IIndex {
  posts: { [key: string]: WP.Post[]; };
  totalPage: number;
}

interface ISiblings {
  prev: undefined | null | WP.Post;
  prevOffset: number;
  next: undefined | null | WP.Post;
  nextOffset: number;
}

interface IParams {
  page?: number;
  slug?: string;
  category?: string;
  tag?: string;
  search?: string;
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
  post: null | WP.Post;
  posts: null | WP.Post[];
  category: null | number[];
  tag: null | number[];
  siblings: null | ISiblings;
  error: (() => void) | null;
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
};

class Post extends Component<IPostProps, IPostState> {

  private categories: { [key: number]: WP.Category; };
  private tags: { [key: number]: WP.Tag; };
  private posts: { [key: string]: WP.Post; };
  private indexes: { [key: string]: IIndex; };
  private query: IQuery;

  constructor(props: IPostProps) {
    super(props);
    const state = initialState;
    state.params = props.match.params;
    state.page = +props.match.params.page || 1;
    this.state = state;
    this.categories = {};
    this.tags = {};
    this.posts = {};
    this.indexes = {};
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
    document.onreadystatechange = () => {
      if (document.readyState === 'complete') {
        if (this.state.ready) this.props.doneProgress();
        else this.props.joinProgress();
      }
    };
    this.update();
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
    this.setState({ params: nextProps.match.params, page }, this.update);
  }

  private onReady(error: any): void {
    if (error === null) this.setState({ ready: true, error: null }, (window as any).initMonacoEditor);
    else if (typeof error === 'function') this.setState({ ready: true, error });
    else this.setState({ ready: true });
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
    this.query = { key: query, params, offset: 0 };
    return Object.assign({}, params);
  }

  private update(): void {
    this.challengeParams()
      .then(() => this.fetchData());
  }

  private challengeParams(): Promise<void> {
    let promise = new Promise<void>((resolve, reject) => {
      resolve();
    });
    if (this.state.params.slug) return promise;
    if (this.state.params.category) {
      promise = promise.then(() => honoka.get('/categories', {
        data: {
          slug: this.state.params.category,
        },
      })
        .then(data => {
          const cat = data.length === 0 ? null : data[0];
          if (cat === null) {
            this.onReady(404);
            throw new Error('404');
          }
          this.setState({ category: cat.id });
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
            this.onReady(404);
            throw new Error('404');
          }
          this.setState({ tag: tag.id });
          this.props.setTyped(tag.name);
        }));
    }
    return promise;
  }

  private fetchData() {
    if (this.state.params.slug) {
      this.setState({ ready: false, error: null }, () =>
        this.fetchPostData(this.state.params.slug)
          .then(post => this.fetchCategoryData(post.categories, post))
          .then(post => this.fetchTagData((post as WP.Post).tags, post))
          .then(post => this.getSiblings(post as WP.Post))
          .then(() => {
            this.onReady(null);
          })
          .catch(err => {
            console.log(err);
            if (err.message !== '404') this.onReady(this.fetchData);
          })
      );
    } else {
      this.setState({ ready: false, error: null }, () =>
        this.fetchPosts(this.state.page)
          .then(posts => {
            let categories: number[] = [];
            posts.forEach((post: WP.Post) => {
              categories = categories.concat(post.categories);
            });
            return this.fetchCategoryData(categories, posts);
          })
          .then(posts => {
            let tags: number[] = [];
            (posts as WP.Post[]).forEach((post: WP.Post) => {
              tags = tags.concat(post.tags);
            });
            return this.fetchTagData(tags, posts);
          })
          .then(data => {
            this.onReady(null);
            return data;
          })
          .catch(err => {
            console.log(err);
            if (err.message !== '404') this.onReady(this.fetchData);
          })
      );
    }
  }

  private getSiblings(post: WP.Post): WP.Post {
    if (!this.query) return post;
    const siblings: ISiblings = {
      prev: undefined,
      prevOffset: this.query.offset - 1,
      next: undefined,
      nextOffset: this.query.offset + 1,
    };
    const page = Math.floor(this.query.offset / config.perPage) + 1;
    const j = this.query.offset % config.perPage;

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

    if (siblings.prev === undefined) {
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
          this.setState({ siblings });
        })
        .catch(err => {
          console.log(err);
        });
    }
    if (siblings.next === undefined) {
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
          this.setState({ siblings });
        })
        .catch(err => {
          console.log(err);
        });
    }
    this.setState({ siblings });
    return post;
  }

  private fetchPosts(page: number): Promise<WP.Post[]> {
    const params = this.buildAndUpdateQuery();
    const query = this.query.key;
    if (this.indexes[query] && this.indexes[query].posts[page]) {
      const data = this.indexes[query].posts[page].map((index: WP.Post) => {
        const post = this.posts[index.slug];
        post.offset = index.offset;
        return post;
      });
      this.setState({ posts: data, totalPage: this.indexes[query].totalPage });
      return new Promise(resolve => {
        resolve(data);
      });
    }
    params.page = page;
    return fetch(honoka.defaults.baseURL + '/posts?' + urlEncode(params))
      .then(response => {
        const totalPage = +response.headers.get('x-wp-totalpages');
        this.setState({ totalPage });
        return response.json()
          .then(data => {
            data.forEach((post: WP.Post, i: number) => {
              this.posts[post.slug] = post;
              post.offset = (page - 1) * config.perPage + i;
            });
            if (!this.indexes[query]) this.indexes[query] = { posts: {}, totalPage: 0 };
            this.indexes[query].totalPage = totalPage;
            this.indexes[query].posts[page] = data.map((post: WP.Post) =>
              ({ slug: post.slug, offset: post.offset }));
            this.setState({
              posts: data,
            }, () => this.fetchCommentCounts(data));
            return data;
          });
      });
  }

  private fetchPostData(slug: string): Promise<WP.Post> {
    if (this.posts[slug]) {
      this.setState({ post: this.posts[slug] });
      return new Promise(resolve => {
        resolve(this.posts[slug]);
      });
    }
    return honoka.get('/posts', {
      data: {
        slug,
      },
    })
      .then(data => {
        const post = data.length === 0 ? null : data[0];
        if (post === null) {
          this.onReady(404);
          throw new Error('404');
        }
        return post;
      })
      .then(post => {
        this.posts[post.slug] = post;
        if (this.state.params.slug === post.slug) this.setState({ post });
        this.fetchCommentCount(post);
        return post;
      });
  }

  private fetchCommentCounts(posts: WP.Post[]): Promise<WP.Post[]> {
    let promise = new Promise((resolve, reject) => {
      resolve();
    });
    for (const post of posts) {
      promise = promise.then(() => this.fetchCommentCount(post));
    }
    return promise.then(() =>
      posts);
  }

  private fetchCommentCount(post: WP.Post): Promise<WP.Post> {
    return fetch(honoka.defaults.baseURL + '/comments?' + urlEncode({
      post: post.id,
      per_page: 1,
    }))
      .then(response => {
        const total = +response.headers.get('x-wp-total');
        post.commentCount = total;
        this.posts[post.slug].commentCount = total;
        if (this.state.post !== null && this.state.post.slug === post.slug) this.setState({ post });
        else if (this.state.posts !== null) {
          this.setState({
            posts: this.state.posts.map(p =>
              p.id === post.id ? post : p),
          });
        }
        return post;
      });
  }

  private fetchCategoryData(cats: number[], o: WP.Post | WP.Post[]): WP.Post | WP.Post[] | Promise<WP.Post | WP.Post[]> {
    let flag = true;
    for (const cat of cats) {
      if (!this.categories[cat]) {
        flag = false;
        break;
      }
    }
    if (flag) return o;
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

  private fetchTagData(tags: number[], o: WP.Post | WP.Post[]): WP.Post | WP.Post[] | Promise<WP.Post | WP.Post[]> {
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
    if (flag) return o;
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

  private renderPost(post: WP.Post, fold: boolean) {
    const categories = post.categories.filter(cate =>
      this.categories[cate]).map(cate =>
      <Link key={this.categories[cate].slug} className="category-link"
            to={`/category/${this.categories[cate].slug}`}>{this.categories[cate].name}</Link>);
    const tags = post.tags.filter(tag =>
      this.tags[tag]).map(tag =>
      <Link key={this.tags[tag].slug} className="tag-link"
            to={`/tag/${this.tags[tag].slug}`}>{this.tags[tag].name}</Link>);
    let commentCount;
    if (post.commentCount === undefined) {
      commentCount =
        <span className="fas fa-comments">评论数拉取中 {InlineLoader}</span>;
    } else {
      commentCount = post.commentCount === 0 ? '还没有评论耶' : post.commentCount === 1 ?
        `${post.commentCount} 条评论` : `${post.commentCount} 条评论`;
      commentCount =
        <span className="fas fa-comments"><Link to={`/${post.slug}#Comments`}>{commentCount}</Link></span>;
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
            this.state.post.comment_status === 'open' ?
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

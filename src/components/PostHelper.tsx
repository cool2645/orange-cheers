import honoka from 'honoka';
import React, { Component, ComponentType } from 'react';
import * as WP from 'wordpress';

import urlEncode from '../utils/url';

import { IRefreshConfig, RefreshLevel } from './Settings';

interface IQueryParams {
  per_page: number;
  categories?: number[] | number;
  tags?: number[] | number;
  search?: string;

  page?: number;

  after?: string;
  before?: string;
  order?: string;
}

interface IIndex {
  pages: { [key: number]: IPostIndex[] };
  totalPage: number;
}

interface IPostIndex {
  slug: string;
  offset: number;
}

export interface IPost extends WP.Post {
  commentCount?: number;
}

interface IPostData {
  post: IPost;
  categories?: WP.Category[];
  tags?: WP.Tag[];
  siblings?: ISiblings;
  offset?: number;
}

interface IPostsData {
  posts: IPostData[];
  totalPage: number;
}

interface ISiblings {
  prev: undefined | null | IPostData;
  next: undefined | null | IPostData;
}

interface IViewComponentProps {
  data: null | IPostData | IPostsData;

  getPostsData(params: IQueryParams, page: number, append?: boolean,
               onready?: (res: any) => any, onupdated?: (res: any) => any): void;

  getPostData(slug: string, params?: IQueryParams, offset?: number,
              onready?: (res: any) => any, onupdated?: (res: any) => any): void;

  fetchCategories(filter?: number[]): Promise<{ [key: number]: WP.Category }>;

  fetchTags(filter?: number[]): Promise<{ [key: number]: WP.Tag }>;
}

interface IPostHelperState {
  refreshConfig: IRefreshConfig;
  data: null | IPostData | IPostsData;
}

function withPost<P extends IViewComponentProps>(ViewComponent: ComponentType<IViewComponentProps>) {
  return class PostHelper extends Component<P, IPostHelperState> {

    private categories: { [key: number]: WP.Category };
    private tags: { [key: number]: WP.Tag };
    private posts: { [key: string]: IPost };
    private indexes: { [key: string]: IIndex };
    private seq: number;

    public setState<K extends keyof IPostHelperState>(
      newState: ((prevState: Readonly<IPostHelperState>) =>
          (Pick<IPostHelperState, K> | IPostHelperState | null))
        | (Pick<IPostHelperState, K> | IPostHelperState | null),
      seq?: number | (() => void),
      callback?: () => void
    ): void {
      if (typeof seq !== 'number') super.setState(newState, seq);
      else if (seq === this.seq) super.setState(newState, callback);
    }

    constructor(props: P) {
      super(props);
      this.seq = 0;
      this.state = {
        refreshConfig: JSON.parse(localStorage.refreshConfig),
        data: null,
      };
    }

    public componentDidMount() {
      const refreshConfig = JSON.parse(localStorage.refreshConfig);
      this.categories = localStorage.categories ? JSON.parse(localStorage.categories) : {};
      this.tags = localStorage.tags ? JSON.parse(localStorage.tags) : {};
      this.posts = localStorage.posts ? JSON.parse(localStorage.posts) : {};
      this.indexes = localStorage.indexes ? JSON.parse(localStorage.indexes) : {};
      this.setState({ refreshConfig });
    }

    public componentWillUnmount() {
      localStorage.categories = JSON.stringify(this.categories);
      localStorage.tags = JSON.stringify(this.tags);
      localStorage.posts = JSON.stringify(this.posts);
      localStorage.indexes = JSON.stringify(this.indexes);
      this.seq++;
    }

    // fetch given categories, return an object whose keys are values in filter
    // if no category given, fetch categories with most posts, return an array of results
    public fetchCategories = async (filter?: number[])
      : Promise<{ [key: number]: WP.Category } | WP.Category[]> => {
      const params = {
        per_page: 100,
        orderby: 'count',
        order: 'desc',
      };
      let cached = true;
      if (filter !== undefined) {
        const cats = [];
        for (const id of filter) {
          if (!this.categories[id]) {
            cached = false;
            cats.push(id);
          }
        }
        (params as any).include = cats.join(',');
      } else cached = false;
      if (cached && this.state.refreshConfig.categories === RefreshLevel.Cache) {
        const categories = {};
        filter.forEach(id => categories[id] = this.categories[id]);
        return categories;
      }
      const data = await honoka.get('/categories', {
        data: params,
      });
      data.forEach((cat: WP.Category) => {
        this.categories[cat.id] = cat;
      });
      if (filter) {
        const categories = {};
        filter.forEach(id => categories[id] = this.categories[id]);
        return categories;
      }
      return data;
    }

    // fetch given tags, return an object whose keys are values in filter
    // if no tags given, fetch tags with most posts, return an array of results
    public fetchTags = async (filter?: number[]): Promise<{ [key: number]: WP.Tag } | WP.Tag[]> => {
      const params = {
        per_page: 100,
        orderby: 'count',
        order: 'desc',
      };
      let cached = true;
      if (filter !== undefined) {
        const tags = [];
        for (const id of filter) {
          if (!this.tags[id]) {
            cached = false;
            tags.push(id);
          }
        }
        (params as any).include = tags.join(',');
      } else cached = false;
      if (cached && this.state.refreshConfig.tags === RefreshLevel.Cache) {
        const tags = {};
        filter.forEach(id => tags[id] = this.tags[id]);
        return tags;
      }
      const data = await honoka.get('/tags', {
        data: params,
      });
      data.forEach((tag: WP.Tag) => {
        this.tags[tag.id] = tag;
      });
      if (filter) {
        const tags = {};
        filter.forEach(id => tags[id] = this.tags[id]);
        return tags;
      }
      return data;
    }

    // fetch given post's comment count
    // update data state of corresponding post
    private fetchCommentCount = async (seq: number, post: IPost): Promise<IPost> => {
      if (post.commentCount !== undefined
        && this.state.refreshConfig.commentCounts === RefreshLevel.Cache) {
        return post;
      }
      const response = await fetch(honoka.defaults.baseURL + '/comments?' + urlEncode({
        post: post.id,
        per_page: 1,
      }));
      const total = +response.headers.get('x-wp-total');
      post.commentCount = total;
      this.posts[post.slug].commentCount = total;
      if (seq === this.seq && (this.state.data as IPostsData).totalPage) {
        this.setState({
          data: {
            posts: (this.state.data as IPostsData).posts.map(p =>
              p.post.id === post.id ? {
                post,
                offset: p.offset,
                siblings: p.siblings,
                categories: p.categories,
                tags: p.tags,
              } : p),
            totalPage: (this.state.data as IPostsData).totalPage,
          },
        }, seq);
      } else if (seq === this.seq
        && (this.state.data as IPostData).post
        && (this.state.data as IPostData).post.slug === post.slug) {
        this.setState({
          data: {
            post,
            siblings: (this.state.data as IPostData).siblings,
            offset: (this.state.data as IPostData).offset,
            categories: (this.state.data as IPostData).categories,
            tags: (this.state.data as IPostData).tags,
          },
        }, seq);
      }
      return post;
    }

    // fetch given posts' comment count
    // update data state of corresponding posts
    private fetchCommentCounts = async (seq: number, posts: IPost[]): Promise<IPost[]> => {
      for (const post of posts) {
        if (post.commentCount !== undefined
          && this.state.refreshConfig.commentCounts === RefreshLevel.Cache) continue;
        await this.fetchCommentCount(seq, post);
      }
      return posts;
    }

    // fetch post from cache
    // return post if succeed
    // return null if fail
    private fetchPostFromCache = async (slug: string): Promise<null | IPost> => {
      if (this.posts[slug]) {
        return this.posts[slug];
      }
      return null;
    }

    // fetch post
    private fetchPost = async (slug: string): Promise<IPost> => {
      const data = await honoka.get('/posts', {
        data: {
          slug,
        },
      });
      const post = data.length === 0 ? null : data[0];
      if (post === null) {
        throw new Error('404');
      }
      this.posts[post.slug] = post;
      return post;
    }

    // fetch posts from cache
    // return posts if succeed
    // return null if fail
    private fetchPostsFromCache = async (page: number,
                                         params: IQueryParams): Promise<null | IPostsData> => {
      const query = urlEncode(params);
      if (this.indexes[query] && this.indexes[query].pages[page]) {
        const cachedData: IPostData[] = this.indexes[query].pages[page].map((index: IPostIndex) => (
          { post: this.posts[index.slug], offset: index.offset }
        ));
        return { posts: cachedData, totalPage: this.indexes[query].totalPage };
      }
      return null;
    }

    // fetch posts
    private fetchPosts = async (page: number, params: IQueryParams): Promise<IPostsData> => {
      const query = urlEncode(params);
      params.page = page;
      const response = await fetch(honoka.defaults.baseURL + '/posts?' + urlEncode(params));
      const totalPage = +response.headers.get('x-wp-totalpages');
      const data = await response.json();
      const postsData: IPostsData = { posts: [], totalPage };
      data.forEach((post: IPost, i: number) => {
        if (this.posts[post.slug]) post.commentCount = this.posts[post.slug].commentCount;
        this.posts[post.slug] = post;
        postsData.posts.push({
          post,
          offset: (page - 1) * params.per_page + i,
        });
      });
      if (!this.indexes[query]) this.indexes[query] = { pages: {}, totalPage: 0 };
      this.indexes[query].totalPage = totalPage;
      this.indexes[query].pages[page] = postsData.posts.map((post: IPostData) =>
        ({ slug: post.post.slug, offset: post.offset }));
      return postsData;
    }

    // fetch given post's siblings
    // update data state of corresponding post
    private fetchSiblings = (seq: number, post: IPostData,
                             params: IQueryParams, offset?: number): IPostData => {
      const key = urlEncode(params);
      post.siblings = {
        prev: undefined,
        next: undefined,
      };
      const siblings = post.siblings;

      // has query
      if (offset !== undefined) {
        const page = Math.floor(offset / params.per_page) + 1;
        const j = offset % params.per_page;

        // has cache
        if (this.indexes[key]) {
          // need to look at previous page
          if (j === 0) {
            // no previous page, no need any more
            if (page === 1) siblings.prev = null;
            // try previous page
            else {
              const prevPage = this.indexes[key].pages[page - 1];
              if (prevPage && prevPage.length) {
                siblings.prev = {
                  post: this.posts[prevPage[prevPage.length - 1].slug],
                  offset: offset - 1,
                };
              }
            }
          }
          // need to look at next page
          if (j === params.per_page - 1) {
            // no next page, no need any more
            if (page === this.indexes[key].totalPage) siblings.next = null;
            // try next page
            else {
              const nextPage = this.indexes[key].pages[page + 1];
              if (nextPage && nextPage.length) {
                siblings.next = { post: this.posts[nextPage[0].slug], offset: offset + 1 };
              }
            }
          }
          // look at current page
          const currPage = this.indexes[key].pages[page];
          if (currPage && currPage.length) {
            siblings.prev = j > 0
              ? { post: this.posts[currPage[j - 1].slug], offset: offset - 1 }
              : siblings.prev;
            siblings.next = j < currPage.length - 1 ? {
              post: this.posts[currPage[j + 1].slug],
              offset: offset + 1,
            } : siblings.next;
          }
        }
      }

      if (this.state.refreshConfig.siblings === RefreshLevel.Always || siblings.prev === undefined) {
        const p1 = Object.assign({}, params);
        p1.per_page = 1;
        p1.after = post.post.date;
        p1.order = 'asc';
        honoka.get('/posts', {
          data: p1,
        })
          .then(data => {
            if (!data.length) siblings.prev = null;
            else {
              this.posts[data[0].slug] = data[0];
              siblings.prev = { post: data[0] };
            }
            if ((this.state.data as IPostData).post
              && (this.state.data as IPostData).post.slug === post.post.slug) {
              this.setState({ data: post }, seq);
            }
          })
          .catch(err => {
            console.log(err);
          });
      }
      if (this.state.refreshConfig.siblings === RefreshLevel.Always || siblings.next === undefined) {
        const p2 = Object.assign({}, params);
        p2.per_page = 1;
        p2.before = post.post.date;
        honoka.get('/posts', {
          data: p2,
        })
          .then(data => {
            if (!data.length) siblings.next = null;
            else {
              this.posts[data[0].slug] = data[0];
              siblings.next = { post: data[0] };
            }
            if ((this.state.data as IPostData).post
              && (this.state.data as IPostData).post.slug === post.post.slug) {
              this.setState({ data: post }, seq);
            }
          })
          .catch(err => {
            console.log(err);
          });
      }
      if ((this.state.data as IPostData).post
        && (this.state.data as IPostData).post.slug === post.post.slug) {
        this.setState({ data: post }, seq);
      }
      return post;
    }

    private afterGetPosts = async (posts: IPostsData, seq: number,
                                   append?: boolean, callback?: (err: any) => any) => {
      let cats: number[] = [];
      posts.posts.forEach((post: IPostData) => {
        cats = cats.concat(post.post.categories);
      });
      try {
        const categories = await this.fetchCategories(cats);
        posts.posts.forEach((post: IPostData) => {
          post.categories = post.post.categories.map(id => categories[id]);
        });
        let ts: number[] = [];
        posts.posts.forEach((post: IPostData) => {
          ts = ts.concat(post.post.tags);
        });
        const tags = await this.fetchTags(ts);
        posts.posts.forEach((post: IPostData) => {
          post.tags = post.post.tags.map(id => tags[id]);
        });
        const ps = posts.posts;
        if (append && (this.state.data as IPostsData).posts) {
          posts.posts = [...(this.state.data as IPostsData).posts, ...ps];
        }
        this.setState({ data: posts }, seq, () => {
          if (callback) callback(null);
          this.fetchCommentCounts(seq, ps.map(postData => postData.post));
        });
      } catch (err) {
        console.log(err);
        if (callback) callback(err);
      }
    }

    // get posts as well as the dependencies and push them to data state
    // will call onready once get data, call onupdated after data updated against onready.
    public getPostsData = async (params: IQueryParams, page: number, append?: boolean,
                                 onready?: (err: any) => any, onupdated?: (err: any) => any) => {
      if (!append) this.seq++;
      const seq = this.seq;
      if (!append) this.setState({ data: null });
      params = Object.assign({}, params);
      try {
        let posts = await this.fetchPostsFromCache(page, params);
        if (posts === null) posts = await this.fetchPosts(page, params);
        else {
          if (this.state.refreshConfig.indexes === RefreshLevel.Always) {
            this.fetchPosts(page, params)
              .then(newPosts => this.afterGetPosts(newPosts, seq, append, onupdated))
              .catch(err => {
                console.log(err);
                if (onupdated) onupdated(err);
              });
          }
        }
        await this.afterGetPosts(posts, seq, append, onready);
      } catch (err) {
        console.log(err);
        if (onready) onready(err);
      }
    }

    private afterGetPost = async (postData: IPostData, seq: number, params?: IQueryParams,
                                  offset?: number, callback?: (err: any) => any) => {
      try {
        const categories = await this.fetchCategories(postData.post.categories);
        postData.categories = Object.values(categories);
        const tags = await this.fetchTags(postData.post.tags);
        postData.tags = Object.values(tags);
        this.setState({ data: postData }, seq, () => {
          if (callback) callback(null);
          this.fetchCommentCount(seq, postData.post);
          if (this.state.refreshConfig.siblings !== RefreshLevel.Never) this.fetchSiblings(seq, postData, params, offset);
        });
      } catch (err) {
        console.log(err);
        if (callback) callback(err);
      }
    }

    // get post as well as the dependencies and push it to data state
    // will call onready once get data, call onupdated after data updated against onready.
    public getPostData = async (slug: string, params?: IQueryParams, offset?: number,
                                onready?: (err: any) => any, onupdated?: (err: any) => any) => {
      this.seq++;
      const seq = this.seq;
      params = Object.assign({}, params);
      try {
        let post = await this.fetchPostFromCache(slug);
        if (post === null) post = await this.fetchPost(slug);
        else {
          if (this.state.refreshConfig.posts === RefreshLevel.Always) {
            this.fetchPost(slug)
              .then(newPost => ({ post: newPost, offset }))
              .then((newPostData: IPostData) => this.afterGetPost(newPostData, seq, params, offset, onupdated))
              .catch(err => {
                console.log(err);
                if (onupdated) onupdated(err);
              });
          }
        }
        const postData = { post, offset };
        await this.afterGetPost(postData, seq, params, offset, onready);
        document.querySelector('meta[name="description"]').setAttribute('content', post.excerpt.rendered);
      } catch (err) {
        console.log(err);
        if (onready) onready(err);
      }
    }

    public render() {
      return <ViewComponent
        data={this.state.data}
        getPostData={this.getPostData}
        getPostsData={this.getPostsData}
        fetchCategories={this.fetchCategories}
        fetchTags={this.fetchTags}
        {...this.props}
      />;
    }
  };
}

export { IQueryParams, IPostData, IPostsData, IViewComponentProps };
export default withPost;

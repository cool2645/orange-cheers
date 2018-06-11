import React, { Component } from 'react';
import '../styles/Post.css'
import '../styles/PostContent.css'
import '../styles/themes/orange-cheers.css'
import { Link } from 'react-router-dom'
import { FullPageLoader as Loader, InlineLoader } from './Loader'
import { post as config } from '../config'
import NotFound from "./404"
import Unreachable from "./000"
import honoka from 'honoka'
import { formatDate, human } from '../utils/datetime'
import urlEncode from '../utils/url'
import Comments from './Comments'

let initialState = {
  ready: false,
  post: null,
  posts: [],
  page: 1,
  totalPage: 0,
  params: null,
  error: null,
};

class Post extends Component {
  constructor(props) {
    super(props);
    this.state = initialState;
    this.state.params = props.match.params;
    this.state.page = +props.match.params.page || 1;
    this.categories = [];
    this.tags = [];
    this.fetchData = this.fetchData.bind(this);
    this.fetchPostData = this.fetchPostData.bind(this);
    this.fetchTagData = this.fetchTagData.bind(this);
    this.fetchCommentCount = this.fetchCommentCount.bind(this);
  }

  componentDidMount() {
    this.fetchData()
  }

  componentWillReceiveProps(nextProps) {
    this.setState(initialState);
    let page = nextProps.match.params.page || 1;
    this.setState({ params: nextProps.match.params, page: +page }, this.fetchData);
  }

  fetchData() {
    if (this.state.params.slug) this.setState({ ready: false, error: null }, () =>
      this.fetchPostData(this.state.params.slug)
        .then(post => this.fetchCategoryData(post.categories, post))
        .then(post => this.fetchTagData(post.tags, post))
        .then(post => this.fetchCommentCount(post))
        .then(() => {
          this.setState({ ready: true, error: null }, window.initMonacoEditor);
        })
        .catch(err => {
          console.log(err);
          if (err !== '404') this.setState({
            ready: true,
            error: this.fetchData
          })
        })
    );
    else this.setState({ ready: false, error: null }, () =>
      this.fetchPosts(this.state.page)
        .then(posts => {
          console.log(posts);
          let categories = [];
          posts.forEach(post => {
            categories = categories.concat(post.categories);
          });
          return this.fetchCategoryData(categories, posts)
        })
        .then(posts => {
          let tags = [];
          posts.forEach(post => {
            tags = tags.concat(post.tags);
          });
          return this.fetchTagData(tags, posts)
        })
        .then((data) => {
          this.setState({ ready: true, error: null }, window.initMonacoEditor);
          return data;
        })
        .then(data => this.fetchCommentCounts(data))
        .catch(err => {
          console.log(err);
          this.setState({
            ready: true,
            error: this.fetchData
          })
        })
    );
  }

  fetchPosts(page) {
    return fetch(honoka.defaults.baseURL + '/posts?' + urlEncode({
      page: page,
      per_page: config.perPage,
    })).then(response => {
      let totalPage = response.headers.get("x-wp-totalpages");
      this.setState({ totalPage: +totalPage });
      return response.json();
    })
      .then(data => {
        this.setState({ posts: data });
        return data;
      })
  }

  fetchPostData(slug) {
    return honoka.get('/posts', {
      data: {
        slug: slug
      }
    })
      .then(data => {
        let post = data.length === 0 ? null : data[0];
        if (post === null) {
          this.setState({ ready: true });
          throw "404";
        }
        return post
      })
      .then(post => {
        this.setState({ post: post });
        return post
      })
  }

  fetchCommentCounts(posts) {
    let promise = new Promise((resolve, reject) => {
      resolve();
    });
    for (let post of posts) {
      promise = promise.then(() => this.fetchCommentCount(post))
    }
    return promise.then(() => {
      return posts;
    })
  }

  fetchCommentCount(post) {
    return fetch(honoka.defaults.baseURL + '/comments?' + urlEncode({
      post: post.id,
      per_page: 1
    }))
      .then(response => {
        let total = response.headers.get("x-wp-total");
        post.commentCount = +total;
        if (this.state.post !== null) this.setState({ post: post });
        else {
          this.setState({
            posts: this.state.posts.map(p => {
              return p.id === post.id ? post : p;
            })
          })
        }
        return post
      })
  }

  fetchCategoryData(cats, o) {
    return honoka.get('/categories', {
      data: {
        include: cats.join(','),
      }
    })
      .then(data => {
        let categories = {};
        data.forEach(cat => {
          categories[cat.id] = cat
        });
        this.categories = categories;
        return o;
      })
  }

  fetchTagData(tags, o) {
    if (tags.length === 0) {
      return o;
    }
    return honoka.get('/tags', {
      data: {
        include: tags.join(','),
      }
    })
      .then(data => {
        let tags = {};
        data.forEach(tag => {
          tags[tag.id] = tag
        });
        this.tags = tags;
        return o;
      })
  }

  renderPost(post, fold) {
    const categories = post.categories.filter(cate => {
      return this.categories[cate]
    }).map(cate => {
      return <Link key={this.categories[cate].slug} className="category-link"
                   to={`/category/${this.categories[cate].slug}`}>{this.categories[cate].name}</Link>
    });
    const tags = post.tags.filter(tag => {
      return this.tags[tag]
    }).map(tag => {
      return <Link key={this.tags[tag].slug} className="tag-link"
                   to={`/tag/${this.tags[tag].slug}`}>{this.tags[tag].name}</Link>
    });
    let commentCount;
    if (post.commentCount === undefined) commentCount = <span className="fas fa-comments">评论数拉取中 {InlineLoader}</span>;
    else {
      commentCount = post.commentCount === 0 ? '还没有评论耶' : post.commentCount === 1 ?
        `${post.commentCount} 条评论` : `${post.commentCount} 条评论`;
      commentCount = <span className="fas fa-comments"><Link to={`/${post.slug}#Comments`}>{commentCount}</Link></span>;
    }
    const dateStr = formatDate(post.date_gmt + '.000Z');
    let date = [];
    date.push(<span key="date" className="fas fa-calendar">发表于 {dateStr}</span>);
    if (formatDate(post.modified_gmt + '.000Z') !== dateStr) {
      date.push(<span key="modified"
                      className="fas fa-pencil-alt">最后更新于 {human(post.modified_gmt + '.000Z')}</span>)
    }
    return fold ? (
      <div className="post">
        <Link className="post-title-link" to={`/${post.slug}`}>
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
          this.props.siblings ?
            <div className="info eef">
              <span>上一篇：<Link to="/">2018年美团在线笔试编程题解题报告</Link></span>
              <span>下一篇：<Link to="/">Windows下安装libsvm for Python</Link></span>
            </div> : ''
        }
      </div>
    )
  }

  renderPagination() {
    let slug = '';
    if (this.state.params.category) slug += `category/${this.state.params.category}`;
    else if (this.state.params.tag) slug += `tag/${this.state.params.tag}`;
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

  render() {
    if (!this.state.ready) {
      return (
        <div className="container page">
          <div className="page-container">
            {Loader}
          </div>
        </div>
      )
    }
    if (this.state.error) {
      return <Unreachable retry={this.state.error} />
    }
    if (this.state.params.slug) {
      if (!this.state.post) {
        return <NotFound />
      }
      return (
        <div className="container page">
          <div className="page-container">
            {this.renderPost(this.state.post, false)}
          </div>
          {
            this.state.post.comment_status === "open" ?
              <Comments id={this.state.post.id} />
              : ''
          }
        </div>
      );
    }
    return (
      <div className="container page">
        {
          this.state.posts.map(post => {
            return <div key={post.id} className="page-container">
              {this.renderPost(post, true)}
            </div>;
          })
        }
        {this.renderPagination()}
      </div>
    )
  }
}

export default Post;
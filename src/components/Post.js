import React, { Component } from 'react';
import '../styles/Post.css'
import '../styles/PostContent.css'
import '../styles/themes/orange-cheers.css'
import { Link } from 'react-router-dom'
import { FullPageLoader as Loader } from './Loader'
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
  error: null,
};

class Post extends Component {
  constructor(props) {
    super(props);
    this.state = initialState;
    this.state.params = props.match.params;
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
    this.setState({ params: nextProps.match.params }, this.fetchData);
  }

  fetchData() {
    if (this.state.params.slug) this.setState({ ready: false, error: null }, () =>
      this.fetchPostData(this.state.params.slug)
        .then((post) => this.fetchCategoryData(post.categories, post))
        .then((post) => this.fetchTagData(post.tags, post))
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
        .then((posts) => {
          let tags = [];
          posts.forEach(post => {
            tags = tags.concat(post.tags);
          });
          return this.fetchTagData(tags, posts)
        })
        .then(() => {
          this.setState({ ready: true, error: null }, window.initMonacoEditor);
        })
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
      totalPage = +totalPage;
      this.setState({ totalPage: totalPage });
      return response.json();
    })
      .then(data => this.fetchCommentCounts(data))
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
      .then(post => this.fetchCommentCount(post))
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
      return
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
                   to={`/categories/${this.categories[cate].slug}`}>{this.categories[cate].name}</Link>
    });
    const tags = post.tags.filter(tag => {
      return this.tags[tag]
    }).map(tag => {
      return <Link key={this.tags[tag].slug} className="tag-link"
                   to={`/tag/${this.tags[tag].slug}`}>{this.tags[tag].name}</Link>
    });
    let commentCount = post.commentCount === 0 ?
      '还没有评论耶' : post.commentCount === 1 ?
        `${post.commentCount} 条评论` : `${post.commentCount} 条评论`;
    commentCount = <Link to={`/${post.slug}#Comments`}>{commentCount}</Link>;
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
          <span className="fas fa-comments">{commentCount}</span>
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
          <span className="fas fa-comments">{commentCount}</span>
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
            return <div className="page-container">
              {this.renderPost(post, true)}
            </div>;
          })
        }
      </div>
    )
  }
}

export default Post;
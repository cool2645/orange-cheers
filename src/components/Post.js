import React, { Component } from 'react';
import '../styles/Post.css'
import '../styles/themes/orange-cheers.css'
import { Link } from 'react-router-dom'
import { FullPageLoader as Loader } from './Loader'
import NotFound from "./404"
import Unreachable from "./000"
import honoka from 'honoka'
import { formatDate, human } from '../utils/datetime'
import urlEncode from '../utils/url'
import Comments from './Comments'

class Post extends Component {
  constructor() {
    super();
    this.state = {
      ready: false,
      post: null,
      commentCount: 0,
      categories: [],
      tags: [],
      error: null,
    };
    this.fetchData = this.fetchData.bind(this);
    this.fetchPostData = this.fetchPostData.bind(this);
    this.fetchTagData = this.fetchTagData.bind(this);
    this.fetchCommentCount = this.fetchCommentCount.bind(this);
  }

  componentDidMount() {
    this.fetchData()
  }

  fetchData() {
    this.setState({ ready: false, error: null });
    this.fetchPostData(this.props.match.params.slug)
      .then(() => this.fetchCategoryData(this.state.post.categories))
      .then(() => this.fetchTagData(this.state.post.tags))
      .then(() => this.fetchCommentCount(this.state.post.id))
      .then(() => {
        this.setState({ ready: true, error: null });
      })
      .catch(err => {
        console.log(err);
        if (err !== '404') this.setState({
          ready: true,
          error: this.fetchData
        })
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
        this.setState({ post: post });
        if (post === null) {
          this.setState({ ready: true });
          throw "404";
        }
      })
  }

  fetchCommentCount(id) {
    return fetch(honoka.defaults.baseURL + '/comments?' + urlEncode({
      post: id,
      per_page: 1
    }))
      .then(response => {
        let total = response.headers.get("x-wp-total");
        this.setState({ commentCount: +total });
      })
  }

  fetchCategoryData(cats) {
    return honoka.get('/categories', {
      data: {
        include: cats.join(','),
      }
    })
      .then(data => {
        this.setState({ categories: data });
      })
  }

  fetchTagData(tags) {
    if (tags.length === 0) {
      return
    }
    return honoka.get('/tags', {
      data: {
        include: tags.join(','),
      }
    })
      .then(data => {
        this.setState({ tags: data });
      })
  }

  render() {
    if (!this.state.ready) {
      return Loader
    }
    if (this.state.error) {
      return <Unreachable retry={this.state.error} />
    }
    if (!this.state.post) {
      return <NotFound />
    }
    const categories = this.state.categories.map(cate => {
      return <Link key={cate.slug} className="category-link" to={`/categories/${cate.slug}`}>{cate.name}</Link>
    });
    const tags = this.state.tags.map(tag => {
      return <Link key={tag.slug} className="tag-link" to={`/tag/${tag.slug}`}>{tag.name}</Link>
    });
    let commentCount = this.state.commentCount === 0 ?
      '还没有评论耶' : this.state.commentCount === 1 ?
        `${this.state.commentCount} 条评论` : `${this.state.commentCount} 条评论`;
    commentCount = <Link to="#Comments">{commentCount}</Link>;
    const post = (
      <div className="post">
        <h1 className="title fee page-control" dangerouslySetInnerHTML={{ __html: this.state.post.title.rendered }} />
        <div className="info fee page-control">
          <span className="fas fa-calendar">发表于 {formatDate(this.state.post.date_gmt + '.000Z')}</span>
          <span className="fas fa-pencil-alt">最后更新于 {human(this.state.post.modified_gmt + '.000Z')}</span>
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
          <div className="post-content" dangerouslySetInnerHTML={{ __html: this.state.post.content.rendered }} />
        </div>
        {
          this.props.siblings ?
            <div className="info eef">
              <span>上一篇：<Link to="/">2018年美团在线笔试编程题解题报告</Link></span>
              <span>下一篇：<Link to="/">Windows下安装libsvm for Python</Link></span>
            </div> : ''
        }
      </div>
    );
    return (
      <div className="container page">
        <div className="page-container">
          {post}
        </div>
        {
          this.state.post.comment_status === "open" ?
            <Comments id={this.state.post.id} />
            : ''
        }
      </div>
    );
  }
}

export default Post;
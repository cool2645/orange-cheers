import React, { Component } from 'react';
import { translate, InjectedTranslateProps } from 'react-i18next';
import { Link } from 'react-router-dom';
import * as WP from 'wordpress';

import '../styles/Post.css';
import { getElementTop } from '../utils/element';

import { ClassicalLoader as Loader } from './Loader';
import { INavControlProps } from './Nav';
import withPost, { IPost as IPost, IPostsData, IViewComponentProps } from './PostHelper';

interface IArchivePost {
  date: number;
  post: IPost;
}

type Archive = ({ [key: string]: { [key: string]: IArchivePost[] } });

interface IArchivesProps extends IViewComponentProps, INavControlProps, InjectedTranslateProps {
}

interface IArchivesState {
  ready: boolean;
  end: boolean;
  categories: WP.Category[] | null;
  tags: WP.Tag[] | null;
  page: number;
  posts: Archive;
}

class Archives extends Component<IArchivesProps, IArchivesState> {

  private unmounted: boolean;
  private firstFetch = true;

  public setState<K extends keyof IArchivesState>(
    newState: ((prevState: Readonly<IArchivesState>, props: IArchivesProps) =>
      (Pick<IArchivesState, K> | IArchivesState | null)) | (Pick<IArchivesState, K> | IArchivesState | null),
    callback?: () => void
  ): void {
    if (!this.unmounted) super.setState(newState, callback);
  }

  constructor(props: IArchivesProps) {
    super(props);
    this.state = {
      ready: true,
      end: false,
      categories: null,
      tags: null,
      page: 0,
      posts: {},
    };
  }

  public componentDidMount() {
    this.unmounted = false;
    this.props.startProgress();
    const { t } = this.props;
    document.title = t('archive.title');
    document.querySelector('meta[name="description"]')
      .setAttribute('content', t('description'));
    this.props.fetchCategories().then(categories =>
      this.setState({ categories: Object.values(categories) })
    );
    this.props.fetchTags().then(tags => {
        document.querySelector('meta[name="keywords"]')
          .setAttribute('content',
            Object.values(tags).map(tag => tag.name).join()
          );
        this.setState({ tags: Object.values(tags) });
      }
    );
    this.fetchMorePosts();
    window.onscroll = this.update;
    if (document.readyState === 'complete') {
      this.props.doneProgress();
      return;
    }
    document.onreadystatechange = () => {
      if (document.readyState === 'complete') {
        this.props.doneProgress();
      }
    };
  }

  public componentWillUnmount() {
    window.onscroll = null;
    document.onreadystatechange = null;
    this.unmounted = true;
  }

  private update = () => {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const commentTop = getElementTop(document.getElementById('archive-ending'));
    // let scrollHeight = document.body.clientHeight;
    const windowHeight = (window as any).visualViewport ? (window as any).visualViewport.height : window.innerHeight + 100;
    if (!this.state.end && scrollTop + windowHeight >= commentTop) this.fetchMorePosts();
  }

  private fetchMorePosts = () => {
    if (!this.state.ready) return;
    this.setState({ ready: false }, () =>
      this.props.getPostsData({ per_page: 15 }, this.state.page + 1, !this.firstFetch, (err) => {
        if (err) {
          this.setState({ ready: true, end: true });
          return;
        }
        this.firstFetch = false;
        const posts: Archive = {};
        (this.props.data as IPostsData).posts.forEach(postData => {
          const post = postData.post;
          const date = new Date(post.date_gmt + '.000Z');
          if (!posts[date.getFullYear() + ' ']) posts[date.getFullYear() + ' '] = {};
          if (!posts[date.getFullYear() + ' '][date.getMonth() + ' ']) posts[date.getFullYear() + ' '][date.getMonth() + ' '] = [];
          posts[date.getFullYear() + ' '][date.getMonth() + ' '].push({ date: date.getDate(), post });
        });
        const end = (this.props.data as IPostsData).totalPage === this.state.page + 1;
        this.setState({ posts, page: this.state.page + 1, ready: true, end });
      })
    );
  }

  public render() {
    const { t } = this.props;
    return (
      <div className="container page post">
        <div className="page-container page-box">
          <div className="post">
            <div className="content fee page-control post-content">
              <h1>{t('archive.categories')}</h1>
              {
                this.state.categories === null ? Loader :
                  this.state.categories.map((cate) => (
                    <Link key={cate.id} className="tag" to={`/category/${cate.slug}`}>
                      {`${cate.name} (${cate.count})`}
                    </Link>
                  ))
              }
            </div>
            <div className="content fee page-control post-content">
              <h1>{t('archive.tags')}</h1>
              {
                this.state.tags === null ? Loader :
                  this.state.tags.map((tag) => (
                    <Link key={tag.id} className="tag" title={`${tag.count} 次`} to={`/tag/${tag.slug}`}>
                      {tag.name}
                    </Link>
                  ))
              }
            </div>
            <div className="content page-control post-content">
              <h1>{t('archive.posts')}</h1>
              {
                Object.keys(this.state.posts).map(year => (
                  <div key={year}>
                    <h2>{year} {t('archive.year')}</h2>
                    {
                      Object.keys(this.state.posts[year]).map(month => (
                        <div key={month}>
                          <h3>{month} {t('archive.month')}</h3>
                          {
                            this.state.posts[year][month].map((post: IArchivePost) => (
                              <div key={post.post.id}>
                                <span>{post.date} {t('archive.date')}{t('archive.colon')}</span>
                                <Link to={`/${post.post.slug}`}>{post.post.title.rendered}</Link>
                                {
                                  post.post.commentCount
                                    ? <span>（{post.post.commentCount}）</span>
                                    : ''
                                }
                              </div>
                            ))
                          }
                        </div>
                      ))
                    }
                  </div>
                ))
              }
              <div id="archive-ending" />
              {!this.state.ready ? Loader : ''}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default translate('post')(withPost(Archives));

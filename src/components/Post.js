import React, { Component } from 'react';
import '../styles/Post.css'
import '../styles/themes/orange-cheers.css'
import { Link } from 'react-router-dom'
import { FullPageLoader as Loader } from './Loader'
import Comments from './Comments'

class Post extends Component {
  render() {
    return (
      <div className="container page">
        <div className="page-container">
          {Loader}
          <div className="post">
            <h1 className="title fee page-control">
              Minawiki 的 M↓示例
            </h1>
            <div className="info fee page-control">
              <span className="far fa-calendar">发表于 2018-06-09</span>
              <span className="fas fa-comments">2645 评论</span>
              <span className="fas fa-folder">
              <Link className="category-link" to="/categories/tech">技术</Link>
            </span>
              {/*<span className="fas fa-eye" >498 Hits</span>*/}
              <span className="fas extra fa-tags">
              <Link className="tag-link" to="/tag/Git">Git</Link>, <Link className="tag-link" to="/tag/喵">喵</Link>
            </span>
            </div>
            <div className="content page-control">
              <div className="post-content">
                {example}
              </div>
            </div>
            <div className="info">
              <span>上一篇：<Link to="/">2018年美团在线笔试编程题解题报告</Link></span>
              <span>下一篇：<Link to="/">Windows下安装libsvm for Python</Link></span>
            </div>
          </div>
        </div>
        <Comments/>
      </div>
    );
  }
}

const example = <div>
  <h1>1、分段和换行</h1>
  <p>通过中间隔一行来分段。</p>
  <p>如果想要不分段地换行，<br />
    要在行末加两个空格</p>
  <p>如果不加这两个空格，
    即使换行也会显示在一行上。</p>
  <p>代码 </p><p>
  <code>通过中间隔一行来分段。

    如果想要不分段地换行，
    要在行末加两个空格

    如果不加这两个空格，
    即使换行也会显示在一行上。</code>
</p>

  <h1>2、斜体，粗体和删除</h1>
  <p><strong>这是粗体</strong>，<strong>这样也是粗体</strong><br /><em>这是斜体</em>，<em>这样也是斜体</em><br />
    <del>这是删除线</del>
  </p>
  <p>代码 </p><p>
  <code>**这是粗体**，__这样也是粗体__
    *这是斜体*，_这样也是斜体_
    ~~这是删除线~~</code>
</p>

  <h1>3、标题</h1>
  <h1>一级标题</h1>
  <h2>二级标题</h2>
  <h3>三级标题</h3>
  <p>代码</p><p>
  <code># 一级标题
    ## 二级标题
    ### 三级标题</code>
</p>

  <blockquote>
    <p>请注意，暂不支持通过<code>===</code>、<code>---</code>等来设置标题。</p>
  </blockquote>
  <h1>4、链接和图片</h1>
  <p><a href="http://neu.wiki">这是一个链接</a><br /><img src="https://www.zybuluo.com/static/img/my_head.jpg" alt="这是一张图片" />
  </p>
  <p>代码</p><p>
  <code>[这是一个链接](http://neu.wiki)
    ![这是一张图片](https://www.zybuluo.com/static/img/my_head.jpg)</code>
</p>

  <h1>5、引用</h1>
  <blockquote>
    <p>这是引用。</p>
    <p>要插入多行引用，<br />
      每行都要加这个。</p>
  </blockquote>
  <p>代码</p><p>
  <code>&gt; 这是引用。

    &gt; 要插入多行引用，
    &gt; 每行都要加这个。</code>
</p>

  <h1>6、列表</h1>
  <p>这是一些无序列表</p>
  <ul>
    <li>苹果</li>
    <li>香蕉</li>
    <li>
      <p>橘子</p>
    </li>
    <li>飞机</li>
    <li>火箭</li>
    <li>
      <p>原子弹</p>
    </li>
    <li>Java</li>
    <li>C#</li>
    <li>PHP</li>
  </ul>

  <p>这是一个有序列表</p>
  <ol>
    <li>张三</li>
    <li>李四</li>
    <li>王五</li>
  </ol>

  <p>```代码</p>
  <ul>
    <li>苹果</li>
    <li>香蕉</li>
    <li>
      <p>橘子</p>
    </li>
    <li>飞机</li>
    <li>火箭</li>
    <li>
      <p>原子弹</p>
    </li>
    <li>Java</li>
    <li>C#</li>
    <li>PHP</li>
  </ul>

  <p>这是一个有序列表</p>
  <ol>
    <li>张三</li>
    <li>李四</li>
    <li>王五
    </li>
  </ol>

  <h1>7、代码块</h1>
  <p>这是<code>行内代码</code>。</p><p>
  <code>这是
    一整块
    代码</code>
</p>

  <p>代码<br />
    （程序员大概都不用教吧）</p>
  <h1>8、数学公式</h1>
  <p>支持 LaTeX 数学公式。</p>
  <p>质能守恒方程可以用一个很简洁的方程式 (E=mc^2) 来表达。</p>
  <p>$$\sum_&#123;i=1&#125;^n a_i=0$$</p>
  <p>$$f(x_1,x_x,\ldots,x_n) = x_1^2 + x_2^2 + \cdots + x_n^2 $$</p>
  <p>代码 </p><p>
  <code>质能守恒方程可以用一个很简洁的方程式 \(E=mc^2\) 来表达。

    $$\sum_&#123;i=1&#125;^n a_i=0$$

    $$f(x_1,x_x,\ldots,x_n) = x_1^2 + x_2^2 + \cdots + x_n^2 $$</code>
</p>

  <p>请注意，不支持$...$作为行内公式，因为 ”... the cost is $2.50 for the first one, and $2.00 for each additional one ...”
    像这样的话可能会被当做公式。</p>
  <h1>9、其他</h1>
  <p>支持 HTML 的字体、字色、表格等标签:)</p>
</div>;

export default Post;
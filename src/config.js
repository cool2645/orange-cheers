// You may see wavy lines because of Webstorm's bug:
// https://youtrack.jetbrains.com/issue/WEB-33060
// Don't panic.

const site = {
  name: "2645 实验室",
  banner: "2645 实验室",
  title: "2645 Laboratory",
  apiEndpoint: "https://blog.cool2645.com/wp-json/wp/v2",
};
const post = {
  perPage: 10,
};
const comment = {
  perPage: 15,
};
const nav = {
  sidebar: {
    title: "(´・ω・`)",
  },
  links: [
    {
      name: "技術",
      typed: "技术",
      hideInBanner: true,
      path: "/category/tech",
    },
    {
      name: "Web 開發",
      typed: "Web 开发",
      hideInHeader: true,
      path: "/category/webdev",
    },
    {
      name: "運維",
      typed: "运维",
      hideInHeader: true,
      path: "/category/operation",
    },
    {
      name: "Linux",
      typed: "Linux",
      hideInHeader: true,
      path: "/category/linux",
    },
    {
      name: "桌面開發",
      typed: "桌面开发",
      hideInHeader: true,
      path: "/category/desktopdev",
    },
    {
      name: "算法",
      typed: "算法",
      hideInHeader: true,
      path: "/category/algorithm",
    },
    {
      name: "歸檔",
      typed: "归档",
      path: "/archives",
    },
    {
      name: "關於",
      typed: "关于",
      path: "/about",
    },
  ],
  icons: [
    {
      title: "2645 工作室",
      icon: "fas fa-home",
      path: "https://www.cool2645.com",
    },
    {
      title: "RSS",
      typed: "RSS",
      icon: "fas fa-rss",
      path: "/feed",
    },
    {
      title: "登录",
      typed: "登录",
      icon: "fas fa-sign-in-alt",
      path: "/wp-login.php",
    },
    {
      title: "选项",
      typed: "选项",
      icon: "fas fa-cog",
      path: "/settings",
    },
  ],
  footer: {
    bottom: [
      "2018 © 2645 Laboratory",
    ],
    top: [{
      title: "关于作者",
      contents: [
        "<a href=''>梨子</a>",
        "<a href=''>Bittersweet</a>",
      ],
    }],
  },
};

export { site, nav, post, comment };

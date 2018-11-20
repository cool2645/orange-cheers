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
      path: "/298",
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
      title: "两只鸽子作者",
      contents: [
        "<a target='_blank' href='https://rikako.moe/About' rel='noopener noreferrer'>梨子</a> - " +
        "<a target='_blank' href='https://rikako.moe/GuestBook' rel='noopener noreferrer'>留言板</a> - " +
        "<a target='_blank' href='https://rikako.moe' rel='noopener noreferrer'>时间轴</a>",
        "<a target='_blank' href='https://渡边曜.我爱你/About' rel='noopener noreferrer'>Bittersweet</a> - " +
        "<a target='_blank' href='https://渡边曜.我爱你/GuestBook' rel='noopener noreferrer'>留言板</a> - " +
        "<a target='_blank' href='https://渡边曜.我爱你' rel='noopener noreferrer'>时间轴</a>",
      ],
    }, {
      title: "地球的小伙伴们",
      contents: [
        "<a target='_blank' href='https://void-shana.moe/' rel='noopener noreferrer'>VOID's WOWO</a>",
        "<a target='_blank' href='https://kotori.love/' rel='noopener noreferrer'>ことりのおやつにしてやるぞー！</a>",
        "<a target='_blank' href='https://fiveyellowmice.com/' rel='noopener noreferrer'>FiveYellowMice's Blog</a>",
        "<a target='_blank' href='https://blog.ixnet.work/' rel='noopener noreferrer'>IX Network Studio</a>",
        "<a target='_blank' href='https://frantic1048.com/' rel='noopener noreferrer'>Frantic1048 Chino Kafuu</a>",
        "<a target='_blank' href='https://blog.yoitsu.moe/' rel='noopener noreferrer'>约伊兹的萌狼乡手札</a>",
      ],
    }, {
      title: "地球的小伙伴们",
      contents: [
        "<a target='_blank' href='https://stdrc.cc/' rel='noopener noreferrer'>一只大写的腊鸡</a>",
        "<a target='_blank' href='https://kirainmoe.com/' rel='noopener noreferrer'>宇宙よりも遠い場所</a>",
        "<a target='_blank' href='https://ekyu.moe/' rel='noopener noreferrer'>Equim</a>",
        "<a target='_blank' href='https://kirikira.moe/' rel='noopener noreferrer'>KIRIKIRA.MOE</a>",
        "<a target='_blank' href='https://blog.nanpuyue.com/' rel='noopener noreferrer'>南浦月</a>",
        "<a target='_blank' href='https://typeblog.net/' rel='noopener noreferrer'>PeterCxy</a>",
      ],
    }, {
      title: "地球的小伙伴们",
      contents: [
        "<a target='_blank' href='https://whoisnian.com/' rel='noopener noreferrer'>念</a>",
        "<a target='_blank' href='https://2heng.xin/' rel='noopener noreferrer'>樱花庄的白猫 | ねこ・しろ・ましろ</a>",
        "<a target='_blank' href='https://blessing.studio/' rel='noopener noreferrer'>Blessing Studio</a>",
        "<a target='_blank' href='https://blog.keep.moe/' rel='noopener noreferrer'>玛奇朵 生活觀察筆記</a>",
        "<a target='_blank' href='https://blog.poi.cat/' rel='noopener noreferrer'>PoiScript</a>",
        "<a target='_blank' href='https://angry.im/' rel='noopener noreferrer'>ANGRY.IM</a>",
      ],
    }],
  },
};

export { site, nav, post, comment };

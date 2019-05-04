const path = require('path');

module.exports = {
  title: 'Barrage UI',
  description:
    'Best and lightest danmaku component for web UI. 适用于 Web 端用户界面和播放器的轻量级弹幕组件',
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '项目文档', link: '/document/' },
      { text: 'Demo', link: 'https://masking-danmaku-demo.netlify.com/' },
    ],
    sidebar: {
      '/document/': [
        '',
        'instance',
        'config',
        'dataset',
        'anim-api',
        'anim-prop',
        'masking-api',
        'canvas',
        'implement',
        'example',
      ],
      '/': false,
    },
    sidebarDepth: 2,
    repo: 'parksben/barrage',
    repoLabel: 'GitHub',
  },
  dest: path.resolve(__dirname, '../dist'),
};

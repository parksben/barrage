---
home: true
title: Barrage UI
description: 可实现B站蒙版弹幕效果的轻量级前端组件
actionText: 快速上手 →
actionLink: /document/
features:
- title: 一切皆可『弹幕』化
  details: 动画基于 Canvas 实现，可用于给网页上任何元素挂载弹幕评论
- title: 简单 & 自由
  details: 代码开源（MIT License）且无任何第三方依赖，可放心安装、自由地使用组件进行业务开发
- title: 可定制 & 可延展
  details: 基于相关接口，可精确定义每一帧渲染。可快速实现 B 站（bilibili.com）风格的『蒙版弹幕』效果
footer: MIT Licensed | Copyright © 2019-present Parksben
---

## :clapper: Demo Online

* 线上效果 - <https://masking-danmaku-demo.netlify.com/>
* 案例源码 - <https://github.com/parksben/masking-danmaku-demo>

## :package: 安装

```bash
yarn add barrage-ui # 或者 npm install --save barrage-ui
```

## :truck: 快速开始

html

```html
<div id="container">
  <video id="video" src="videos/demo.mp4" controls></video>
</div>
```

js

```js
import Barrage from 'barrage-ui';
import example from 'barrage-ui/example.json'; // 组件提供的示例数据

// 加载弹幕
const barrage = new Barrage({
  container: document.getElementById('container'), // 父级容器
  data: example, // 弹幕数据
  config: {
    // 全局配置项
    duration: 20000, // 弹幕循环周期(单位：毫秒)
    defaultColor: '#fff', // 弹幕默认颜色
  },
});

// 新增一条弹幕
barrage.add({
  key: 'fctc651a9pm2j20bia8j', // 弹幕的唯一标识
  time: 1000, // 弹幕出现的时间(单位：毫秒)
  text: '这是新增的一条弹幕', // 弹幕文本内容
  fontSize: 24, // 该条弹幕的字号大小(单位：像素)，会覆盖全局设置
  color: '#0ff', // 该条弹幕的颜色，会覆盖全局设置
});

// 播放弹幕
barrage.play();
```

<style>
.home  .hero::before {
  content: '';
  display: block;
  width: 16rem;
  height: 16rem;
  margin: 0 auto;
  margin-top: 3.2rem;
  background: url(./images/logo.png) no-repeat center center;
  background-size: 100% auto;
}
</style>
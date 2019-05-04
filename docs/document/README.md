---
title: 快速上手
---

# 快速上手

## 安装

```bash
yarn add barrage-ui # 或者 npm install --save barrage-ui
```

## 快速开始

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
---
title: 科普 - 如何实现蒙版弹幕
---

# 基于 Barrage UI 如何实现蒙版弹幕

Barrage 组件提供了实现 蒙版弹幕 效果的可能。基于本组件实现的 demo 效果如下：

![蒙版弹幕效果](../images/demo.png)

## 什么是“蒙版弹幕”

**蒙版弹幕** 是由知名弹幕视频网站 [bilibili](https://www.bilibili.com) 于 2018 年中推出的一种弹幕渲染效果，可以有效减少弹幕文字对视频主体信息的干扰。

详细资料可参考 bilibili 的相关文章：

[弹幕阳光计划第十弹 蒙版听说过吗，弹幕黑科技了解一下？](https://www.bilibili.com/read/cv534194/)

[不挡脸，放肆看！B 站黑科技蒙版弹幕揭秘](https://www.infoq.cn/article/2018%2F08%2Fbili-bili-mask-barrage)

## 蒙版弹幕的实现原理

如果你熟悉最著名的图像处理软件——Adobe Photoshop，那么你应该对 “蒙版” 的概念不陌生，“蒙版弹幕” 的实现原理与此类似，即：将图像的一部分 “隐藏”。

Barrage 组件的初始化参数中的 `mask` 一项即用于处理蒙版效果。对于上文截图中的效果，其使用的蒙版图像效果如下：

![蒙版图像](../images/mask.png)

弹幕渲染时，会将蒙版图像中 “镂空” 的部分（图像 RGBA 通道中 Alpha 通道为 0 的像素）去除，从而达到 “蒙版弹幕” 的效果。

## 基于 Barrage UI 的伪代码

为 barrage 实例设置蒙版图像(mask)即可实现蒙版弹幕效果。

* 可通过初始化参数 `mask` 传入蒙版图像:

```js
import Barrage from 'barrage-ui';
import example from 'barrage-ui/example.json';

const barrage = new Barrage({
  container: 'barrage',
  data: example,
  mask: 'mask.png', // 传入蒙版图像的 url
});
```

* 也可以在弹幕初始化后，通过 `setMask` 方法进行实时更新：

```js
import Barrage from 'barrage-ui';
import example from 'barrage-ui/example.json';

const barrage = new Barrage({
  container: 'barrage',
  data: example,
});

// 设置蒙版图像
barrage.setMask('mask.png'); // 传入蒙版图像的 url
```

::: warning 注意
`mask` 参数和 `setMask` 方法的参数类型一致，可接收图像的 url 或 [ImageData](https://developer.mozilla.org/zh-CN/docs/Web/API/ImageData)
:::

## beforeRender 钩子实现实时渲染

上文的示例仅能够实现一帧蒙版图像的渲染(只设置了一次 `mask` 而没有实时更新它)，要实现实时的蒙版效果(如：与视频实时同步的蒙版效果)，需要对弹幕动画的每一帧进行处理。

使用组件提供的 `beforeRender` 钩子函数，可以轻易的实现：

```js
import Barrage from 'barrage-ui';
import example from 'barrage-ui/example.json';

const barrage = new Barrage({
  container: 'barrage',
  data: example,
  beforeRender: (ctx, progress) => {
    const imageData = getMask(progress); // 用于获取当前进度对应蒙版的方法
    barrage.setMask(imageData);
  },
});
```

当然，`beforeRender` 钩子也可以在弹幕初始化之后挂载：

```js
import Barrage from 'barrage-ui';
import example from 'barrage-ui/example.json';

const barrage = new Barrage({
  container: 'barrage',
  data: example,
});

barrage.beforeRender = (ctx, progress) => {
  const imageData = getMask(progress); // 用于获取当前进度对应蒙版的方法
  barrage.setMask(imageData);
};
```
# Barrage UI

Best and lightest barrage component for web ui.

适用于 web 端用户界面和播放器的轻量级弹幕组件

![Demo](https://github.com/parksben/barrage/raw/master/images/barrage.gif)

## 用途

- 为你的 视频播放器、图片浏览器 等元素挂载弹幕动画
- 用于实现 B 站(bilibili.com) 风格的 **蒙版弹幕** 效果

## 安装

```
yarn add barrage-ui
```

或

```
npm install --save barrage-ui
```

## 快速开始

```js
import Barrage from 'barrage-ui';
import example from 'barrage-ui/example.json'; // 组件提供的示例数据

// 加载弹幕
const barrage = new Barrage({
  container: 'barrage', // 父级容器或ID
  data: example, // 弹幕数据
  config: {
    // 全局配置项
    duration: 20000, // 弹幕循环周期(单位：毫秒)
    fontFamily: 'Microsoft Yahei', // 弹幕默认字体
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

## 初始化参数

创建弹幕实例时，需要传入的初始化参数如下：

|       参数       |                                    数据类型                                    |              默认值              | 说明                                                                                                                                                           |
| :--------------: | :----------------------------------------------------------------------------: | :------------------------------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|    container     |                                 string/element                                 |          必传，无默认值          | 弹幕的挂载点                                                                                                                                                   |
|       data       |                                     array                                      |                []                | 弹幕数据                                                                                                                                                       |
|      config      |                                     object                                     |          详见全局配置项          | 详见[全局配置项](#全局配置项)                                                                                                                                  |
|       mask       | string/[ImageData](https://developer.mozilla.org/zh-CN/docs/Web/API/ImageData) |         string/ImageData         | 蒙版图像，用于实现蒙版弹幕效果，详见[蒙版弹幕](#蒙版弹幕)                                                                                                      |
|   beforeRender   |                                    function                                    | (ctx, progress, animState) => {} | 帧渲染前的回调，函数实参分别为：<br/>**`ctx`** canvas 画布的上下文<br/>**`progress`** 动画的播放进度(毫秒)<br/>**`animState`** 动画状态: 'paused' 或 'playing' |
|   afterRender    |                                    function                                    | (ctx, progress, animState) => {} | 帧渲染后的回调，函数实参分别为：<br/>**`ctx`** canvas 画布的上下文<br/>**`progress`** 动画的播放进度(毫秒)<br/>**`animState`** 动画状态: 'paused' 或 'playing' |
| overlapOptimized |                                    boolean                                     |              false               | 弹幕装填时是否启用布局优化，以尽可能避免使相邻时间的弹幕重叠                                                                                                   |

其中，`container` 参数在初始化实例时必传，其他参数为可选，数据类型及默认值如上表所示。

## 全局配置项

### 配置项及默认值

弹幕的所有全局配置项及默认值如下：

```js
{
  duration: -1, // 弹幕动画的循环周期，-1 表示不循环播放
  speed: 100, // 弹幕的运动速度
  fontSize: 20, // 文字大小，单位：像素
  fontFamily: 'serif', // 字体
  textShadowBlur: 0.1, // 字体阴影大小，有效值 0-1
  opacity: 1.0, // 透明度，有效值 0-1
  defaultColor: '#fff', // 默认颜色，与 CSS 颜色属性一致
}
```

### 更新配置项

如果你的弹幕实例已创建或者正在播放，可以通过 `.setConfig()` 方法进行实时更新：

```js
// 更新全局透明度
barrage.setConfig({ opacity: 0.5 });
```

## 弹幕数据

### 结构与内容

弹幕数据集为一个对象数组。每个数组元素对应一条弹幕记录，其结构如下：

```js
{
  key: 'fctc651a9pm2j20bia8j',
  createdAt: '2019-01-13T13:34:47.126Z',
  time: 1200,
  text: '我膨胀了',
  fontFamily: 'SimSun',
  fontSize: 32,
  color: 'yellow',
}
```

> 数据字段

- createdAt - 弹幕的创建时间 (**必须**)
- time - 弹幕的动画时间 (**必须**)
- text - 弹幕文本内容 (**必须**)
- key - 数据的唯一标示 (**推荐**)
- fontFamily - 弹幕文本的字体 (可选)
- fontSize - 弹幕文本字号大小，单位：像素 (可选)
- color - 弹幕文本的颜色 (可选)

**关于 key**

当动画过程中需要更新数据集时，推荐设置此字段。

动态更新数据集时，为了动画的连续性，更新前后的数据集可能存在部分相同的数据。Barrage 组件内部会对更新前后的数据的 key 进行比较，只增量渲染那些新增的数据，而不改变已经存在的弹幕布局。

综上所述，字段 key 的取值应该是稳定且唯一的。对于同一条弹幕而言，key 的值应该是不变的。

### 装填弹幕

装填弹幕有两种方式：

**方式一：初始化时传入数据**

```js
const barrage = new Barrage({
  container: 'barrage',
  data: JSON_DATA, // JSON_DATA -> 你的弹幕数据
});
```

**方式二：初始化后更新数据**

```js
const barrage = new Barrage({
  container: 'barrage',
});

barrage.setData(JSON_DATA); // JSON_DATA -> 你的弹幕数据
```

### 新增弹幕

如果你的弹幕实例已创建或者正在播放，可以通过 `.add()` 方法新增一条记录：

```js
barrage.add({
  key: 'fctc651a9pm2j20bia8j',
  time: 1000,
  text: '这是新增的一条弹幕',
  fontSize: 24,
  color: '#0ff',
});
```

`.add()` 方法一般搭配 数据提交/请求 操作进行使用，以实现真实的线上应用。

> **适用场景：** 实现多终端同步的实时弹幕

1. 某用户在客户端提交了一条弹幕到服务端
2. 服务端将数据存储并分发给正在进行会话的客户端
3. 客户端收到数据后，使用 `.add()` 方法进行数据更新

## 动画控制接口

### .play()

> **描述**

用于播放动画。若当前为暂停状态，则从当前进度继续播放

> **用例**

```js
barrage.play();
```

### .pause()

> **描述**

用于暂停动画

> **用例**

```js
barrage.pause();
```

### .replay()

> **描述**

用于重新开始播放动画

> **用例**

```js
barrage.replay();
```

### .goto(progress)

> **描述**

用于跳转播放进度。此方法在动画播放和暂停的状态下均有效

> **参数**

progress - 待跳转的进度。值为一个毫秒数，表示跳转到动画的第几毫秒

> **用例**

```js
barrage.goto(15000); // 跳转到第 15 秒
```

## 蒙版弹幕

Barrage 组件提供了实现 蒙版弹幕 效果的可能。基于本组件实现的 demo 效果如下：

![蒙版弹幕效果](https://github.com/parksben/barrage/raw/master/images/demo.jpg)

### 什么是“蒙版弹幕”

**蒙版弹幕** 是由知名弹幕视频网站 [bilibili](https://www.bilibili.com) 于 2018 年中推出的一种弹幕渲染效果，可以有效减少弹幕文字对视频主体信息的干扰。

详细资料可参考 bilibili 的相关文章：

[弹幕阳光计划第十弹 蒙版听说过吗，弹幕黑科技了解一下？](https://www.bilibili.com/read/cv534194/)

[不挡脸，放肆看！B 站黑科技蒙版弹幕揭秘](https://www.infoq.cn/article/2018%2F08%2Fbili-bili-mask-barrage)

### 实现原理

如果你熟悉最著名的图像处理软件——Adobe Photoshop，那么你应该对 “蒙版” 的概念不陌生，“蒙版弹幕” 的实现原理与此类似，即：将图像的一部分 “隐藏”。

Barrage 组件的初始化参数中的 `mask` 一项即用于处理蒙版效果。对于上文截图中的效果，其使用的蒙版图像效果如下：

![蒙版图像](https://github.com/parksben/barrage/raw/master/images/mask.png)

弹幕渲染时，会将蒙版图像中 “镂空” 的部分（图像 RGBA 通道中 Alpha 通道为 0 的像素）去除，从而达到 “蒙版弹幕” 的效果。

### 简单蒙版弹幕的实现

为 barrage 实例设置蒙版图像(mask)即可实现蒙版弹幕效果。

- 可通过初始化参数 `mask` 传入蒙版图像:

```js
import Barrage from 'barrage-ui';
import example from 'barrage-ui/example.json';

const barrage = new Barrage({
  container: 'barrage',
  data: example,
  mask: 'mask.png', // 传入蒙版图像的 url
});
```

- 也可以在弹幕初始化后，通过 `.setMask()` 方法进行实时更新：

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

> **注意**
>
> `mask` 参数和 `.setMask()` 方法的参数类型一致，可接收图像的 url 或 [ImageData](https://developer.mozilla.org/zh-CN/docs/Web/API/ImageData)

### 实时渲染

上文的示例仅能够实现一帧蒙版图像的渲染(只设置了一次 mask 而没有实时更新它)，要实现实时的蒙版效果(如：与视频实时同步的蒙版效果)，需要对弹幕动画的每一帧进行处理。

使用组件提供的 beforeRender 钩子函数，可以轻易的实现：

```js
import Barrage from 'barrage-ui';
import example from 'barrage-ui/example.json';

const barrage = new Barrage({
  container: 'barrage',
  data: example,
  beforeRender: (ctx, progress) => {
    const imageData = getMask(progress); // 用于获取当进度对应蒙版的方法
    barrage.setMask(imageData);
  },
});
```

当然，beforeRender 钩子也可以在弹幕初始化之后挂载：

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

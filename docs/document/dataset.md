---
title: 弹幕数据
---

# 弹幕数据

## 数据结构

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
  avatar: '/images/avatar.png',
  avatarSize: 32,
  avatarMarginRight: 8,
}
```

::: tip 数据字段的含义
* createdAt - 弹幕的创建时间 (**必须**)
* time - 弹幕的动画时间 (**必须**)
* text - 弹幕文本内容 (**必须**)
* key - 数据的唯一标示 (**推荐**)
* fontFamily - 弹幕文本的字体，默认值：`'Microsoft Yahei'` (可选)
* fontSize - 弹幕文本字号大小，单位：像素，默认值：`24` (可选)
* color - 弹幕文本的颜色，默认值：`'#fff'` (可选)
* avatar - 头像的 url，须为正方形图片，不支持跨域，默认值：`null` (可选)
* avatarSize - 头像的大小，单位：像素，默认值为字号大小的 1.2 倍 (可选)
* avatarMarginRight - 头像与文本的间距，单位：像素，默认值为字号大小的 0.2 倍 (可选)
:::

::: warning 关于 key

当动画过程中需要更新数据集时，推荐设置此字段。

动态更新数据集时，为了动画的连续性，更新前后的数据集可能存在部分相同的数据。Barrage 组件内部会对更新前后的数据的 key 进行比较，只增量渲染那些新增的数据，而不改变已经存在的弹幕布局。

综上所述，字段 key 的取值应该是稳定且唯一的。对于同一条弹幕而言，key 的值应该是不变的。
:::

## 装填弹幕 - barrage.setData()

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

## 新增弹幕 - barrage.add()

如果你的弹幕实例已创建或者正在播放，可以通过 `add` 方法新增一条记录：

```js
barrage.add({
  key: 'fctc651a9pm2j20bia8j',
  time: 1000,
  text: '这是新增的一条弹幕',
  fontSize: 26,
  color: '#0ff',
});
```

`add` 方法一般搭配 数据提交/请求 操作进行使用，以实现真实的线上应用。

::: tip 适用场景举例
实现多终端同步的实时弹幕：
1. 某用户在客户端提交了一条弹幕到服务端
2. 服务端将数据存储并分发给正在进行会话的客户端
3. 客户端收到数据后，使用 `add` 方法进行数据更新
:::

::: warning 注意
`add` 方法会返回一个 `Boolean` 值，表示弹幕是否成功添加进画布。若当前进度的画布中弹幕已经饱和，则可能添加失败
:::
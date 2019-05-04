---
title: 动画控制接口
---

# 动画控制接口

## 播放 - barrage.play()

**描述**

用于播放动画。若当前为暂停状态，则从当前进度继续播放

**用例**

```js
barrage.play();
```

## 暂停 - barrage.pause()

**描述**

用于暂停动画

**用例**

```js
barrage.pause();
```

## 重新播放 - barrage.replay()

**描述**

用于重新开始播放动画

**用例**

```js
barrage.replay();
```

## 跳转进度 - barrage.goto(progress)

**描述**

用于跳转播放进度。此方法在动画播放和暂停的状态下均有效

**参数**

`progress` - 待跳转的进度。值为一个毫秒数，表示跳转到动画的第几毫秒

**用例**

```js
barrage.goto(15000); // 跳转到第 15 秒
```
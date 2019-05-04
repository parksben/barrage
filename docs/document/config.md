---
title: 全局配置项
---

# 全局配置项

## 配置项及默认值 - barrage.config

弹幕的所有全局配置项及默认值如下：

```js
{
  duration: -1, // 弹幕动画的循环周期，-1 表示不循环播放
  speed: 100, // 弹幕的运动速度
  fontSize: 24, // 文字大小，单位：像素
  fontFamily: 'Microsoft Yahei', // 字体，默认值：微软雅黑
  textShadowBlur: 1.0, // 字体阴影扩散，有效值 >= 0
  opacity: 1.0, // 透明度，有效值 0-1
  defaultColor: '#fff', // 默认颜色，与 CSS 颜色属性一致
}
```

## 更新配置项 - barrage.setConfig()

如果你的弹幕实例已创建或者正在播放，可以通过 `.setConfig()` 方法进行实时更新：

```js
// 更新全局透明度
barrage.setConfig({ opacity: 0.5 });
```
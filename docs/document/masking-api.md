---
title: 蒙版图像接口
---

# 蒙版图像接口

## 设置蒙版图像 - barrage.setMask(mask)

**描述**

用于设置蒙版图像。蒙版图像的概念见下文 [蒙版弹幕](/document/implement.html)

**参数**

mask - 蒙版图像的 url 或 [ImageData](https://developer.mozilla.org/zh-CN/docs/Web/API/ImageData)

**用例**

```js
barrage.setMask('mask.png'); // 通过图片 url 设置蒙版图像

barrage.setMask(imageData); // 直接设置 ImageData 类型的数据
```

## 清除蒙版图像 - barrage.clearMask()

**描述**

用于清空当前的蒙版图像。清空后若不再重新设置蒙版图像，则动画将不再具有蒙版效果

**用例**

```js
barrage.clearMask();
```
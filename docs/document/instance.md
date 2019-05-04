---
title: 初始化参数
---

# 初始化参数

在 `new Barrage({ ...options })` 创建弹幕实例时，需要传入的初始化参数如下：

|   Options    |                                   Data Type                                    |          Default Value           | Notes                                                                                                                                                          |
| :----------: | :----------------------------------------------------------------------------: | :------------------------------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|  container   |                                 string/element                                 |          必传，无默认值          | 弹幕的挂载点                                                                                                                                                   |
|     data     |                                     array                                      |                []                | 弹幕数据                                                                                                                                                       |
|    config    |                                     object                                     |          详见全局配置项          | 详见[全局配置项](#全局配置项)                                                                                                                                  |
|     mask     | string/[ImageData](https://developer.mozilla.org/zh-CN/docs/Web/API/ImageData) |         string/ImageData         | 蒙版图像，用于实现蒙版弹幕效果，详见[蒙版弹幕](#蒙版弹幕)                                                                                                      |
| beforeRender |                                    function                                    | (ctx, progress, animState) => {} | 帧渲染前的回调，函数实参分别为：<br/>**`ctx`** canvas 画布的上下文<br/>**`progress`** 动画的播放进度(毫秒)<br/>**`animState`** 动画状态: 'paused' 或 'playing' |
| afterRender  |                                    function                                    | (ctx, progress, animState) => {} | 帧渲染后的回调，函数实参分别为：<br/>**`ctx`** canvas 画布的上下文<br/>**`progress`** 动画的播放进度(毫秒)<br/>**`animState`** 动画状态: 'paused' 或 'playing' |
| avoidOverlap |                                    boolean                                     |               true               | 是否禁止弹幕重叠(默认开启)                                                                                                                                     |

其中，`container` 参数在初始化实例时必传，其他参数为可选，数据类型及默认值如上表所示。

import {
  requestAnimationFrame,
  cancelAnimationFrame,
  loadImage,
} from './utils';

// 支持通过 barrage.setConfig() 接口修改的配置项
const DEFAULT_CONFIG = {
  duration: -1, // -1 表示不循环播放
  speed: 100,
  fontSize: 24,
  fontFamily: 'Microsoft Yahei',
  textShadowBlur: 1.0,
  opacity: 1.0,
  defaultColor: '#fff',
};

// 蒙版信息
const GLOBAL_MASK = {
  type: null, // 蒙版类型：'url' 'ImageData'
  mask: null, // 蒙版数据：ImageData
};

/**
 * 弹幕组件 Barrage
 * @param {string/element} container 弹幕的挂载点
 * @param {array} data 弹幕数据，单条数据格式如 { time: 1200, text: '2333' }
 * @param {number} config.duration 弹幕的循环周期(不设置此参数时，默认弹幕仅播放一次)，单位：毫秒
 * @param {number} config.speed 弹幕最小移动速度，单位：像素/秒
 * @param {number} config.fontSize 文字大小，单位：像素
 * @param {string} config.fontFamily 字体
 * @param {number} config.textShadowBlur 字体阴影扩散系数，取值范围：[0, 1]
 * @param {number} config.opacity 字体透明度，取值范围：[0, 1]
 * @param {string} config.defaultColor 字体默认颜色
 * @param {boolean} overlapOptimized 弹幕装填时是否启用布局优化(以尽可能避免使相邻时间的弹幕重叠)，默认值：false
 * @param {string/ImageData} mask 蒙版图像信息，每 4 个元素表示一个像素的 RGBA 信息
 * @param {function} beforeRender 帧渲染前的钩子
 * @param {function} afterRender 帧渲染后的钩子
 */
export default class Barrage {
  constructor({
    container,
    data = [],
    config = {},
    overlapOptimized = false,
    mask = [],
    beforeRender = () => {},
    afterRender = () => {},
  }) {
    // 获取父级容器
    this.parent =
      typeof container === 'string'
        ? document.getElementById(container)
        : container;
    this.parent.classList.add('barrage-container');

    // 创建画布
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'barrage-canvas';
    this.canvas.width = this.parent.clientWidth;
    this.canvas.height = this.parent.clientHeight;
    this.canvas.style.pointerEvents = 'none'; // canvas 事件穿透
    this.canvas.style.letterSpacing = '1.5px'; // canvas 字符间距
    this.parent.appendChild(this.canvas);

    // 若父节点存在其他子节点，则设置画布为绝对定位
    if (this.parent.childNodes.length > 1) {
      this.parent.style.position = 'relative';
      this.canvas.style.position = 'absolute';
      this.canvas.style.left = '0px';
      this.canvas.style.top = '0px';
    }

    // 画布上下文
    this.ctx = this.canvas.getContext('2d');

    // 弹幕装填时是否启用布局优化
    this.overlapOptimized = overlapOptimized;

    // 全局参数设置
    this.setConfig({
      ...DEFAULT_CONFIG,
      ...config,
    });

    this.setMask(mask); // 设置蒙版
    this.beforeRender = beforeRender;
    this.afterRender = afterRender;

    // 数据初始化
    this.setData(data);
  }

  setMask(input) {
    if (typeof input === 'string') {
      GLOBAL_MASK.type = 'url';
      loadImage(input).then(img => {
        GLOBAL_MASK.data = img;
      });
    } else if (
      Object.prototype.toString.apply(input) === '[object ImageData]'
    ) {
      GLOBAL_MASK.type = 'ImageData';
      GLOBAL_MASK.data = input;
    } else {
      GLOBAL_MASK.type = null;
      GLOBAL_MASK.data = null;
    }
  }

  clearMask() {
    this.setMask();
  }

  setConfig(config) {
    if (!this.config) this.config = {};

    for (let [prop, value] of Object.entries(config)) {
      if (DEFAULT_CONFIG[prop]) this.config[prop] = value;
    }
  }

  _randomTop() {
    const LINE_HEIGHT = 1.32;

    // 计算大致的行数
    this.rowCount =
      this.rowCount ||
      Math.floor(this.canvas.height / (LINE_HEIGHT * this.config.fontSize));

    // 随机产生纵向位置
    const randomTop =
      (this.config.fontSize * (LINE_HEIGHT - 1)) / 2 +
      Math.floor(this.rowCount * Math.random()) *
        LINE_HEIGHT *
        this.config.fontSize;

    return randomTop;
  }

  _optimizeData() {
    // 尽量避免文字重叠
    if (this.data) {
      for (let d of this.data) {
        for (let x of this.data) {
          const hasOverlap =
            (Math.abs(x.top - d.top) < this.config.fontSize * 0.1 &&
              x.left >= d.left &&
              x.left <= d.left + d.width) ||
            (Math.abs(x.top - d.top) < this.config.fontSize * 0.1 &&
              x.left + x.width >= d.left &&
              x.left + x.width <= d.left + d.width);

          if (hasOverlap) {
            x.top = this._randomTop();
          }
        }
      }
    }
  }

  setData(data) {
    // 保存上一次数据集
    if (this.data) this.prevData = this.data;

    // 获取弹幕数据并计算出布局信息
    this.data = data.map(
      ({
        key,
        time,
        text,
        fontSize = this.config.fontSize,
        fontFamily = this.config.fontFamily,
        color = this.config.defaultColor,
        createdAt = new Date().toISOString(),
      }) => {
        // 若上一次数据集中已存在该数据，则直接保留
        if (this.prevData && this.prevData.some(d => d.key === key)) {
          return this.prevData.find(d => d.key === key);
        }

        // 弹幕布局
        this.ctx.font = `${fontSize}px ${fontFamily}`;
        const { width } = this.ctx.measureText(text);

        return {
          key,
          time,
          text,
          fontSize,
          fontFamily,
          color,
          createdAt,
          left: (this.config.speed * time) / 1000 + this.canvas.width,
          top: this._randomTop(),
          width,
          height: this.config.fontSize,
          speedRatio: Math.random() + 1,
        };
      }
    );

    if (this.overlapOptimized) this._optimizeData();
  }

  add({
    time,
    text,
    fontSize = this.config.fontSize,
    fontFamily = this.config.fontFamily,
    color = this.config.defaultColor,
    createdAt = new Date().toISOString(),
  }) {
    this.ctx.font = `${fontSize}px ${fontFamily}`;
    const { width } = this.ctx.measureText(text);

    const record = {
      time,
      text,
      fontSize,
      fontFamily,
      color,
      createdAt,
      left: (this.config.speed * time) / 1000 + this.canvas.width,
      top: this._randomTop(),
      width,
      height: this.config.fontSize,
      speedRatio: Math.random() + 1,
    };

    if (this.data && this.data.length) {
      this.data.push(record);
    } else {
      this.setData([record]);
    }
  }

  // 计算播放进度，单位：毫秒
  get progress() {
    if (!this.startTime) return 0;
    if (this.pauseAt !== undefined) return this.pauseAt;

    let p = Date.now() - this.startTime;
    if (this.config.duration > 0) p %= this.config.duration;

    return p;
  }

  // 获取当前播放状态
  get animState() {
    if (!this.startTime) return 'ready';
    return this.pauseAt !== undefined ? 'paused' : 'playing';
  }

  _render() {
    // 弹幕整体向左移动的总距离
    const translateX = (this.config.speed * this.progress) / 1000;

    // 清空画布
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 筛选待渲染的数据
    const dataShown = this.data
      .filter(
        x =>
          x.left + x.width - translateX * x.speedRatio >= 0 &&
          x.left - translateX * x.speedRatio < this.canvas.width
      )
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    // 执行渲染前的回调
    if (this.beforeRender)
      this.beforeRender(this.ctx, this.progress, this.animState);

    this.ctx.save();
    if (GLOBAL_MASK.data) {
      if (GLOBAL_MASK.type === 'ImageData') {
        this.ctx.putImageData(GLOBAL_MASK.data, 0, 0);
      } else if (GLOBAL_MASK.type === 'url') {
        this.ctx.drawImage(
          GLOBAL_MASK.data,
          0,
          0,
          this.canvas.width,
          this.canvas.height
        );
      }

      if (!this.anotherCanvas) {
        this.anotherCanvas = document.createElement('canvas');
        this.anotherCanvas.width = this.canvas.width;
        this.anotherCanvas.height = this.canvas.height;
        this.anotherContext = this.anotherCanvas.getContext('2d');
      } else {
        this.anotherContext.clearRect(
          0,
          0,
          this.anotherCanvas.width,
          this.anotherCanvas.height
        );
      }
    }

    // 绘制数据
    const context = GLOBAL_MASK.data ? this.anotherContext : this.ctx;
    context.globalAlpha = this.config.opacity;
    context.shadowColor = 'rgba(0, 0, 0, 1)';
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 0;
    context.shadowBlur = this.config.textShadowBlur * 2;
    context.textBaseline = 'top';
    dataShown.forEach(d => {
      context.font = `${d.fontSize}px ${d.fontFamily}`;
      context.fillStyle = d.color;
      context.fillText(d.text, d.left - translateX * d.speedRatio, d.top);
    });

    if (GLOBAL_MASK.data) {
      this.ctx.globalCompositeOperation = 'source-in';
      this.ctx.drawImage(
        this.anotherCanvas,
        0,
        0,
        this.canvas.width,
        this.canvas.height
      );
    }
    this.ctx.restore();

    // 执行渲染后的回调
    if (this.afterRender)
      this.afterRender(this.ctx, this.progress, this.animState);

    // 执行下一帧
    if (this.animation) requestAnimationFrame(() => this._render());
  }

  _play() {
    // 创建动画任务
    if (!this.animation)
      this.animation = requestAnimationFrame(() => this._render());
  }

  goto(progress) {
    if (this.pauseAt !== undefined) this.pauseAt = undefined;
    this.startTime = Date.now() - progress;
    if (!this.animation) this._render();
  }

  play() {
    if (!this.startTime) this.startTime = Date.now();
    if (this.pauseAt !== undefined) {
      this.goto(this.pauseAt);
      this.pauseAt = undefined;
    }
    this._play();
  }

  replay() {
    this.startTime = Date.now();
    if (this.pauseAt !== undefined) this.pauseAt = undefined;
    this._play();
  }

  pause() {
    if (this.animation) {
      cancelAnimationFrame(this.animation);
      this.animation = undefined;

      // 保存暂停时的进度
      this.pauseAt = Date.now() - this.startTime;
    }
  }
}

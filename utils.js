// 异步加载图片(若图片已加载，则使用缓存)
const loadImageCache = {};
export const loadImage = url =>
  new Promise((resolve, reject) => {
    if (loadImageCache[url]) {
      resolve(loadImageCache[url]);
    } else {
      const picture = new Image();
      picture.src = url;

      picture.onload = () => {
        loadImageCache[url] = picture;
        resolve(picture);
      };

      picture.onerror = () => {
        reject();
      };
    }
  });

// 异步获取图像信息(若图片已加载，则使用缓存)
const imageDataCache = {};
export const getImageData = (
  url,
  renderWidth,
  renderHeight,
  dx,
  dy,
  dw,
  dh
) => {
  if (imageDataCache[url]) {
    return Promise.resolve(imageDataCache[url]);
  }

  return loadImage(url).then(picture => {
    const imgViewer = document.createElement('canvas');
    imgViewer.width = renderWidth || picture.width;
    imgViewer.height = renderHeight || picture.height;
    const context = imgViewer.getContext('2d');

    context.drawImage(picture, 0, 0, imgViewer.width, imgViewer.height);
    imageDataCache[url] = context.getImageData(
      dx || 0,
      dy || 0,
      dw || imgViewer.width,
      dh || imgViewer.height
    );

    return imageDataCache[url];
  });
};

// 生成图片的 HTMLImageElement (若图片已存在，则使用缓存)
const imageElementCache = {};
export const makeImageElement = (url, alt) => {
  if (!imageElementCache[url]) {
    imageElementCache[url] = document.createElement('img');
    imageElementCache[url].src = url;
    imageElementCache[url].alt = alt || '';
  }

  return imageElementCache[url];
};

// 考虑浏览器兼容的 requestAnimationFrame 方法
export const requestAnimationFrame =
  window.requestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.msRequestAnimationFrame;

// 考虑浏览器兼容的 cancelAnimationFrame 方法
export const cancelAnimationFrame =
  window.cancelAnimationFrame || window.mozCancelAnimationFrame;

// 同一行相邻弹幕间的最小间隔（占画布宽度的比例）
export const MIN_SEP = 0.05;

// 弹幕布局方法
export const layout = ({ config, canvas, data, avoidOverlap = false }) => {
  // 获取画布上下文
  const canvasContext = canvas.getContext('2d');

  // 弹幕布局
  canvasContext.font = `${config.fontSize}px ${config.fontFamily}`;

  // 弹幕数据按时间排序
  const listSortedByTime = data.sort((a, b) => a.time - b.time);

  // 计算弹幕布局
  const initialList = listSortedByTime.map(
    ({
      key,
      time,
      text,
      fontSize = config.fontSize,
      fontFamily = config.fontFamily,
      color = config.defaultColor,
      createdAt = new Date().toISOString(),
      avatar,
      avatarSize,
      avatarMarginRight,
    }) => {
      // 计算文本宽度
      const { width } = canvasContext.measureText(text);

      const details = {
        key,
        time,
        avatar: avatar || null,
        avatarSize: avatarSize || (avatar ? 1.2 * fontSize : 0),
        avatarMarginRight: avatarMarginRight || (avatar ? 0.2 * fontSize : 0),
        text,
        fontSize,
        fontFamily,
        color,
        createdAt,
        left: (config.speed * time) / 1000 + canvas.width,
        width,
        height: fontSize,
        randomRatio: Math.random(),
        visible: false,
      };
      details.width += details.avatarSize + details.avatarMarginRight;

      return details;
    }
  );

  // 计算跑道数
  const rowCount = Math.floor(
    canvas.height / (config.lineHeight * config.fontSize)
  );

  // 创建跑道（跑道个数为 rowCount）
  const tracks = {};
  new Array(rowCount).fill(0).forEach((n, i) => {
    tracks[i] = [];
  });

  // 填充跑道
  for (let i = 0; i < initialList.length; i++) {
    const item = initialList[i];

    if (!avoidOverlap) {
      // 若不禁止弹幕重叠，则随机分配跑道
      const randomTrackIdx = Math.floor(rowCount * Math.random());
      item.top =
        (config.fontSize * (config.lineHeight - 1)) / 2 +
        randomTrackIdx * config.lineHeight * config.fontSize;
      item.visible = true;

      tracks[randomTrackIdx].push(item);
    } else {
      // 寻找合适的跑道编号
      const suitableTrackIdx = Object.values(tracks).findIndex(t => {
        const { left = canvas.width, width = 0 } = t[t.length - 1] || {};
        return left + width + MIN_SEP * canvas.width < item.left;
      });

      // 若存在合适的跑道，则放置弹幕
      if (suitableTrackIdx >= 0) {
        item.top =
          (config.fontSize * (config.lineHeight - 1)) / 2 +
          suitableTrackIdx * config.lineHeight * config.fontSize;
        item.visible = true;

        const suitableTrack = tracks[suitableTrackIdx];
        const lastItem = suitableTrack[suitableTrack.length - 1];
        if (lastItem) {
          item.prev = lastItem;
          lastItem.next = item;
        }

        tracks[suitableTrackIdx].push(item);
      }
    }
  }

  // 返回可视的弹幕数据集
  return initialList.filter(x => x.visible);
};

// 插入新弹幕的方法
export const insertItem = ({
  item,
  visibleList,
  config,
  canvas,
  avoidOverlap,
}) => {
  const canvasContext = canvas.getContext('2d');
  canvasContext.font = `${config.fontSize}px ${config.fontFamily}`;

  // 补全布局所需属性
  const [initialItem] = [item].map(
    ({
      key,
      time,
      text,
      fontSize = config.fontSize,
      fontFamily = config.fontFamily,
      color = config.defaultColor,
      createdAt = new Date().toISOString(),
      avatar,
      avatarSize,
      avatarMarginRight,
    }) => {
      const { width } = canvasContext.measureText(text);

      const details = {
        key,
        time,
        avatar: avatar || null,
        avatarSize: avatarSize || (avatar ? 1.2 * fontSize : 0),
        avatarMarginRight: avatarMarginRight || (avatar ? 0.2 * fontSize : 0),
        text,
        fontSize,
        fontFamily,
        color,
        createdAt,
        left: (config.speed * time) / 1000 + canvas.width,
        width,
        height: fontSize,
        randomRatio: Math.random(),
        visible: false,
      };
      details.width += details.avatarSize + details.avatarMarginRight;

      return details;
    }
  );

  // 若未禁止弹幕重叠，则随机选择一条跑道插入弹幕
  if (!avoidOverlap) {
    const rowCount = Math.floor(
      canvas.height / (config.lineHeight * config.fontSize)
    );
    const randomTrackIdx = Math.floor(rowCount * Math.random());

    initialItem.visible = true;
    initialItem.top =
      (config.fontSize * (config.lineHeight - 1)) / 2 +
      randomTrackIdx * config.lineHeight * config.fontSize;

    // 更新可视的弹幕数据集
    visibleList.push(initialItem);

    return initialItem;
  }

  // 寻找弹幕可插入的位置
  const jointPos = visibleList.findIndex(
    x =>
      x.left + x.width + MIN_SEP * canvas.width < initialItem.left &&
      ((x.next &&
        initialItem.left + initialItem.width + MIN_SEP * config.fontSize <
          x.next.left) ||
        !x.next)
  );

  // 若存在可插入位置
  if (jointPos >= 0) {
    const jointLeft = visibleList[jointPos];
    const jointRight = jointLeft.next;

    initialItem.visible = true;
    initialItem.top = jointLeft.top;

    if (jointLeft.time !== initialItem.time) {
      jointLeft.next = initialItem;
      initialItem.prev = jointLeft;
    }

    if (jointRight && jointRight.time !== initialItem.time) {
      initialItem.next = jointRight;
      jointRight.prev = initialItem;
    }

    // 更新可视的弹幕数据集
    visibleList.push(initialItem);
  }

  return initialItem;
};

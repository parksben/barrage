// 异步加载图片
export const loadImage = url => {
  const picture = new Image();
  picture.src = url;

  return new Promise((resolve, reject) => {
    picture.onload = () => {
      resolve(picture);
    };
    picture.onerror = () => {
      reject();
    };
  });
};

// 异步获取图像信息
export const getImageData = (url, renderWidth, renderHeight, dx, dy, dw, dh) =>
  loadImage(url).then(picture => {
    const imgViewer = document.createElement('canvas');
    imgViewer.width = renderWidth || picture.width;
    imgViewer.height = renderHeight || picture.height;
    const context = imgViewer.getContext('2d');

    context.drawImage(picture, 0, 0, imgViewer.width, imgViewer.height);
    return context.getImageData(
      dx || 0,
      dy || 0,
      dw || imgViewer.width,
      dh || imgViewer.height
    );
  });

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
    }) => {
      // 计算文本宽度
      const { width } = canvasContext.measureText(text);

      return {
        key,
        time,
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
    }) => {
      const { width } = canvasContext.measureText(text);

      return {
        key,
        time,
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

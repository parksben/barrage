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

export const requestAnimationFrame =
  window.requestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.msRequestAnimationFrame;

export const cancelAnimationFrame =
  window.cancelAnimationFrame || window.mozCancelAnimationFrame;

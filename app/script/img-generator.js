const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

const DEFAULT_OPTIONS = {
  url: require('images/main-meme.jpg'),
  font: '50px Comic Sans',
  textAlign: 'center',
  multilineInitialSpacing: 320,
  initialSpacing: 280,
  lineSpacing: 45,
  positionLeft: 325,
  height: 480,
  width: 650
};

const memeImageTempEl = new Image();

export function createPoster(imageOptions, text) {
  const OPTIONS = Object.assign(DEFAULT_OPTIONS, imageOptions);

  canvas.height = OPTIONS.height;
  canvas.width = OPTIONS.width;

  if (memeImageTempEl.src !== OPTIONS.url) {
    memeImageTempEl.src = OPTIONS.url;
  }

  const imageLoaded = new Promise((resolve) => {
    if (memeImageTempEl.src.indexOf('data:image') === 0) {
      resolve();
    } else {
      memeImageTempEl.onload = resolve;
    }
  });

  const textLines = text
    .replace(/\s+/g, ' ')
    .replace(/.{13,}?\s/g, '$&\n')
    .split(/\n/)
    .slice(0, 2);

  return imageLoaded.then(() => {
    return new Promise((resolve) => {
      ctx.drawImage(memeImageTempEl, 0, 0);
      ctx.font = OPTIONS.font;
      ctx.fillStyle = 'white';
      ctx.textAlign = OPTIONS.textAlign;

      let spacing = textLines.length > 1
        ? OPTIONS.multilineInitialSpacing
        : OPTIONS.initialSpacing;

      textLines.forEach((line) => {
        spacing += OPTIONS.lineSpacing;
        ctx.shadowColor = 'black';

        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 2;
        ctx.shadowBlur = 1;
        ctx.fillText(line, OPTIONS.positionLeft, spacing);
      });

      return canvas.toBlob((blob) =>{
        resolve(blob);
      }, 'image/jpeg', 0.9);
    });

  });
}

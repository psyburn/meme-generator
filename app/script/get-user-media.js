const CONSTRAINTS = {
  // audio: true,
  video: {
    width: 474,
    height: 355
  }
};

let currentStream = null;


export function prepareMediaStream() {
  return new Promise((resolve, reject) => {
    navigator.mediaDevices.getUserMedia(CONSTRAINTS)
      .then(function(mediaStream) {
        currentStream = mediaStream;
        resolve(mediaStream);
      })
      .catch(function(err) {
        reject(err);
      });
  });
}

export function takePicture(sourceVideoElement) {
  const canvas = document.createElement('canvas');
  const width = CONSTRAINTS.video.width;
  const height = CONSTRAINTS.video.height;
  const context = canvas.getContext('2d');
  let photoData = '';
  if (width && height) {
    canvas.width = width;
    canvas.height = height;
    context.drawImage(sourceVideoElement, 0, 0, width, height);

    photoData = canvas.toDataURL('image/png');
  }

  return photoData;
}

export function stopCurrentStream() {
  if (currentStream) {
    currentStream.getTracks().forEach((stream) => {
      stream.stop();
    });
  }
}

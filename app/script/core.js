import {canListen, createListener} from 'voice-control';
import {canSpeak, createSpeaker} from 'speech';
import {createPoster} from 'img-generator';
import {saveImage, getImages} from 'index-db';
import {blobToDataURI} from 'utils';
import {prepareMediaStream, takePicture, stopCurrentStream} from 'get-user-media';
import 'manifest.json';
import queryString from 'query-string';

// don't really write UI stuff like this. it's bad. I'm just playing around.


const isCanvasSupported = (function() {
  const elem = document.createElement('canvas');
  return !!(elem.getContext && elem.getContext('2d'));
})();

const ui = {
  recordVideoElement: document.querySelector('.js-record-video-el'),
  phototaking: document.querySelector('.js-photo-taking-container'),
  photoRecordButton: document.querySelector('.js-record-photo'),
  input: document.querySelector('.js-text-input'),
  image: document.querySelector('.js-preview'),
  downloadButton: document.querySelector('.js-download-button'),
  saveToDBButton: document.querySelector('.js-save-to-db-button'),
  shareForm: document.querySelector('.js-share-form'),
  inputShare: document.querySelector('.js-copy-paste'),
  voiceActivator: document.querySelector('.js-voice-command')
};

const galleryUI = {
  main: document.querySelector('.js-db-gallery'),
  selected: document.querySelector('.js-db-gallery-selected'),
  listItems: document.querySelector('.js-db-gallery-list-items')
};

let currentPhoto = null;
let imageBlob = '';
const listener = {
  isListening: false
};

// showing and hiding stuff for presentation mode
const parsed = queryString.parse(location.search);
const PRESENTATION_MODES = {
  0: '.js-show-stage-2, .js-show-stage-3',
  1: '.js-show-stage-3'
};

const presentationEl = document.querySelectorAll(PRESENTATION_MODES[parsed.mode]);
Array.prototype.slice.call(presentationEl).forEach((el) => {
  el.classList.add('is-hidden');
});


const createMessage = () => {
  const text = ui.input.value;
  createPoster({
    url: currentPhoto || require('images/main-meme.jpg'),
    font: '35px Arial',
    textAlign: 'center',
    multilineInitialSpacing: 250,
    initialSpacing: 280,
    lineSpacing: 45,
    positionLeft: 250,
    height: 355,
    width: 474
  }, text).then((blob) => {
    blobToDataURI(blob).then((urlObj) => {
      ui.image.src = urlObj;
      ui.downloadButton.href = urlObj;
    });
    imageBlob = blob;
  });
};

const toggleVoice = () => {
  if (canListen) {
    if (listener.isListening) {
      listener.isListening = false;
      ui.voiceActivator.classList.remove('is-active');
      return listener.instance.stop();
    }

    listener.isListening = true;
    ui.voiceActivator.classList.add('is-active');
    listener.instance.start();
  }

  return null;
};



(() => {
  if (canListen) {
    listener.instance = createListener();
    let speaker;
    listener.instance.addObserver((text) => {
      ui.input.value = text;
      createMessage();
      toggleVoice();
      if (!speaker) {
        speaker = createSpeaker();
      }
      speaker.speak(text);
    });
  }


  ui.input.onkeyup = createMessage;
  ui.voiceActivator.onclick = toggleVoice;

  ui.saveToDBButton.onclick = () => {
    saveImage(imageBlob);
  };

  document.querySelector('.js-list-images').onclick = () => {
    galleryUI.main.classList.remove('is-hidden');
    galleryUI.listItems.innerHTML = ''; // bljuc -.-
    getImages().then((images) => {
      const imageEl = Promise.all(images.map(blobToDataURI));
      const docFragment = document.createDocumentFragment();

      imageEl.then((blobUris) => {
        blobUris.forEach((uri) => {
          const img = document.createElement('img');
          img.classList.add('js-db-gallery-list-item', 'gallery-items__item', 'gallery-item');
          img.src = uri;
          docFragment.appendChild(img);
        });
        galleryUI.listItems.appendChild(docFragment);
      });
    });
  };

  document.querySelector('.js-db-gallery-close').onclick = () => {
    galleryUI.main.classList.add('is-hidden');
  };

  ui.photoRecordButton.onclick = () => {
    prepareMediaStream().then((mediaStream) => {
      ui.recordVideoElement.srcObject = mediaStream;
      ui.recordVideoElement.onloadedmetadata = function() {
        ui.recordVideoElement.play();
      };
    });
    ui.phototaking.classList.remove('is-hidden');
  };

  document.querySelector('.js-takephoto').onclick = () => {
    currentPhoto = takePicture(ui.recordVideoElement);
    ui.image.src = currentPhoto;
    ui.phototaking.classList.add('is-hidden');
    stopCurrentStream();
  };

  // speech thingies only avalible when we have internet access
  if (!navigator.onLine) {
    ui.voiceActivator.classList.add('is-hidden');
  }

  createMessage();

})();

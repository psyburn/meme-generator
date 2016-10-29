import {extend} from 'utils';

export const canListen = 'webkitSpeechRecognition' in window;

const DEFAULT_OPTIONS = {
  // lang: 'hr-HR',
  continuous: false,
  interimResults: false
};

class Listener {
  constructor(opts) {
    this._listener = new webkitSpeechRecognition(); // eslint-disable-line
    this._listener.lang = opts.lang;
    this._listener.continuous = opts.continuous;
    this._listener.interimResults = opts.interimResults;

    this._observers = [];

    this._listener.onend = this._onEnd.bind(this);
    this._listener.onresult = this._onResult.bind(this);
  }

  start() {
    this._transcript = '';
    this._listener.start();
  }

  stop() {
    this._listener.stop();
    return this._transcript;
  }

  addObserver(observer) {
    this._observers.push(observer);
  }

  removeObserver(observer) {
    const index = this._observers.indexOf(observer);

    if (index !== -1) {
      this._observers.splice(index, 1);
    }
  }

  _onResult(e) {
    for (let i = e.resultIndex; i < e.results.length; i++) {
      this._transcript += e.results[i][0].transcript.toLowerCase();
    }
  }

  _onEnd() {
    this.stop();
    this._observers.forEach((o) => o(this._transcript));
  }
}

export function createListener(options = {}) {
  if (canListen) {
    return new Listener(extend({}, DEFAULT_OPTIONS, options));
  }

  throw new Error('Speech recognition does not work on your device');
}

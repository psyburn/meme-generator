import {extend} from 'utils';

export const canSpeak = 'speechSynthesis' in window;

const DEFAULT_OPTIONS = {
  volume: 1,
  rate: 0.8,
  pitch: 0.375,
  // lang: 'hr-HR'
};

// Attempts to attach a preferred language asynchronously by iso LANG spec.
// If it fails, it just uses the default language.
function yieldLanguageOrDefault(language) {
  return new Promise((resolve) => {
    window.speechSynthesis.onvoiceschanged = () => {
      const voices = window.speechSynthesis.getVoices();
      const langVoices = voices.filter((voice) => voice.lang === language);

      if (langVoices.length > 0) {
        return resolve(langVoices[0]);
      }

      return resolve(voices[0]);
    };
  });
}

export function createSpeaker(opts) {
  const fullOpts = extend({}, DEFAULT_OPTIONS, opts);
  const voicePromise = yieldLanguageOrDefault(fullOpts.lang);

  if (canSpeak) {
    return {
      speak(text) {
        const speakerObj = new SpeechSynthesisUtterance(text);
        speakerObj.volume = fullOpts.volume;
        speakerObj.pitch = fullOpts.pitch;
        speakerObj.rate = fullOpts.rate;
        speakerObj.lang = fullOpts.lang;

        voicePromise.then((voice) => {
          speakerObj.voice = voice;
          window.speechSynthesis.speak(speakerObj);
        });
      }
    };
  }

  throw new Error('Your browser does not support speech synthesis');
}

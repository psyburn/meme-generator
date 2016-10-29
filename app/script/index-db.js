const request = window.indexedDB.open('memeFiles', 2);

let db;

request.onsuccess = function(e) {
  db = e.target.result;
};

request.onupgradeneeded = (event) => {
  db = event.target.result;
  if (db.objectStoreNames.contains('memes')) {
    db.deleteObjectStore('memes');
  }

  db.createObjectStore('memes', {
    autoIncrement: true
  });
};

export function saveImage(imageData) {
  if (!db) {
    throw new Error('no db');
  }
  const trans = db.transaction(['memes'], 'readwrite');
  const store = trans.objectStore('memes');
  const storeRequest = store.put(imageData);
  storeRequest.onsuccess = () => {
    console.log('saved!');
  };

  storeRequest.onerror = () => {
    console.log('not saved :(');
  };
}

export function getImages() {
  return new Promise((resolve) => {
    const trans = db.transaction(['memes'], 'readwrite');
    const store = trans.objectStore('memes');
    const storeAllTrans = store.getAll();
    storeAllTrans.onsuccess = (ev) => {
      resolve(ev.currentTarget.result);
    };
  });
}

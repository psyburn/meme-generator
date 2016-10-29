export function extend(dest, ...sources) {
  sources.forEach((source) => {
    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        dest[key] = source[key];
      }
    }
  });

  return dest;
}

export function strfmt(template, ...params) {
  let index = 0;

  return template.replace(/\{(\d+)?\}/g, function(group, number) {
    return number ? params[parseInt(number, 10)] : params[index++];
  });
}



export function blobToDataURI(blob) {
  return new Promise((resolve) => {
    const fr = new FileReader();
    fr.onload = (e) => {
      resolve(e.target.result);
    };
    fr.readAsDataURL(blob);
  });
}

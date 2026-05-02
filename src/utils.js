export function proxyEvent(from, to, event) {
  from.on(event, (...args) => to.emit(event, ...args));
}

export function replaceURLWithHTMLLinks(text) {
  if (!text) {
    return text;
  }

  // regex is taken from auto-link package
  text = text.replace(
    /((https?:\/\/)|(www\.))(\S+)(\w{2,4})(:[0-9]+)?(\/|\/([\w#!:.?+=&%@\-/]))?/gi,
    url => {
      let full_url = url;
      if (!full_url.match(/^https?:\/\//)) {
        full_url = "http://" + full_url;
      }

      const link = document.createElement("a");
      link.href = full_url;
      link.innerText = url;
      link.setAttribute("target", "_blank");
      return link.outerHTML;
    }
  );
  return text;
}

export function secondsToTimeFormat(seconds) {
  const minute = 60;
  const hour = 60 * minute;
  let hoursPart = "0";
  let minutePart = "0";
  let secondPart = "0";

  if (seconds < 10) {
    return `${minutePart} : 0${seconds}`;
  }
  if (seconds < minute) {
    return `${minutePart} : ${seconds}`;
  }
  if (seconds >= hour) {
    hoursPart = Math.floor(seconds / hour);
    const minAndSec = seconds % hour;
    minutePart = Math.floor(minAndSec / minute);
    secondPart = minAndSec % minute;

    minutePart = minutePart < 10 ? `0${minutePart}` : minutePart;
    secondPart = secondPart < 10 ? `0${secondPart}` : secondPart;

    return `${hoursPart} : ${minutePart} : ${secondPart}`;
  }

  if (seconds < hour) {
    minutePart = Math.floor(seconds / minute);
    secondPart = seconds % minute;

    secondPart = secondPart < 10 ? `0${secondPart}` : secondPart;
    return `${minutePart} : ${secondPart}`;
  }
}

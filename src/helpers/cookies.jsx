
// check all types in js, if it's not a string, convert it to a string
function _parseValue(value) {
  const type = typeof value;
  let result = value;
  if (type === "object") result = JSON.stringify(value);
  if (type === "number") result = value.toString();
  if (type === "boolean") result = value.toString();
  if (type === "undefined") result = "";
  if (value === null) result = "";
  return [result, type];
}

function _convertValue(name, value) {
  const type = _getCookieType(name);
  let result = value;
  if (type === "object") result = JSON.parse(value);
  if (type === "number") result = parseInt(value);
  if (type === "boolean") result = value === "true";
  return result;
}

export function setCookie(name, value, days) {
  let expires, type = "";
  [value, type] = _parseValue(value);
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = `; expires=${date.toUTCString()}`;
  }
  document.cookie = `${name}=${value || ""}${expires}; path=/; SameSite=Strict; Secure;`;
  document.cookie = `${name}-type=${type}${expires}; path=/; SameSite=Strict; Secure;`;
}

function _getCookieType(name) {
  const nameEQ = `${name}-type=`;
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

export function getCookie(name) {
  const nameEQ = `${name}=`;
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) {
      return _convertValue(name, c.substring(nameEQ.length, c.length));
    }
    // if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

export function deleteCookie(name) {
  document.cookie = `${name}=; Max-Age=-99999999;`;
}

// Base64 decoder safe for React Native (Hermes' `atob` is unreliable pre-72;
// silent failures here would cause token-refresh storms / forced logouts).
export function b64decode(str) {
  if (typeof atob === 'function') {
    try { return atob(str); } catch { /* fall through to manual decode */ }
  }
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let s = String(str).replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  let output = '';
  for (let i = 0; i < s.length;) {
    const e1 = chars.indexOf(s.charAt(i++));
    const e2 = chars.indexOf(s.charAt(i++));
    const e3 = chars.indexOf(s.charAt(i++));
    const e4 = chars.indexOf(s.charAt(i++));
    const c1 = (e1 << 2) | (e2 >> 4);
    const c2 = ((e2 & 15) << 4) | (e3 >> 2);
    const c3 = ((e3 & 3) << 6) | e4;
    output += String.fromCharCode(c1);
    if (e3 !== 64) output += String.fromCharCode(c2);
    if (e4 !== 64) output += String.fromCharCode(c3);
  }
  return output;
}

export function decodeJwtPayload(token) {
  try {
    const parts = String(token || '').split('.');
    if (parts.length !== 3) return {};
    return JSON.parse(b64decode(parts[1]));
  } catch {
    return {};
  }
}

// Token expired if missing exp (treat as unsafe) or < 60s remaining.
export function isTokenExpired(token) {
  const payload = decodeJwtPayload(token);
  if (!payload.exp) return true;
  return payload.exp * 1000 < Date.now() + 60000;
}

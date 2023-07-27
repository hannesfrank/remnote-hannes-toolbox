export function isSandboxed() {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
}

// TODO: Only correct in sandbox
export function isDevMode() {
  return window.location.hostname === 'localhost';
}

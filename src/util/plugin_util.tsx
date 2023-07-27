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

declare global {
  interface Window {
    RN_PLUGIN_TEST_MODE: Set<string>;
  }
}

export const RN_PLUGIN_TEST_MODE = new Set<string>();
window.RN_PLUGIN_TEST_MODE = RN_PLUGIN_TEST_MODE;

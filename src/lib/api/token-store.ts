const ACCESS_KEY = "bresomilan-admin-access";
const REFRESH_KEY = "bresomilan-admin-refresh";

function isBrowser() {
  return typeof window !== "undefined";
}

let onSessionExpired: (() => void) | null = null;

export function setOnSessionExpired(listener: () => void): void {
  onSessionExpired = listener;
}

export function getAccessToken(): string | null {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(REFRESH_KEY);
}

export function setTokens(access: string, refresh?: string): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(ACCESS_KEY, access);
  if (refresh) window.localStorage.setItem(REFRESH_KEY, refresh);
}

export function clearTokens(): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(ACCESS_KEY);
  window.localStorage.removeItem(REFRESH_KEY);
  onSessionExpired?.();
}

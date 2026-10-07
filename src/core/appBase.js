/** App mount path from CRA (`PUBLIC_URL=/rms` in production). Empty in local dev. */
export function publicUrl() {
  return (process.env.PUBLIC_URL || "").replace(/\/$/, "");
}

/** Absolute path under the app base, e.g. `/login` → `/rms/login` in prod. */
export function withPublicUrl(path) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${publicUrl()}${normalized}`;
}

/** Hard navigation to login (bypasses React Router; must include PUBLIC_URL). */
export function redirectToLogin() {
  const loginPath = withPublicUrl("/login");
  if (window.location.pathname !== loginPath) {
    window.location.href = loginPath;
  }
}

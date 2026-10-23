/** App mount path from CRA (`PUBLIC_URL=/rms` in production). Empty in local dev. */
export function publicUrl() {
  return (process.env.PUBLIC_URL || "").replace(/\/$/, "");
}

/** Absolute path under the app base, e.g. `/login` → `/rms/login` in prod. */
export function withPublicUrl(path) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${publicUrl()}${normalized}`;
}

/** Hard navigation when the RMS session is missing. Password login is not a route. */
export function redirectToLogin() {
  const path = withPublicUrl("/unauthorized");
  if (window.location.pathname !== path) {
    window.location.href = path;
  }
}

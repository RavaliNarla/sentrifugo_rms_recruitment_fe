const TOKEN_KEY = "rms_access_token";

export const getAccessToken = () => localStorage.getItem(TOKEN_KEY);

export const setAccessToken = (token) => {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
};

export const clearAccessToken = () => localStorage.removeItem(TOKEN_KEY);

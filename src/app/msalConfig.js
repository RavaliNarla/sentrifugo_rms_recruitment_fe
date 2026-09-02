export const msalConfig = {
  auth: {
    clientId: process.env.REACT_APP_MSAL_CLIENT_ID,
    authority: process.env.REACT_APP_MSAL_AUTHORITY,
    redirectUri: process.env.REACT_APP_MSAL_REDIRECT_URI,
    postLogoutRedirectUri: "/login",
    // IMPORTANT: must be false. loginRedirect() is called from /login, so with this left
    // as true (the MSAL default) it silently navigates back to /login right after the
    // token exchange completes on /auth/callback, before our AuthCallback component ever
    // gets to run - which looks exactly like "clicking login just redirects to the same page".
    navigateToLoginRequestUrl: false,
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false,
  },
};

export const loginRequest = {
  scopes: [process.env.REACT_APP_MSAL_SCOPE],
};

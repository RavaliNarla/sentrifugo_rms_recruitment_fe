export const msalConfig = {
  auth: {
    clientId: process.env.REACT_APP_MSAL_CLIENT_ID,
    authority: process.env.REACT_APP_MSAL_AUTHORITY,
    redirectUri: process.env.REACT_APP_MSAL_REDIRECT_URI,
  },
};

export const loginRequest = {
  scopes: [process.env.REACT_APP_MSAL_SCOPE],
};

export const tokenRequest = (account) => ({
  scopes: [process.env.REACT_APP_MSAL_SCOPE],
  account,
});

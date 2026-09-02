// Set once from index.js so plain axios interceptors (outside React context) can
// still acquire a token silently before every API call.
let msalInstance = null;

export const setMsalInstance = (instance) => {
  msalInstance = instance;
};

export const getMsalInstance = () => msalInstance;

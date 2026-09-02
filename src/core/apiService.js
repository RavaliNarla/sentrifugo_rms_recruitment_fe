import axios from "axios";
import { getMsalInstance } from "./msalInstanceHolder";
import { loginRequest } from "../app/msalConfig";

const attachAuthInterceptor = (instance) => {
  instance.interceptors.request.use(async (config) => {
    const msalInstance = getMsalInstance();
    const account = msalInstance?.getActiveAccount();
    if (msalInstance && account) {
      try {
        const result = await msalInstance.acquireTokenSilent({
          ...loginRequest,
          account,
        });
        config.headers.Authorization = `Bearer ${result.accessToken}`;
      } catch (e) {
        // Token acquisition failed - request will proceed without a token and
        // the backend will reject with 401, which surfaces the login screen again.
      }
    }
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }
  );
  return instance;
};

export const recruiterApi = attachAuthInterceptor(
  axios.create({ baseURL: process.env.REACT_APP_RECRUITER_API_URL })
);

export const masterApi = attachAuthInterceptor(
  axios.create({ baseURL: process.env.REACT_APP_MASTER_API_URL })
);

export const authApi = attachAuthInterceptor(
  axios.create({ baseURL: process.env.REACT_APP_AUTH_API_URL })
);

export const recruiterMultipartApi = attachAuthInterceptor(
  axios.create({
    baseURL: process.env.REACT_APP_RECRUITER_API_URL,
    headers: { "Content-Type": "multipart/form-data" },
  })
);

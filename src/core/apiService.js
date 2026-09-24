import axios from "axios";
import { clearAccessToken, getAccessToken } from "./tokenStorage";

const attachAuthInterceptor = (instance) => {
  instance.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        clearAccessToken();
        if (!window.location.pathname.startsWith("/login")) {
          window.location.href = "/login";
        }
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

/** Unauthenticated auth calls (login / forgot / reset). */
export const authPublicApi = axios.create({
  baseURL: process.env.REACT_APP_AUTH_API_URL,
});

export const recruiterMultipartApi = attachAuthInterceptor(
  axios.create({
    baseURL: process.env.REACT_APP_RECRUITER_API_URL,
    headers: { "Content-Type": "multipart/form-data" },
  })
);

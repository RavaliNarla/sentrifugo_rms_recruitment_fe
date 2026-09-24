import { authApi, authPublicApi } from "./apiService";

const authApiService = {
  login: (payload) => authPublicApi.post("/login", payload),
  forgotPassword: (payload) => authPublicApi.post("/forgot-password", payload),
  resetPassword: (payload) => authPublicApi.post("/reset-password", payload),
  getCurrentUser: () => authApi.get("/getdetails/user"),
  getNotifications: () => authApi.get("/notifications"),
  markNotificationsRead: () => authApi.post("/notifications/mark-read"),
};

export default authApiService;

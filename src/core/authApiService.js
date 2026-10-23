import { authApi, authPublicApi } from "./apiService";

const authApiService = {
  login: (payload) => authPublicApi.post("/login", payload),
  hrmsEnter: (hrmsAccessToken) =>
    authPublicApi.post("/hrms/enter", null, {
      timeout: 15000,
      headers: { Authorization: `Bearer ${hrmsAccessToken}` },
    }),
  searchHrmsEmployees: (search, hrmsAccessToken) =>
    authApi.get("/hrms/employees", {
      params: { search },
      headers: { "X-Hrms-Token": hrmsAccessToken },
    }),
  forgotPassword: (payload) => authPublicApi.post("/forgot-password", payload),
  resetPassword: (payload) => authPublicApi.post("/reset-password", payload),
  getCurrentUser: () => authApi.get("/getdetails/user"),
  getNotifications: () => authApi.get("/notifications"),
  markNotificationsRead: () => authApi.post("/notifications/mark-read"),
};

export default authApiService;

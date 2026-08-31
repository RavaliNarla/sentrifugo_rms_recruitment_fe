import { api } from "../../../core/service/apiService";

const dashboardService = {
  getDashboardFilters: () => api.get("/recruiter/dashboard/filters"),

  getDashboardDetails: (payload) =>
    api.post("/recruiter/dashboard/details", payload),

  getDashboardDownload: (payload) =>
    api.post("/recruiter/dashboard/download", payload, {
      responseType: "blob",
    }),
};

export default dashboardService;

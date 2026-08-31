import { api } from "../../../core/service/apiService";

const BASE = "/recruiter/examination-cutoff";

const ExaminationCutoffService = {
  /* ================= GET ALL ================= */

  getConfigurations: () => api.get(`${BASE}/get-configurations`),

  /* ================= GET BY ID ================= */

  getConfigurationById: (id) => api.get(`${BASE}/get-configuration/${id}`),

  /* ================= SAVE ================= */

  saveConfiguration: (payload) =>
    api.post(`${BASE}/save-configuration`, payload),

  /* ================= UPDATE ================= */

  updateConfiguration: (payload) =>
    api.put(`${BASE}/update-configuration`, payload),

  /* ================= DELETE ================= */

  deleteConfiguration: (id) => api.delete(`${BASE}/delete-configuration/${id}`),

  /* ================= CHANGE STATUS ================= */

  updateStatus: (configurationId, status) =>
    api.put(`${BASE}/update-status`, {
      configurationId,
      status,
    }),

  /* ================= DOWNLOAD TEMPLATE ================= */

  downloadTemplate: () =>
    api.get(`${BASE}/download-template`, {
      responseType: "blob",

      headers: {
        "X-Client": "recruiter",
      },
    }),

  /* ================= IMPORT CONFIGURATION ================= */

  importConfiguration: (file) => {
    const formData = new FormData();

    formData.append("file", file);

    return api.post(`${BASE}/import-configuration`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",

        "X-Client": "recruiter",
      },
    });
  },
};

export default ExaminationCutoffService;

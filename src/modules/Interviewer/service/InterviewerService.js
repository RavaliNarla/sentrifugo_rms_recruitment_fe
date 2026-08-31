import { api } from "../../../core/service/apiService";

const BASE = "/recruiter/interviewer";

const InterviewerService = {
  getPanelPositions: () => api.get(`${BASE}/get-panel-positions`),

  getCandidatesByPositionAndDate: (positionId, dateStr) =>
    api.get(`${BASE}/get-candidates-by-position`, {
      params: {
        positionId,
        date: dateStr,
      },
    }),

  downloadInterviewTemplate: (positionId, date) =>
    api.get(`${BASE}/download-interview-scores-template`, {
      params: {
        positionId,
        date,
      },
      headers: {
        "X-Client": "recruiter", // 🔥 ADD THIS
      },
      responseType: "blob",
    }),

  uploadInterviewFile: (file) => {
    const formData = new FormData();
    formData.append("file", file);

    return api.post(`${BASE}/upload-interview-scores`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "X-Client": "recruiter",
      },
    });
  },

  /*  NEW */
  // setCandidateScore: (payload) =>
  //   api.post(`${BASE}/save-candidate-score`, payload),

  setCandidateScoreBatch: (payloadArray) =>
    api.post(`${BASE}/save-candidate-scores`, payloadArray),
};

export default InterviewerService;

import { nodeApi, api } from "../../../core/service/apiService";

const candidateWorkflowServices = {
  /* Users (Node API) */
  // Note: auth header is injected by nodeApi interceptor; no need to pass token manually

  getCandidateAllDetails: (candidateId, positionId) =>
    api.get(
      `/recruiter/candidate-details/get-all-details/${candidateId}/${positionId}`
    ),

  getRegister: () => nodeApi.get("/getdetails/users/all"),

  getJobPositionById: (positionId) =>
    api.get(`/recruiter/job-positions/get-job-position-by-id/${positionId}`),

  generateRankList: (positionId) => {
    return api.get(`/recruiter/candidate-selection/merit-list/${positionId}`);
  },
  /* ================= REQUISITIONS ================= */

  // GET ALL REQUISITIONS
  getRequisitions: (name = "") =>
    api.get("/recruiter/job-requisitions/get-requisitions", {
      params: { name }, // Swagger-supported
    }),

  /* ================= POSITIONS ================= */

  // GET POSITIONS BY REQUISITION ID
  getPositionsByRequisitionId: (requisitionId, name = "") =>
    api.get("/recruiter/job-positions/get-positions", {
      params: { requisitionId, name },
    }),

  //Interview Pool APIs
  getInterviewCandidates: (payload) => {
    return api.post(
      "recruiter/interview-pool/get/interviewed-candidates",
      payload,
      {
        headers: {
          "X-Client": "AzureAD",
        },
      }
    );
  },

  getCompensationCandidates(payload) {
    return api.post(
      "/recruiter/candidate-compensation/get-compensation-candidates",
      payload,
      {
        headers: {
          "X-Client": "recruiter",
        },
      }
    );
  },

  sendToCompensationPool: (payload) => {
    return api.post(
      "/recruiter/candidate-compensation/send-to-compensation-pool",
      payload,
      {
        headers: {
          "X-Client": "recruiter",
        },
      }
    );
  },

  addCompensationDetails: (payload) => {
    return api.post(
      "/recruiter/candidate-compensation/add-compensation-details",
      payload,
      {
        headers: { "X-Client": "recruiter" },
      }
    );
  },

  getPanelScores: (scheduledInterviewId) => {
    return api.get(
      `/recruiter/interview-pool/get-panel-scores/${scheduledInterviewId}`,
      {
        headers: {
          "X-Client": "AzureAD",
        },
      }
    );
  },

  getMessageHistory: (payload, page, size) =>
    api.post("/recruiter/messages/get-history", payload, {
      params: { page, size },
    }),

  getMessagesByThreadId: (conversationThreadId) =>
    api.get(`/recruiter/messages/get-message/${conversationThreadId}`),

  submitForMessageApproval: (payload) =>
    api.post("/recruiter/messages/submit-for-approval", payload),

  getSchedulePoolCandidates: (payload) => {
    return api.post(
      "/recruiter/schedule-pool/get-schedule-pool-candidate-list",
      payload,
      {
        headers: {
          "X-Client": "AzureAD",
        },
      }
    );
  },

  /* =========================
   BULK IMPORT CANDIDATES
========================= */

  bulkImportCandidates: (file) => {
    const formData = new FormData();

    formData.append("file", file);

    return api.post(
      "/recruiter/examination-marks/upload-marks",

      formData,

      {
        headers: {
          "Content-Type": "multipart/form-data",
          "X-Client": "AzureAD",
        },
      }
    );
  },

  /* =========================
   DOWNLOAD TEMPLATE
========================= */

  downloadCandidateTemplate: (positionIds = []) => {
    return api.post(
      "/recruiter/examination-marks/download-template",

      positionIds,

      {
        responseType: "blob",

        validateStatus: function (status) {
          return (status >= 200 && status < 300) || status === 422;
        },

        headers: {
          "X-Client": "AzureAD",
        },
      }
    );
  },

  submitForApproval(payload) {
    return api.post("/recruiter/schedule-pool/submit-for-approval", payload);
  },
};

export default candidateWorkflowServices;

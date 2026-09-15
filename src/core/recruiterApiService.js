import { recruiterApi, recruiterMultipartApi } from "./apiService";

const buildFilePath = (relativePath) => `/files/${relativePath}`;

const recruiterApiService = {
  // Requisitions
  createRequisition: (payload) => recruiterApi.post("/job-requisitions/create", payload),
  updateRequisition: (id, payload) => recruiterApi.put(`/job-requisitions/${id}`, payload),
  getRequisition: (id) => recruiterApi.get(`/job-requisitions/${id}`),
  getRequisitions: (page = 0, size = 20) => recruiterApi.get(`/job-requisitions?page=${page}&size=${size}`),
  getApprovedRequisitions: () => recruiterApi.get("/job-requisitions/approved"),
  getL1Requisitions: () => recruiterApi.get("/job-requisitions/l1-requisitions"),
  getL2Requisitions: () => recruiterApi.get("/job-requisitions/l2-requisitions"),
  submitForApproval: (requisitionIds) => recruiterApi.post("/job-requisitions/submit-for-approval", requisitionIds),
  approveOrReject: (payload) => recruiterApi.post("/job-requisitions/approve-reject", payload),
  markFulfilled: (id) => recruiterApi.post(`/job-requisitions/${id}/fulfil`),

  // Positions
  createPosition: (formData) => recruiterMultipartApi.post("/job-positions/create", formData),
  updatePosition: (id, formData) => recruiterMultipartApi.put(`/job-positions/${id}`, formData),
  deletePosition: (id) => recruiterApi.delete(`/job-positions/${id}`),
  getPositionsByRequisition: (requisitionId) => recruiterApi.get(`/job-positions/by-requisition/${requisitionId}`),
  getActivePositionsByRequisition: (requisitionId) => recruiterApi.get(`/job-positions/active-by-requisition/${requisitionId}`),
  getPosition: (id) => recruiterApi.get(`/job-positions/${id}`),

  // Candidates
  addCandidate: (formData) => recruiterMultipartApi.post("/candidates/add", formData),
  searchCandidates: (params) => recruiterApi.get("/candidates/search", { params }),
  getCandidate: (id) => recruiterApi.get(`/candidates/${id}`),
  shortlistCandidate: (id) => recruiterApi.post(`/candidates/${id}/shortlist`),

  // Files — stored locally on disk; fetch with auth and return a blob URL for preview
  fetchFileBlobUrl: async (relativePath) => {
    if (!relativePath) throw new Error("No file path");
    const response = await recruiterApi.get(buildFilePath(relativePath), { responseType: "blob" });
    const ext = relativePath.split(".").pop()?.toLowerCase();
    const mimeByExt = {
      pdf: "application/pdf",
      png: "image/png",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      gif: "image/gif",
      webp: "image/webp",
      doc: "application/msword",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    };
    const typedBlob = new Blob([response.data], {
      type: mimeByExt[ext] || response.data.type || "application/octet-stream",
    });
    return URL.createObjectURL(typedBlob);
  },

  // Committee management
  createPanel: (payload) => recruiterApi.post("/interview-panels/add", payload),
  updatePanel: (id, payload) => recruiterApi.put(`/interview-panels/update/${id}`, payload),
  deletePanel: (id) => recruiterApi.delete(`/interview-panels/delete/${id}`),
  getPanels: () => recruiterApi.get("/interview-panels/all"),

  assignPanelToPosition: (payload) => recruiterApi.post("/position-panels/assign", payload),
  removePanelFromPosition: (id) => recruiterApi.delete(`/position-panels/${id}`),
  getPanelsByPosition: (positionId) => recruiterApi.get(`/position-panels/by-position/${positionId}`),
  getActivePanelsByPosition: (positionId) => recruiterApi.get(`/position-panels/active-by-position/${positionId}`),

  // Interview scheduling
  scheduleInterviews: (payload) => recruiterApi.post("/interview-scheduling/schedule", payload),

  // Interview pool
  searchInterviewPool: (params) => recruiterApi.get("/interview-pool/search", { params }),
  getMyInterviews: (positionId) => recruiterApi.get("/interview-pool/my-interviews", { params: { positionId } }),
  submitScore: (payload) => recruiterApi.post("/interview-pool/score", payload),
  submitScoreBatch: (payload) => recruiterApi.post("/interview-pool/score-batch", payload),

  // Compensation
  moveToCompensation: (candidateIds) => recruiterApi.post("/compensation-pool/move-in", candidateIds),
  updateSalary: (candidateId, salary) => recruiterApi.put(`/compensation-pool/${candidateId}/salary`, null, { params: { salary } }),
  moveToOffer: (candidateIds) => recruiterApi.post("/compensation-pool/move-to-offer", candidateIds),
  searchCompensationPool: (params) => recruiterApi.get("/compensation-pool/search", { params }),

  // Offers
  generateOffers: (payload) => recruiterApi.post("/offers/generate", payload),
  getOfferByCandidate: (candidateId) => recruiterApi.get(`/offers/by-candidate/${candidateId}`),

  // Dashboard
  getDashboardSummary: () => recruiterApi.get("/dashboard/summary"),
};

export default recruiterApiService;

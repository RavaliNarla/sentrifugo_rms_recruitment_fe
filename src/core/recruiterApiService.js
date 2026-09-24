import { recruiterApi, recruiterMultipartApi } from "./apiService";

const buildFilePath = (relativePath) => `/files/${relativePath}`;

const recruiterApiService = {
  // Requisitions
  createRequisition: (payload) => recruiterApi.post("/job-requisitions/create", payload),
  updateRequisition: (id, payload) => recruiterApi.put(`/job-requisitions/${id}`, payload),
  deleteRequisition: (id) => recruiterApi.delete(`/job-requisitions/${id}`),
  getRequisition: (id) => recruiterApi.get(`/job-requisitions/${id}`),
  getRequisitions: (page = 0, size = 20) => recruiterApi.get(`/job-requisitions?page=${page}&size=${size}`),
  searchRequisitions: (params) => recruiterApi.get("/job-requisitions/search", { params }),
  getRequisitionFilterOptions: () => recruiterApi.get("/job-requisitions/filter-options"),
  getApprovedRequisitions: () => recruiterApi.get("/job-requisitions/approved"),
  getL1Requisitions: (params) => recruiterApi.get("/job-requisitions/l1-requisitions", { params }),
  getL2Requisitions: (params) => recruiterApi.get("/job-requisitions/l2-requisitions", { params }),
  submitForApproval: (requisitionIds) => recruiterApi.post("/job-requisitions/submit-for-approval", requisitionIds),
  approveOrReject: (payload) => recruiterApi.post("/job-requisitions/approve-reject", payload),
  markFulfilled: (id) => recruiterApi.post(`/job-requisitions/${id}/fulfil`),
  unmarkFulfilled: (id) => recruiterApi.post(`/job-requisitions/${id}/unfulfil`),
  getRequisitionApprovalHistory: (id) => recruiterApi.get(`/job-requisitions/${id}/approval-history`),

  // Positions
  createPosition: (formData) => recruiterMultipartApi.post("/job-positions/create", formData),
  updatePosition: (id, formData) => recruiterMultipartApi.put(`/job-positions/${id}`, formData),
  deletePosition: (id) => recruiterApi.delete(`/job-positions/${id}`),
  getPositionsByRequisition: (requisitionId) => recruiterApi.get(`/job-positions/by-requisition/${requisitionId}`),
  getActivePositionsByRequisition: (requisitionId) => recruiterApi.get(`/job-positions/active-by-requisition/${requisitionId}`),
  getPosition: (id) => recruiterApi.get(`/job-positions/${id}`),

  // Candidates
  addCandidate: (formData) => recruiterMultipartApi.post("/candidates/add", formData),
  updateCandidate: (id, formData) => recruiterMultipartApi.put(`/candidates/${id}`, formData),
  deleteCandidate: (id) => recruiterApi.delete(`/candidates/${id}`),
  /** documentType: "photo" | "resume" | "id-proof" */
  deleteCandidateDocument: (id, documentType) =>
    recruiterApi.delete(`/candidates/${id}/documents/${documentType}`),
  searchCandidates: (params) => recruiterApi.get("/candidates/search", { params }),
  getCandidate: (id) => recruiterApi.get(`/candidates/${id}`),
  shortlistCandidate: (id) => recruiterApi.post(`/candidates/${id}/shortlist`),
  /** decision: "SHORTLIST" | "REJECT" | "HOLD" (FRS: Yes / No / On Hold). */
  decideCandidate: (id, decision) => recruiterApi.post(`/candidates/${id}/decision`, { decision }),

  // Files - stored locally on disk; fetch with auth and return a blob URL for preview
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
  searchPanels: (params) => recruiterApi.get("/interview-panels/search", { params }),

  // Interview scheduling
  scheduleInterviews: (payload) => recruiterApi.post("/interview-scheduling/schedule", payload),
  getInterviewSchedules: (params) => recruiterApi.get("/interview-scheduling/schedules", { params }),

  // Interview pool
  searchInterviewPool: (params) => recruiterApi.get("/interview-pool/search", { params }),
  getMyInterviews: (positionId, interviewDate) =>
    recruiterApi.get("/interview-pool/my-interviews", { params: { positionId, interviewDate: interviewDate || undefined } }),
  submitScore: (payload) => recruiterApi.post("/interview-pool/score", payload),
  submitScoreBatch: (payload) => recruiterApi.post("/interview-pool/score-batch", payload),

  // Compensation Management
  moveToCompensation: (candidateIds) => recruiterApi.post("/compensation-pool/move-in", candidateIds),
  updateCompensationDetails: (candidateId, details) => recruiterApi.put(`/compensation-pool/${candidateId}/details`, details),
  moveToOffer: (candidateIds) => recruiterApi.post("/compensation-pool/move-to-offer", candidateIds),
  searchCompensationPool: (params) => recruiterApi.get("/compensation-pool/search", { params }),

  // Offers (draft -> submit for L1/L2 approval -> auto-emailed on L2 approval)
  generateOffers: (payload) => recruiterApi.post("/offers/generate", payload),
  previewOffer: (payload) => recruiterApi.post("/offers/preview", payload),
  submitOffersForApproval: (candidateIds) => recruiterApi.post("/offers/submit-for-approval", candidateIds),
  approveOrRejectOffers: (payload) => recruiterApi.post("/offers/approve-reject", payload),
  getPendingOfferApprovals: (params) => recruiterApi.get("/offers/pending-approval", { params }),
  getOfferByCandidate: (candidateId) => recruiterApi.get(`/offers/by-candidate/${candidateId}`),
  getOfferApprovalHistory: (id) => recruiterApi.get(`/offers/${id}/approval-history`),

  // Dashboard
  getDashboardSummary: () => recruiterApi.get("/dashboard/summary"),
};

export default recruiterApiService;

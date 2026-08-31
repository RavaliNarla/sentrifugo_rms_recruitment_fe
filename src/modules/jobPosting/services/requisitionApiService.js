// src/services/masterApiService.js
import { api } from "../../../core/service/apiService"; // reuse axios instances + interceptors

const requisitionApiService = {
  createRequisition: (formData) =>
    api.post("/recruiter/job-requisitions/create", formData, {
      headers: {
        // 🔥 this removes application/json set globally
        "Content-Type": undefined,
      },
    }),
  deleteRequisition: (id) => api.delete(`/recruiter/job-requisitions/${id}`),

  cancelDraftRequisition: (parentRequisitionId) =>
    api.post(
      `/recruiter/job-requisitions/${parentRequisitionId}/edit-drafts/current/cancel`
    ),

  // get single requisition
  getRequisitionById: (id) => api.get(`/recruiter/job-requisitions/${id}`),

  // update requisition (PUT) — same multipart form-data pattern as create
  updateRequisition: (id, formData) =>
    api.put(`/recruiter/job-requisitions/${id}`, formData, {
      headers: {
        "Content-Type": undefined,
      },
    }),

  getJobRequisitions: ({
    year,
    month,
    status,
    search,
    page,
    size,
    departmentId,
  }) =>
    api.get("/recruiter/job-requisitions", {
      params: {
        year,
        month,
        status,
        search,
        page,
        size,
        ...(departmentId && { departmentId }),
      },
    }),

  getJobRequisitionsWithDrafts: ({
    year,
    month,
    status,
    search,
    page,
    size,
    departmentId,
  }) =>
    api.get("/recruiter/job-requisitions-with-drafts", {
      params: {
        year,
        month,
        status,
        search,
        page,
        size,
        ...(departmentId && { departmentId }),
      },
    }),
  submitForApproval: (payload) =>
    api.post("/recruiter/job-requisitions/submit-for-approval", payload),
  submitForApprovalFlow: (payload) =>
    api.post("/recruiter/job-requisitions/submit-for-approval-new", payload),
  getAvailableYears: () => api.get("/recruiter/job-requisitions/get-years"),

  editDraftRequisition: (requisitionId, positionIds = []) =>
    api.post(
      `/recruiter/job-requisitions/${requisitionId}/edit-drafts`,
      positionIds.length ? { positionIds } : {}
    ),

  getCurrentDraftRequisition: (parentRequisitionId) =>
    api.get(
      `/recruiter/job-requisitions/${parentRequisitionId}/edit-drafts/current`,
      {
        headers: {
          "X-Client": "AzureAD",
        },
      }
    ),

  saveDraftDetails: (requisitionId, payload) =>
    api.put(
      `/recruiter/job-requisitions/${requisitionId}/edit-drafts/current`,
      payload
    ),

  autoApproveDraftRequisition: (parentRequisitionId, comments = "") =>
    api.post(
      `/recruiter/job-requisitions/${parentRequisitionId}/edit-drafts/current/submit-for-approval`,
      { comments },
      {
        headers: {
          "X-Client": "AzureAD",
        },
      }
    ),

  publishDraftRequisition: (parentRequisitionId) =>
    api.post(
      `/recruiter/job-requisitions/${parentRequisitionId}/edit-drafts/current/publish`,
      null,
      {
        headers: {
          "X-Client": "AzureAD",
        },
      }
    ),

  reinitializeRequisition: (payload) =>
    api.post("/recruiter/job-requisitions/reinitialize", payload, {
      headers: {
        "X-Client": "AzureAD",
      },
    }),

  getDraftRequisitionApprovalHistory(draftId) {
    return api.get(
      `/recruiter/workflow-approval/get-draft-requisition-approval-history/${draftId}`
    );
  },
};

export default requisitionApiService;

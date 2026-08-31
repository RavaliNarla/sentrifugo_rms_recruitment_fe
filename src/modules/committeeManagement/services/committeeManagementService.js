import { nodeApi, api, apis } from "../../../core/service/apiService";

const committeeManagementService = {
  getAllusers: () => nodeApi.get(`/getdetails/users/all`),

  getPanelMembers: () => apis.get(`/interview-panels/get/panel-members`),

  // GET ALL REQUISITIONS
  getRequisitions: (name = "") =>
    api.get("/recruiter/job-requisitions/get-requisitions"),

  getPositionsByRequisition: (requisitionId) =>
    api.get("/recruiter/job-positions/get-positions", {
      params: { requisitionId }, // ✅ query param
    }),
  assignPanelToPosition: (jobPositionId, payload) =>
    api.post(
      `/recruiter/position-panel/save-or-update/${jobPositionId}`,
      payload
    ),

  getPanelsByPosition(positionId) {
    return api.get(`recruiter/position-panel/get-by-position-id/${positionId}`);
  },

  // Bulk import methods for panels
  bulkAddPanels: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return apis.post("/interview-panels/upload-excel", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  downloadPanelTemplate: () =>
    apis.get("/interview-panels/download-panel-template", {
      responseType: "blob",
    }),

  // Bulk import methods for position assignments
  bulkImportPositionAssignments: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/recruiter/position-panel/upload-excel", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  downloadPositionAssignmentTemplate: () =>
    api.get("/recruiter/position-panel/download-assignment-template", {
      responseType: "blob",
    }),

  approvePanels: (ids, comments) =>
    api.post("/recruiter/position-panel/approve-committee", {
      positionPanelIds: ids,
      comments: comments,
    }),

  rejectPanels: (ids, comments) =>
    api.post("/recruiter/position-panel/reject-committee", {
      positionPanelIds: ids,
      comments: comments,
    }),
  getRequisitionApprovalHistory: (panelId) =>
    api.get(
      `/recruiter/workflow-approval/get-panels-approval-history/${panelId}`
    ),
  getExtensionApprovals: (body, params = {}) =>
    api.post("recruiter/messages/get-approvals", body, {
      params,
    }),
  getRequestTypes: () => apis.get("/master-dd-data/get/request-types"),

  getMessagesByThreadId: (conversationThreadId) =>
    api.get(`/recruiter/messages/get-message/${conversationThreadId}`),

  submitForL1L2Approval: (body) =>
    api.post("/recruiter/messages/submit-for-l1-l2-approval", body),

  getApprovalHistoryByThreadId: (conversationThreadId) =>
    api.get(
      `/recruiter/workflow-approval/get-conversation-threads-approval-history/${conversationThreadId}`
    ),
  getPositionDetailsInterviewApproval: (requisitionId) =>
    api.get(
      `/recruiter/schedule-pool/get-position-details-interview-approval/${requisitionId}`
    ),

  submitL1Approval: (body) =>
    api.post("/recruiter/schedule-pool/submit-l1-approval", body),

  getExamConfigList: (requisitionId) =>
    api.get("/recruiter/examination-config/get-all-list", {
      params: {
        requisitionIds: [requisitionId],
      },
    }),
  approveOrRejectExamConfig: (payload) =>
    api.post("/recruiter/examination-config/approve-or-reject", payload),
  getWorkflowHistory: (examConfigId) =>
    api.get(`/recruiter/examination-config/workflow-history/${examConfigId}`),
  getApprovalHistory: (requisitionId) =>
    api.post(`/recruiter/schedule-pool/get-approval-history/${requisitionId}`),
  getOfferApprovalCandidates: (body) =>
    api.post("/recruiter/offer-approval/candidates/search", body),
  approveOrRejectOfferApproval(payload) {
    return api.post("/recruiter/offer-approval/approve-or-reject", payload);
  },
  getOfferApprovalWorkflowHistory(historyId) {
    return api.get(
      `/recruiter/offer-approval/workflow-history/${historyId}`
    );
  },
};

export default committeeManagementService;

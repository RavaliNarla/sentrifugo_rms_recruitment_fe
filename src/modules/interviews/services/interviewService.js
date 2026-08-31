import { api } from "../../../core/service/apiService";

const interviewService = {
  getPanelsByPosition(payload) {
    return api.post(
      `recruiter/interview-scheduling/get-assigned-panels`,
      payload
    );
  },
  allocatePanels(payload) {
    return api.post(
      `recruiter/interview-scheduling/allocate-interview`,
      payload
    );
  },
  scheduleInterview(payload) {
    return api.post(
      `recruiter/interview-scheduling/schedule-interview`,
      payload
    );
  },
  getScheduledSlots(payload) {
    return api.post(`recruiter/interview-scheduling/scheduled-slots`, payload);
  },
};

export default interviewService;

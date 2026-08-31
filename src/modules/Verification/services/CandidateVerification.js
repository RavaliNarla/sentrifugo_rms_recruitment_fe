import { api } from "../../../core/service/apiService";

const CandidateVerificationService = {
  /* ================= GET BY DATE ================= */
  getCandidatesByDate: (dateStr) =>
    api.get("/recruiter/zonal-verification/candidates", {
      params: { date: dateStr },
    }),

  updateAbsentStatusBatch: (payload) =>
    api.post("/recruiter/zonal-verification/update-absent-statuses", payload),
};

export default CandidateVerificationService;

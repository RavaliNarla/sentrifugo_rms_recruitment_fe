const getStatusBadge = (status = "") => {
  switch (status) {
    case "L1_PENDING":
      return "warning";

    case "L2_PENDING":
      return "info";

    case "APPROVED":
      return "success";

    case "L1_REJECTED":
    case "L2_REJECTED":
      return "danger";

    default:
      return "secondary";
  }
};

export const mapApprovalRequisition = (item = {}) => ({
  id: item.id ?? "",
  requisitionId: item.requisitionCode ?? "",
  code: item.requisitionTitle ?? "",
  status: item.status || item.requisitionStatus || "",
  statusType: getStatusBadge(item.status || item.requisitionStatus),
  departments: item.departmentCount ?? 0,
  positions: item.positionCount ?? 0,
  vacancies: item.vacancyCount ?? 0,
  startDate: item.startDate ?? "",
  endDate: item.endDate ?? "",
  isDraft: item.isDraft === true,
  hasDraftPositions: item.hasDraftPositions === true,
  parentRequisitionId: item.parentRequisitionId ?? null,
  editable: false, // approvals should NOT be editable
});

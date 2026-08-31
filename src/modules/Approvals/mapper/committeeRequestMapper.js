// Helper function to get status variant for badge styling
const getStatusVariant = (status) => {
  switch (status?.toLowerCase()) {
    case "approved":
      return "success";
    case "pending":
      return "warning";
    case "rejected":
      return "danger";
    default:
      return "secondary";
  }
};

// Main mapper function to transform committee request data
export const mapCommitteeRequest = (data) => ({
  id: data.id,
  requisitionId: data.requisition,
  positionName: data.position,
  panelType: data.panelType,
  panelMembers: data.panelMembers,
  startDate: data.startDate,
  endDate: data.endDate,
  status: data.status,
  statusType: getStatusVariant(data.status),
});

// Helper function to map an array of committee requests
export const mapCommitteeRequests = (dataArray) => {
  if (!Array.isArray(dataArray)) {
    return [];
  }
  return dataArray.map(mapCommitteeRequest);
};

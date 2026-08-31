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

// Main mapper function to transform extension request data
export const mapExtensionRequest = (data) => ({
  id: data.id,
  name: data.name,
  initials: data.initials,
  regNo: data.regNo,
  requestDate: data.requestDate,
  requestTime: data.requestTime,
  requisitionId: data.requisition,
  positionName: data.position,
  requestType: data.requestType,
  status: data.status,
  statusType: getStatusVariant(data.status),
});

// Helper function to map an array of extension requests
export const mapExtensionRequests = (dataArray) => {
  if (!Array.isArray(dataArray)) {
    return [];
  }
  return dataArray.map(mapExtensionRequest);
};

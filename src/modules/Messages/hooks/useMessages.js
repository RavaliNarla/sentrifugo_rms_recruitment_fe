import { useState } from "react";
export const useMessages = () => {
  const [selectedRequisitionId, setSelectedRequisitionId] = useState("");
  const [selectedPositionId, setSelectedPositionId] = useState("");
  const [date, setDate] = useState("");
  const [openRow, setOpenRow] = useState(null);
  const toggleRow = (id) => {
    setOpenRow((prev) => (prev === id ? null : id));
  };
  const getStatusClass = (status) => {
    switch (status) {
      case "L1 Approved":
      case "L2 Approved":
        return "msg-status-approved";
      case "L1 Rejected":
      case "L2 Rejected":
      case "Rejected":
        return "msg-status-rejected";
      default:
        return "msg-status-default";
    }
  };
  const getHistoryColor = (type) => {
    return type === "request" ? "#ff9800" : "#2196f3";
  };
  return {
    selectedRequisitionId,
    selectedPositionId,
    date,
    openRow,
    setSelectedRequisitionId,
    setSelectedPositionId,
    setDate,
    toggleRow,
    getStatusClass,
    getHistoryColor,
  };
};

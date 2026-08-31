import { useState } from "react";
import jobPositionApiService from "../../jobPosting/services/jobPositionApiService";
import masterApiService from "../../master/services/masterApiService";

export const useRequisitionApprovalHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = async (requisitionId) => {
    try {
      setLoading(true);

      const [historyRes, usersRes] = await Promise.all([
        jobPositionApiService.getRequisitionApprovalHistory(requisitionId),
        masterApiService.getUser(),
      ]);

      const historyData = historyRes?.data || [];
      const users = usersRes?.data || [];

      // ✅ userId → name map
      const userMap = {};

      users.forEach((user) => {
        userMap[user.userId] = user.name;
      });

      // ✅ attach name
      const updatedHistory = historyData.map((item) => ({
        ...item,
        approverName: userMap[item.approverId] || "-",
      }));

      setHistory(updatedHistory);
    } finally {
      setLoading(false);
    }
  };

  return { history, setHistory, loading, fetchHistory };
};

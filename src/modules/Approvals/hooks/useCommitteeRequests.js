import { useState } from "react";
import committeeManagementService from "../../committeeManagement/services/committeeManagementService";
import { toast } from "react-toastify";
import masterApiService from "../../master/services/masterApiService";

const useCommitteeRequests = () => {
  const [requisitionOptions, setRequisitionOptions] = useState([]);
  const [positionOptions, setPositionOptions] = useState([]);
  const [panelData, setPanelData] = useState({
    interviewPanelList: [],
    screeningPanelList: [],
    compensationPanelList: [],
  });

  const [loadingRequisitions, setLoadingRequisitions] = useState(false);
  const [loadingPositions, setLoadingPositions] = useState(false);
  const [loadingPanels, setLoadingPanels] = useState(false);

  const fetchRequisitions = async () => {
    try {
      setLoadingRequisitions(true);

      const res = await committeeManagementService.getRequisitions();
      const data = res?.data || [];

      const mapped = data.map((req) => ({
        label: `${req.requisitionCode} - ${req.requisitionTitle}`,
        value: req.id,
        raw: {
          id: req.id,
          requisitionCode: req.requisitionCode,
          requisitionTitle: req.requisitionTitle,
        },
      }));

      setRequisitionOptions(mapped);
    } catch {
      toast.error("Failed to load requisitions");
    } finally {
      setLoadingRequisitions(false);
    }
  };

  const fetchPositions = async (reqId) => {
    try {
      setLoadingPositions(true);

      const res =
        await committeeManagementService.getPositionsByRequisition(reqId);
      const data = res?.data || [];

      const mapped = data.map((item) => ({
        label: item.masterPositions?.positionName,
        value: item.jobPositions?.positionId,
        raw: {
          ...item.jobPositions,
          ...item.masterPositions,
        },
      }));

      setPositionOptions(mapped);
    } catch {
      toast.error("Failed to load positions");
    } finally {
      setLoadingPositions(false);
    }
  };

  const fetchPanels = async (positionId) => {
    try {
      setLoadingPanels(true);

      const res =
        await committeeManagementService.getPanelsByPosition(positionId);
      const data = res?.data || {};

      setPanelData({
        interviewPanelList: data.interviewPanelList || [],
        screeningPanelList: data.screeningPanelList || [],
        compensationPanelList: data.compensationPanelList || [],
      });
    } catch {
      toast.error("Failed to load panels");
    } finally {
      setLoadingPanels(false);
    }
  };

  const clearPanels = () => {
    setPanelData({
      interviewPanelList: [],
      screeningPanelList: [],
      compensationPanelList: [],
    });
  };
  const approvePanels = async (ids, comment, positionId) => {
    try {
      const res = await committeeManagementService.approvePanels(ids, comment);

      if (!res?.success) {
        throw new Error(res?.message || "Approval failed");
      }

      toast.success("Panels approved successfully");

      // REFRESH PANELS
      await fetchPanels(positionId);

      return true;
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message || "Approval failed"
      );

      return false;
    }
  };
  const rejectPanels = async (ids, comment, positionId) => {
    try {
      const res = await committeeManagementService.rejectPanels(ids, comment);

      if (!res?.success) {
        throw new Error(res?.message || "Rejection failed");
      }

      toast.success("Panels rejected successfully");

      await fetchPanels(positionId);

      return true;
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message || "Rejection failed"
      );

      return false;
    }
  };
  const fetchApprovalHistory = async (panelId) => {
    try {
      const [historyRes, usersRes] = await Promise.all([
        committeeManagementService.getRequisitionApprovalHistory(panelId),
        masterApiService.getUser(),
      ]);

      const historyData = historyRes?.data || [];
      const users = usersRes?.data || [];

      // Build userId -> name map
      const userMap = {};

      users.forEach((user) => {
        userMap[user.userId] = user.name;
      });

      // Attach approverName
      const mappedHistory = historyData.map((item) => ({
        ...item,
        approverName: userMap[item.approverId] || "Unknown User",
      }));

      return mappedHistory;
    } catch (error) {
      toast.error("Failed to load approval history");
      return [];
    }
  };

  return {
    requisitionOptions,
    positionOptions,
    panelData,

    loadingRequisitions,
    loadingPositions,
    loadingPanels,

    fetchRequisitions,
    fetchPositions,
    fetchPanels,
    clearPanels,
    setPositionOptions,
    approvePanels,
    rejectPanels,

    fetchApprovalHistory,
  };
};

export default useCommitteeRequests;

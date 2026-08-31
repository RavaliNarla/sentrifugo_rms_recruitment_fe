import { useCallback, useMemo, useState } from "react";
import { toast } from "react-toastify";
import committeeManagementService from "../../committeeManagement/services/committeeManagementService";
import masterApiService from "../../master/services/masterApiService";

const useExtensionRequests = () => {
  const [requisitionOptions, setRequisitionOptions] = useState([]);
  const [positionOptions, setPositionOptions] = useState([]);
  const [requestTypeOptions, setRequestTypeOptions] = useState([]);
  const [extensionRequests, setExtensionRequests] = useState([]);

  const [threadMessagesMap, setThreadMessagesMap] = useState({});
  const [loadingThreadMessages, setLoadingThreadMessages] = useState(false);

  const [loadingRequisitions, setLoadingRequisitions] = useState(false);
  const [loadingPositions, setLoadingPositions] = useState(false);
  const [loadingRequestTypes, setLoadingRequestTypes] = useState(false);
  const [loadingExtensions, setLoadingExtensions] = useState(false);

  const [historyData, setHistoryData] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [interviewCenters, setInterviewCenters] = useState([]);

  const [approvalPage, setApprovalPage] = useState({
    totalPages: 0,
    totalElements: 0,
    size: 10,
    number: 0,
  });

  const fetchThreadMessages = useCallback(async (threadId) => {
    if (!threadId) return [];

    try {
      setLoadingThreadMessages(true);

      const res =
        await committeeManagementService.getMessagesByThreadId(threadId);
      const messages = res?.data?.content || res?.data || [];

      setThreadMessagesMap((prev) => ({
        ...prev,
        [threadId]: messages,
      }));

      return messages;
    } catch {
      toast.error("Failed to load thread messages");
      return [];
    } finally {
      setLoadingThreadMessages(false);
    }
  }, []);

  const fetchRequisitions = useCallback(async () => {
    try {
      setLoadingRequisitions(true);
      const res = await committeeManagementService.getRequisitions();
      const data = res?.data || [];

      setRequisitionOptions(
        data.map((req) => ({
          label: `${req.requisitionCode} - ${req.requisitionTitle}`,
          value: req.id,
          raw: req,
        }))
      );
    } catch {
      toast.error("Failed to load requisitions");
    } finally {
      setLoadingRequisitions(false);
    }
  }, []);

  const fetchPositions = useCallback(async (reqId) => {
    try {
      setLoadingPositions(true);
      const res =
        await committeeManagementService.getPositionsByRequisition(reqId);
      const data = res?.data || [];

      setPositionOptions(
        data.map((item) => ({
          label: item.masterPositions?.positionName,
          value: item.jobPositions?.positionId,
          raw: {
            ...item.jobPositions,
            ...item.masterPositions,
          },
        }))
      );
    } catch {
      toast.error("Failed to load positions");
    } finally {
      setLoadingPositions(false);
    }
  }, []);

  const fetchRequestTypes = useCallback(async () => {
    try {
      setLoadingRequestTypes(true);
      const res = await committeeManagementService.getRequestTypes();
      const data = res?.data || [];

      setRequestTypeOptions(
        data.map((item) => ({
          label: item.requestName,
          value: item.requestTypeId,
          raw: item,
        }))
      );
    } catch {
      toast.error("Failed to load request types");
    } finally {
      setLoadingRequestTypes(false);
    }
  }, []);

  const fetchInterviewCenters = useCallback(async () => {
    try {
      const res = await masterApiService.getAllInterviewCenters();
      const data = res?.data || [];
      setInterviewCenters(data);
      return data;
    } catch (error) {
      toast.error("Failed to load interview centres");
      return [];
    }
  }, []);

  const zonalDisplayMap = useMemo(() => {
    return (interviewCenters || []).reduce((acc, item) => {
      if (item?.interviewCentreId) {
        acc[item.interviewCentreId] = item.displayName;
      }
      return acc;
    }, {});
  }, [interviewCenters]);

  const fetchExtensionRequests = useCallback(
    async ({
      requisitionId,
      positionId,
      requestTypeId,
      status,
      searchInput,
      page = 0,
      size = 10,
    }) => {
      try {
        setLoadingExtensions(true);

        const body = {
          requisitionId: requisitionId || null,
          positionsIds: positionId ? [positionId] : [],
          requestTypeIds: requestTypeId ? [requestTypeId] : [],
          statusList: status && status !== "ALL" ? [status] : [],
          searchText: searchInput?.trim() || "",
        };

        const res = await committeeManagementService.getExtensionApprovals(
          body,
          {
            page,
            size,
          }
        );

        const data = res?.data?.data || res?.data || {};

        setExtensionRequests(data?.content || []);
        setApprovalPage(
          data?.page || {
            totalPages: 0,
            totalElements: 0,
            size,
            number: page,
          }
        );
      } catch {
        toast.error("Failed to load extension requests");
        setExtensionRequests([]);
        setApprovalPage({
          totalPages: 0,
          totalElements: 0,
          size,
          number: page,
        });
      } finally {
        setLoadingExtensions(false);
      }
    },
    []
  );

  const fetchApprovalHistory = useCallback(async (conversationThreadId) => {
    if (!conversationThreadId) return [];

    try {
      setLoadingHistory(true);

      const [historyRes, usersRes] = await Promise.all([
        committeeManagementService.getApprovalHistoryByThreadId(
          conversationThreadId
        ),
        masterApiService.getUser(),
      ]);

      const historyData = historyRes?.data?.data || historyRes?.data || [];
      const users = usersRes?.data?.data || usersRes?.data || [];

      const userMap = {};
      users.forEach((user) => {
        userMap[user.userId] = user.name;
      });

      const mappedHistory = Array.isArray(historyData)
        ? historyData.map((item) => ({
            ...item,
            approverName:
              userMap[item.approverId] || item.approverName || "Unknown User",
          }))
        : [];

      setHistoryData(mappedHistory);
      return mappedHistory;
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to load approval history"
      );
      setHistoryData([]);
      return [];
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  return {
    requisitionOptions,
    positionOptions,
    requestTypeOptions,
    extensionRequests,
    setExtensionRequests,
    loadingRequisitions,
    loadingPositions,
    loadingRequestTypes,
    loadingExtensions,
    fetchRequisitions,
    fetchPositions,
    fetchRequestTypes,
    fetchExtensionRequests,
    setPositionOptions,
    threadMessagesMap,
    fetchThreadMessages,
    loadingThreadMessages,
    approvalPage,
    setApprovalPage,
    historyData,
    loadingHistory,
    fetchApprovalHistory,
    fetchInterviewCenters,
    interviewCenters,
    zonalDisplayMap,
  };
};

export default useExtensionRequests;

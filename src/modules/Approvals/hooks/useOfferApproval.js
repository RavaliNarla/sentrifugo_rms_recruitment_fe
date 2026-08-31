import { useCallback, useState } from "react";
import { toast } from "react-toastify";

import committeeManagementService from "../../committeeManagement/services/committeeManagementService";

import { mapOfferApprovalCandidate } from "../mapper/offerApprovalMapper";
import masterApiService from "../../master/services/masterApiService";

const useOfferApproval = () => {
  const [requisitionOptions, setRequisitionOptions] = useState([]);
  const [positionOptions, setPositionOptions] = useState([]);
  const [candidates, setCandidates] = useState([]);

  const [loadingRequisitions, setLoadingRequisitions] = useState(false);
  const [loadingPositions, setLoadingPositions] = useState(false);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
    const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);


  const [pageData, setPageData] = useState({
    totalPages: 0,
    totalElements: 0,
    size: 10,
    number: 0,
  });
  const clearCandidates = useCallback(() => {
    setCandidates([]);

    setPageData({
      totalPages: 0,
      totalElements: 0,
      size: 10,
      number: 0,
    });
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

  const fetchPositions = useCallback(async (requisitionId) => {
    try {
      setLoadingPositions(true);

      const res =
        await committeeManagementService.getPositionsByRequisition(
          requisitionId
        );

      const data = res?.data || [];

      setPositionOptions(
        data.map((item) => ({
          label: item.masterPositions?.positionName,
          value: item.jobPositions?.positionId,
          raw: item,
        }))
      );
    } catch {
      toast.error("Failed to load positions");
    } finally {
      setLoadingPositions(false);
    }
  }, []);

  const fetchCandidates = useCallback(
    async ({ positionId, searchText = "", page = 0, size = 10 }) => {
      try {
        setLoadingCandidates(true);

        const body = {
          searchText,
          positionIds: positionId ? [positionId] : [],
          statusList: [
            "L1_PENDING",
            "L1_REJECTED",
            "L2_PENDING",
            "L2_REJECTED",
            "APPROVED",
          ],
          page,
          size,
        };

        const res =
          await committeeManagementService.getOfferApprovalCandidates(body);

        const data = res?.data?.data || res?.data || {};

        setCandidates((data?.content || []).map(mapOfferApprovalCandidate));

        setPageData(
          data?.page || {
            totalPages: 0,
            totalElements: 0,
            size,
            number: page,
          }
        );
      } catch (error) {
        toast.error(
          error?.response?.data?.message || "Failed to load candidates"
        );

        setCandidates([]);
      } finally {
        setLoadingCandidates(false);
      }
    },
    []
  );
  const approveOrRejectCandidates = useCallback(async (payload, actionType) => {
    try {
      await committeeManagementService.approveOrRejectOfferApproval(payload);

      toast.success(
        actionType === "approve"
          ? "Approved successfully"
          : "Rejected successfully"
      );

      return true;
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to process request"
      );

      return false;
    }
  }, []);
  const getWorkflowHistory = useCallback(async (historyId) => {
    try {
      const res =
        await committeeManagementService.getOfferApprovalWorkflowHistory(
          historyId
        );

      return res?.data || [];
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to load approval history"
      );

      return [];
    }
  }, []);
  const fetchUsers = useCallback(async () => {
    try {
      setLoadingUsers(true);

      const res = await masterApiService.getUser();

      const data = Object.values(res?.data || {});

      setUsers(data);

      return data;
    } catch (error) {
      toast.error("Failed to load users");

      setUsers([]);

      return [];
    } finally {
      setLoadingUsers(false);
    }
  }, []);
  return {
    requisitionOptions,
    positionOptions,
    candidates,
     users, // <-- must be here

    loadingRequisitions,
    loadingPositions,
    loadingCandidates,

    pageData,

    fetchRequisitions,
    fetchPositions,
    fetchCandidates,
    approveOrRejectCandidates,
    clearCandidates,
    getWorkflowHistory,
    fetchUsers
  };
};

export default useOfferApproval;

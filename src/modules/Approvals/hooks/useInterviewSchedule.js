import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import committeeManagementService from "../../committeeManagement/services/committeeManagementService";
import masterApiService from "../../master/services/masterApiService";

const useInterviewSchedule = () => {
  const [requisitionOptions, setRequisitionOptions] = useState([]);
  const [loadingRequisitions, setLoadingRequisitions] = useState(false);

  const [positionDetails, setPositionDetails] = useState([]);
  const [loadingPositionDetails, setLoadingPositionDetails] = useState(false);

  const [masterPositions, setMasterPositions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loadingMasters, setLoadingMasters] = useState(false);
  const [loadingL1Approval, setLoadingL1Approval] = useState(false);

  const fetchMasters = useCallback(async () => {
    try {
      setLoadingMasters(true);

      const res = await masterApiService.getAllMasters();
      const data = res?.data?.data || res?.data || {};

      setMasterPositions(
        Array.isArray(data?.masterPositions) ? data.masterPositions : []
      );
      setDepartments(Array.isArray(data?.departments) ? data.departments : []);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load masters");
      setMasterPositions([]);
      setDepartments([]);
    } finally {
      setLoadingMasters(false);
    }
  }, []);

  const fetchRequisitions = useCallback(async () => {
    try {
      setLoadingRequisitions(true);

      const res = await committeeManagementService.getRequisitions();
      const data = res?.data?.data || res?.data?.content || res?.data || [];

      setRequisitionOptions(
        data.map((req) => ({
          label: `${req.requisitionCode} - ${req.requisitionTitle}`,
          value: req.id,
          raw: req,
        }))
      );
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to load requisitions"
      );
      setRequisitionOptions([]);
    } finally {
      setLoadingRequisitions(false);
    }
  }, []);

  const getPositionNameFromMaster = useCallback(
    (jobPositionDTO) => {
      const masterPositionId =
        jobPositionDTO?.masterPositionId || jobPositionDTO?.positionId;

      const found = masterPositions.find(
        (m) =>
          m.masterPositionsId === masterPositionId ||
          m.positionId === masterPositionId ||
          m.id === masterPositionId
      );

      return found?.positionName || "-";
    },
    [masterPositions]
  );

  const getDepartmentNameFromMaster = useCallback(
    (jobPositionDTO) => {
      const deptId = jobPositionDTO?.deptId;

      const found = departments.find(
        (d) =>
          d.departmentId === deptId || d.deptId === deptId || d.id === deptId
      );

      return found?.departmentName || "-";
    },
    [departments]
  );

  const fetchPositionDetailsByRequisition = useCallback(
    async (requisitionId) => {
      if (!requisitionId) {
        setPositionDetails([]);
        return;
      }

      try {
        setLoadingPositionDetails(true);

        const res =
          await committeeManagementService.getPositionDetailsInterviewApproval(
            requisitionId
          );

        const data = res?.data?.data || res?.data || [];

        const mapped = Array.isArray(data)
          ? data.map((item, index) => {
              const job = item?.jobPosition || {};
              const approval = item?.interviewApprovalDetails || null;
              const history = Array.isArray(item?.interviewApprovalHistory)
                ? [...item.interviewApprovalHistory]
                    .sort(
                      (a, b) =>
                        new Date(b?.approvalOn || 0).getTime() -
                        new Date(a?.approvalOn || 0).getTime()
                    )
                    .map((h, hIndex) => ({
                      id: h?.id || hIndex,
                      date: h?.approvalOn || "-",
                      status: h?.status || "-",
                      totalCandidateCount: h?.totalCandidateCount || 0,
                      totalZonalCount: h?.totalZonalCount || 0,
                      totalPanelCount: h?.totalPanelCount || 0,
                      zones: h?.zonalData || [],
                      panels: h?.panelData || [],
                      isHistory: true,
                    }))
                : [];

              const latestHistory = history.length > 0 ? history[0] : null;

              return {
                positionId: job?.positionId || index,
                positionName: getPositionNameFromMaster(job),
                departmentName: getDepartmentNameFromMaster(job),

                status: approval?.status || latestHistory?.status || "-",
                approvalOn: approval?.approvalOn || "-",

                canTakeAction: approval?.isHistory === false, // only this controls buttons

                totalCandidateCount: approval?.totalCandidateCount ?? 0,
                totalZonalCount: approval?.totalZonalCount ?? 0,
                totalPanelCount: approval?.totalPanelCount ?? 0,
                zones: approval?.zonalData ?? [],
                panels: approval?.panelData ?? [],

                history,
                raw: item,
              };
            })
          : [];

        setPositionDetails(mapped);
      } catch (error) {
        toast.error(
          error?.response?.data?.message || "Failed to load position details"
        );
        setPositionDetails([]);
      } finally {
        setLoadingPositionDetails(false);
      }
    },
    [getDepartmentNameFromMaster, getPositionNameFromMaster]
  );

  const submitL1Approval = useCallback(
    async ({ positionIds, status, remarks = "" }) => {
      if (!positionIds || positionIds.length === 0) return;

      try {
        setLoadingL1Approval(true);

        const payload = {
          positionIds,
          status,
          remarks,
        };

        const res = await committeeManagementService.submitL1Approval(payload);

        if (res?.success === false) {
          toast.error(res?.message || "Failed to submit approval");
        } else {
          toast.success("Submitted successfully");
        }

        return res;
      } catch (error) {
        toast.error(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to submit approval"
        );
        throw error;
      } finally {
        setLoadingL1Approval(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchMasters();
  }, [fetchMasters]);

  return {
    requisitionOptions,
    loadingRequisitions,
    fetchRequisitions,

    positionDetails,
    loadingPositionDetails,
    fetchPositionDetailsByRequisition,

    loadingMasters,

    submitL1Approval,
    loadingL1Approval,
  };
};

export default useInterviewSchedule;

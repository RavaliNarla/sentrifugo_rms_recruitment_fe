// src/modules/jobPostings/hooks/useJobRequisitions.js

import { useEffect, useState } from "react";
import requisitionApiService from "../services/requisitionApiService";
import { mapJobRequisitionFromApi } from "../mappers/jobReqDetailsMapper";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

export const useJobRequisitions = ({
  year,
  month,
  status,
  search,
  page = 0,
  size = 0,
  departmentId,
}) => {
  const { t } = useTranslation("jobPostingsList");
  const [requisitions, setRequisitions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageInfo, setPageInfo] = useState(null);
  const [yearOptions, setYearOptions] = useState([]);

  const fetchRequisitions = async () => {
    try {
      setLoading(true);

      const res = await requisitionApiService.getJobRequisitionsWithDrafts({
        year,
        status,
        search,
        page,
        size,
        departmentId,
        ...(month && { month: Number(month) }),
      });

      const content = res?.data?.content || [];

      const flattened = content.flatMap((item) => {
        const result = [];

        // ✅ Main requisition
        result.push({
          ...item,
          isDraft: false,
        });

        // ✅ Draft requisition (if exists)
        if (item.draft) {
          const draftPositions = item.draft.positions || [];

          const draftPositionCount = draftPositions.length;

          const draftVacancyCount = draftPositions.reduce(
            (sum, p) => sum + Number(p.totalVacancies || 0),
            0
          );

          result.push({
            ...item.draft,

            id: item.draft.draftId,
            requisitionCode: item.requisitionCode, // fallback
            requisitionTitle: item.draft.requisitionTitle,
            requisitionStatus: item.draft.requisitionStatus || "DRAFT",
            parentRequisitionId: item.id,

            // 🔥 CORRECT VALUES
            departmentCount: draftPositions.length
              ? new Set(draftPositions.map((p) => p.deptId)).size
              : 0,
            positionCount: draftPositionCount,
            vacancyCount: draftVacancyCount,

            isDraft: true,
          });
        }

        return result;
      });

      setRequisitions(flattened.map(mapJobRequisitionFromApi));

      setPageInfo(res.data.page);
    } catch (err) {
      toast.error(t("requisitions_fetch_failed"));
    } finally {
      setLoading(false);
    }
  };

  const deleteRequisition = async (id) => {
    try {
      await requisitionApiService.deleteRequisition(id);
      toast.success(t("requisition_delete_success"));
      fetchRequisitions(); // refresh list
    } catch {
      toast.error(t("requisition_delete_failed"));
    }
  };
  const submitForApproval = async (jobRequisitionIds, postingStatus) => {
    if (!jobRequisitionIds?.length) return;

    try {
      setLoading(true);

      const res = await requisitionApiService.submitForApprovalFlow({
        jobRequisitionIds,
        postingStatus,
      });

      if (res?.success === false) {
        toast.error(t("requisition_submit_failed"));
        return;
      }

      toast.success(t("requisition_submit_success"));
      fetchRequisitions();
    } catch (err) {
      toast.error(t("requisition_submit_failed"));
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableYears = async () => {
    try {
      const res = await requisitionApiService.getAvailableYears();
      setYearOptions(res.data || []);
    } catch {
      toast.error(t("years_fetch_failed"));
    }
  };
  useEffect(() => {
    fetchAvailableYears();
  }, []);

  useEffect(() => {
    fetchRequisitions();
  }, [year, month, status, search, page, size, departmentId]);

  return {
    requisitions,
    loading,
    pageInfo,
    yearOptions,
    deleteRequisition,
    submitForApproval,
    refetch: fetchRequisitions,
  };
};

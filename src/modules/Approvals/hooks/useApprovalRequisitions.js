import jobPositionApiService from "../../jobPosting/services/jobPositionApiService";
import { useEffect, useState } from "react";
import { mapApprovalRequisition } from "../mapper/mapApprovalRequisition";

import { useSelector } from "react-redux";

export const useApprovalRequisitions = ({
  year,
  search,
  page,
  size,
  statuses,
}) => {
  const [requisitions, setRequisitions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageInfo, setPageInfo] = useState(null);

  const privileges = useSelector((state) => state.user.privileges);

  const isL1 = privileges?.["L1 Approval"];
  const isL2 = privileges?.["L2 Approval"];

  const approvalLevel = isL2 ? "L2" : isL1 ? "L1" : null;

  const fetchRequisitions = async () => {
    try {
      setLoading(true);

      let response;

      if (approvalLevel === "L1") {
        response = await jobPositionApiService.getL1Requisitions({
          year,
          search,
          page,
          size,
          statuses,
        });
      } else if (approvalLevel === "L2") {
        response = await jobPositionApiService.getL2Requisitions({
          year,
          search,
          page,
          size,
          statuses,
        });
      } else {
        return;
      }

      const data = response?.data;
      const content = data?.content || [];

      const hiddenDraftStatuses =
        approvalLevel === "L1"
          ? ["DRAFT"]
          : approvalLevel === "L2"
            ? ["DRAFT", "L1_REJECTED", "L1_PENDING"]
            : [];

      const flattened = content.flatMap((item) => {
        const result = [];

        // NORMAL REQUISITION
        result.push({
          ...item,
          isDraft: false,
        });

        // DRAFT REQUISITION
        if (
          item.draft &&
          !hiddenDraftStatuses.includes(item.draft.requisitionStatus)
        ) {
          const draftPositions = item.draft.positions || [];

          result.push({
            ...item.draft,

            id: item.draft.draftId,

            requisitionCode: item.requisitionCode,
            requisitionTitle: item.draft.requisitionTitle,

            requisitionStatus: item.draft.requisitionStatus || "DRAFT",

            departmentCount: draftPositions.length
              ? new Set(draftPositions.map((p) => p.deptId)).size
              : 0,

            positionCount: draftPositions.length,

            vacancyCount: draftPositions.reduce(
              (sum, p) => sum + Number(p.totalVacancies || 0),
              0
            ),

            isDraft: true,

            parentRequisitionId: item.id,
          });
        }

        return result;
      });

      const mapped = flattened.map(mapApprovalRequisition);

      setRequisitions(mapped);

      setPageInfo(data?.page || null);
    } catch (error) {
      console.error("Error fetching requisitions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!approvalLevel) return;
    fetchRequisitions();
  }, [year, approvalLevel, search, page, size, statuses]);

  const approve = async (ids, comment) => {
    const response = await jobPositionApiService.approveRequisitions({
      ids,
      postingStatus: approvalLevel === "L1" ? "L2_PENDING" : "APPROVED",
      comments: comment,
    });

    await fetchRequisitions();
    return response;
  };

  const reject = async (ids, comment) => {
    const response = await jobPositionApiService.approveRequisitions({
      ids,
      postingStatus: approvalLevel === "L1" ? "L1_REJECTED" : "L2_REJECTED",
      comments: comment,
    });

    await fetchRequisitions();
    return response;
  };

  return {
    requisitions,
    loading,
    pageInfo,
    approve,
    reject,
  };
};

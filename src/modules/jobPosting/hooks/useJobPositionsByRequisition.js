// src/modules/jobPostings/hooks/useJobPositionsByRequisition.js
import { useState } from "react";
import { toast } from "react-toastify";
import jobPositionApiService from "../services/jobPositionApiService";
import { useMasterData } from "../hooks/useMasterData";
import { useTranslation } from "react-i18next";

export const useJobPositionsByRequisition = () => {
  const { t } = useTranslation("jobPostingsList");
  const [positionsByReq, setPositionsByReq] = useState({});
  const [loadingReqId, setLoadingReqId] = useState(null);

  const { positions: masterPositions, departments } = useMasterData();

  const positionMap = {};
  masterPositions.forEach((p) => {
    positionMap[p.id] = p.name;
  });

  const fetchPositions = async (requisitionId, isDraft = false) => {
    // if (positionsByReq[requisitionId]) return;
    const key = `${requisitionId}_${isDraft}`;

    if (positionsByReq[key]) return;

    try {
      setLoadingReqId(requisitionId);

      const res = isDraft
        ? await jobPositionApiService.getDraftPositionsByRequisition(
          requisitionId
        )
        : await jobPositionApiService.getPositionsByRequisition(requisitionId);

      const list = res?.data || [];

      const departmentMap = {};
      departments.forEach((d) => {
        departmentMap[d.id] = d.label;
      });

      const enriched = list.map((api) => ({
        positionId: api.positionId || api.id,
        masterPositionId: api.masterPositionId,
        positionName: positionMap[api.masterPositionId] || "—",
        deptId: api.deptId,
        departmentName: departmentMap[api.deptId] || "—",
        vacancies: api.totalVacancies ?? 0,
        minAge: api.eligibilityAgeMin,
        maxAge: api.eligibilityAgeMax,
        indentPath: api.indentPath,
        indentName: api.indentName,
        approvedBy: api.approvedBy,
        approvedOn: api.approvedOn,
        mandatoryEducation: api.mandatoryEducation ?? "",
        preferredEducation: api.preferredEducation ?? "",
        parentPositionId: api.parentPositionId,
      }));

      setPositionsByReq((prev) => ({
        ...prev,
        [key]: enriched,
      }));
    } catch {
      toast.error(t("positions_load_failed"));
    } finally {
      setLoadingReqId(null);
    }
  };

  // ✅ DELETE POSITION
  const deletePosition = async (requisitionId, positionId, isDraft = false) => {
    try {
      await jobPositionApiService.deletePositionById(positionId);

      const key = `${requisitionId}_${isDraft}`;

      setPositionsByReq((prev) => ({
        ...prev,
        [key]: (prev[key] || []).filter((p) => p.positionId !== positionId),
      }));

      toast.success(t("position_deleted_success"));
    } catch {
      toast.error(t("position_delete_failed"));
    }
  };

  return {
    positionsByReq,
    loadingReqId,
    fetchPositions,
    deletePosition,
  };
};

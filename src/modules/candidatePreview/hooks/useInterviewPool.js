import { useState, useEffect, useCallback } from "react";
import { mapInterviewCandidates } from "../mappers/interviewMapper";
import candidateWorkflowServices from "../services/CandidateWorkflowServices";
import masterApiService from "../../master/services/masterApiService";
import { useTranslation } from "react-i18next";

export default function useInterviewPool({
  positionId,
  filters,
  page,
  pageSize,
  enabled,
}) {
  const { t } = useTranslation(["candidateWorkflow", "common"]);
  const [data, setData] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);

  const [centreMap, setCentreMap] = useState({});
  const [panelMap, setPanelMap] = useState({});

  // 🔹 Fetch interview centres/panels when interview pool is active
  useEffect(() => {
    const fetchMasters = async () => {
      let centreRes, panelRes;

      // Fetch centres
      try {
        centreRes = await masterApiService.getAllInterviewCenters();
        const centres = centreRes?.data || [];
        const centreLookup = {};
        centres.forEach((c) => {
          centreLookup[c.interviewCentreId] = c.displayName;
        });
        setCentreMap(centreLookup);
      } catch (err) {
        console.error("Failed to fetch interview centres:", err);
        setCentreMap({});
      }

      // Fetch panels
      try {
        panelRes = await masterApiService.getInterviewPanels();
        const panels = panelRes?.data || [];
        const panelLookup = {};
        panels.forEach((p) => {
          panelLookup[p.interviewPanelId] = p.panelName;
        });
        setPanelMap(panelLookup);
      } catch (err) {
        console.error("Failed to fetch interview panels:", err);
        setPanelMap({});
      }
    };

    // Only fetch masters when the hook is enabled and there are position IDs
    if (!enabled || !(positionId && positionId.length)) return;

    fetchMasters();
  }, [enabled, positionId]);

  const fetchInterviewCandidates = useCallback(async () => {
    if (!enabled || !positionId.length) {
      setData([]);
      setTotalElements(0);
      return;
    }
    setLoading(true);

    try {
      // Only fetch interview statuses: SCHEDULED, QUALIFIED, DISQUALIFIED, PROVISIONALLY_APPROVED, PENDING
      const INTERVIEW_STATUSES = [
        "SCHEDULED",
        "QUALIFIED",
        "DISQUALIFIED",
        "PROVISIONALLY_APPROVED",
        "PENDING",
        "ZONAL_ABSENT",
        "INTERVIEW_ABSENT",
        "ZONAL_REJECTED",
        "RESCHEDULED",
      ];

      const res = await candidateWorkflowServices.getInterviewCandidates({
        searchText: filters.searchText || "",
        positionIds: positionId,
        statusList: filters.status.length ? filters.status : INTERVIEW_STATUSES,
        page,
        size: pageSize,
      });

      const apiData = res?.data;

      setData(
        mapInterviewCandidates(apiData?.content || [], centreMap, panelMap)
      );

      setTotalElements(apiData?.page?.totalElements || 0);
    } catch (err) {
      console.error(
        t("candidateWorkflow:failed_fetch_interview_candidates"),
        err
      );
    } finally {
      setLoading(false);
    }
  }, [
    positionId,
    filters.searchText,
    filters.status,
    page,
    pageSize,
    enabled,
    centreMap,
    panelMap,
  ]);

  useEffect(() => {
    fetchInterviewCandidates();
  }, [fetchInterviewCandidates]);

  return {
    interviewCandidates: data,
    totalElements,
    loading,
    refetch: fetchInterviewCandidates,
  };
}

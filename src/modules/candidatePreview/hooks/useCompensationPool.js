import { useEffect, useState } from "react";
import candidateWorkflowServices from "../services/CandidateWorkflowServices";
import { useSelector } from "react-redux";

export default function useCompensationPool({
  positionId,
  filters,
  page,
  pageSize,
  enabled,
  refreshKey,
}) {
  const [data, setData] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);

  const user = useSelector((state) => state.user.user);

  useEffect(() => {
    if (!enabled || !positionId) {
      setData([]);
      setTotalElements(0);
      return;
    }

    fetchData();
  }, [positionId, filters, page, pageSize, enabled, refreshKey]);

  const role = user?.role?.toLowerCase();

  const ALL_STATUSES =
    role === "committee_member"
      ? ["PENDING", "APPROVED", "REJECTED", "RENEGOTIATE"]
      : ["NEW", "SUBMITTED", "PENDING", "APPROVED", "REJECTED", "RENEGOTIATE"];

  const fetchData = async () => {
    if (!enabled) return;

    setLoading(true);
    try {
      const res = await candidateWorkflowServices.getCompensationCandidates({
        searchText: filters.searchText || "",
        positionId,
        statusList: filters.status.length ? filters.status : ALL_STATUSES,
        page,
        size: pageSize,
      });

      const apiData = res?.data;

      //  APPLY MAPPING HERE
      const mappedData = mapCompensationCandidates(apiData?.content || []);

      //  SET MAPPED DATA (IMPORTANT)
      setData(mappedData);

      setTotalElements(apiData?.page?.totalElements || 0);

      //  FORCE NEW ARRAY (VERY IMPORTANT)
      setData([...(apiData?.content || [])]);

      setTotalElements(apiData?.page?.totalElements || 0);
    } catch (err) {
      console.error("Compensation fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [positionId, filters, page, pageSize, enabled]);

  return { data, totalElements, loading, refetch: fetchData };
}

export const mapCompensationCandidates = (apiData = []) => {
  return apiData.map((item, index) => {
    const comp = item.candidateCompensation || {};
    const profile = comp.candidateProfile || {};
    const app = comp.application || {};

    const mapped = {
      id: comp.candidateCompensationId,
      candidateId: comp.candidateId,
      name: profile.firstName + " " + profile.lastName,
      regNo: app.applicationNo,

      fileUrl: item.resumeUrl,
      submitBeforeDate: comp.submitBeforeDate,

      status: comp.compensationStatus,
      negotiation: comp.compensationStatus,

      currentCtc: comp.currentCtc,
      expectedCtc: comp.expectedCtc,
      agreedCtc: comp.agreedCtc,

      hike: comp.hike,

      fixedPay: comp.fixedPay,
      variablePay: comp.variablePay,
      joiningBonus: comp.joiningBonus,

      recruiterComments: comp.recruiterComments,
      panelComments: comp.panelComments,
    };

    return mapped;
  });
};

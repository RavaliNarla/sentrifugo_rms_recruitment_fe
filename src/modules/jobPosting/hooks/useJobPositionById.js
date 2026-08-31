import { useEffect, useState, useCallback } from "react";
import jobPositionApiService from "../services/jobPositionApiService";

export const useJobPositionById = (positionId, options = {}) => {
  const { isDraft, parentRequisitionId } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchPosition = useCallback(async () => {
    if (!positionId) return;

    setLoading(true);

    try {
      let res;

      if (isDraft) {
        // 🔥 USE EXISTING LIST API → FILTER
        const draftRes =
          await jobPositionApiService.getDraftPositionsByRequisition(
            parentRequisitionId
          );

        const list = draftRes?.data || [];

        const match = list.find(
          (p) => String(p.positionId || p.id) === String(positionId)
        );

        res = { data: match };
      } else {
        res = await jobPositionApiService.getPositionById(positionId);
      }

      setData(res?.data || null);
    } catch (e) {
      console.error("Failed to fetch position", e);
    } finally {
      setLoading(false);
    }
  }, [positionId, isDraft, parentRequisitionId]);

  useEffect(() => {
    fetchPosition();
  }, [fetchPosition]);

  return { data, loading, refetch: fetchPosition };
};

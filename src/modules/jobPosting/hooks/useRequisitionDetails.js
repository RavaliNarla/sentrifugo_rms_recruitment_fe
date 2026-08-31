import { useEffect, useState } from "react";
import requisitionApiService from "../services/requisitionApiService";

export const useRequisitionDetails = (requisitionId) => {
  const [requisition, setRequisition] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!requisitionId) return;

    let active = true;
    setLoading(true);

    requisitionApiService
      .getRequisitionById(requisitionId)
      .then((res) => {
        if (active) {
          setRequisition(res.data);
        }
      })
      .catch((err) => {
        if (active) {
          console.error("Failed to fetch requisition", err);
          setError(err);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [requisitionId]);

  return { requisition, loading, error };
};

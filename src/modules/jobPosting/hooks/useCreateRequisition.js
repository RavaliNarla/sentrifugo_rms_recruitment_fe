// src/modules/jobPostings/hooks/useRequisition.js
import { useState, useEffect } from "react";
import requisitionApiService from "../services/requisitionApiService";
import { REQUISITION_CONFIG } from "../config/requisitionConfig";

export const useCreateRequisition = (editId, mode, isDraftMode = false) => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState(null);
  const [requisitionData, setRequisitionData] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    cutoffDate: "",
  });

  // Fetch data if in Edit Mode
  useEffect(() => {
    if (!editId) return;

    const loadData = async () => {
      setFetching(true);

      try {
        const res = isDraftMode
          ? await requisitionApiService.getCurrentDraftRequisition(editId)
          : await requisitionApiService.getRequisitionById(editId);

        // 🔥 different response shapes
        const data = res?.data || {};

        setRequisitionData(data);

        // ❗ skip prefill for reinitialize
        if (mode === "reinitialize") {
          setFormData({
            title: "",
            description: "",
            startDate: "",
            endDate: "",
            cutoffDate: "",
          });

          return;
        }

        setFormData({
          title: data.requisitionTitle || "",
          description: data.requisitionDescription || "",
          startDate: data.startDate ? data.startDate.split("T")[0] : "",
          endDate: data.endDate ? data.endDate.split("T")[0] : "",
          cutoffDate: data.cutoffDate ? data.cutoffDate.split("T")[0] : "",
        });
      } catch (err) {
        console.error(err);
        setError("Failed to load requisition data.");
      } finally {
        setFetching(false);
      }
    };

    loadData();
  }, [editId, mode, isDraftMode]);

  // Handle Input Changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "startDate" && value) {
        const d = new Date(value);
        d.setDate(d.getDate() + REQUISITION_CONFIG.DEFAULT_DURATION_DAYS);
        updated.endDate = d.toISOString().split("T")[0];
      }

      return updated;
    });
  };

  // Save/Update Logic
  const saveRequisition = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const response = editId
        ? await requisitionApiService.updateRequisition(editId, payload)
        : await requisitionApiService.createRequisition(payload);
      return response.data;
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to save requisition";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    setFormData,
    handleInputChange,
    saveRequisition,
    loading,
    fetching,
    error,
    requisitionData,
  };
};

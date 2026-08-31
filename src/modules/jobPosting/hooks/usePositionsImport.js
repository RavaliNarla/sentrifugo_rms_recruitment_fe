// src/modules/jobPostings/hooks/usePositionsImport.js
import { useState } from "react";
import jobPositionApiService from "../services/jobPositionApiService";

export const usePositionsImport = () => {
  const [loading, setLoading] = useState(false);

  /* ================= UPLOAD ================= */
  const bulkImport = async (requisitionId, file) => {
    if (!requisitionId) {
      throw new Error("requisitionId is required to import positions");
    }

    setLoading(true);
    try {
      const res = await jobPositionApiService.bulkImport(requisitionId, file);

      if (res?.success === false) {
        return {
          success: false,
          error: res.data,
          details: res.data || [],
        };
      }

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err?.response?.data?.message || "Failed to import positions",
      };
    } finally {
      setLoading(false);
    }
  };

  /* ================= DOWNLOAD ================= */
  const downloadPositionTemplate = async () => {
    try {
      const res = await jobPositionApiService.downloadTemplate();

      const url = window.URL.createObjectURL(res.data);
      const link = document.createElement("a");

      link.href = url;
      link.download = "JobPositionsExcelModel_template.xlsx";
      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Template download failed", err);
    }
  };

  return {
    bulkImport,
    downloadPositionTemplate,
    loading,
  };
};

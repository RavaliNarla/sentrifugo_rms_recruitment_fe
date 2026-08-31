import { useState } from "react";

import { toast } from "react-toastify";

import candidateWorkflowServices from "../services/CandidateWorkflowServices";

export const useCandidateImport = () => {
  const [loading, setLoading] = useState(false);

  const bulkImportCandidates = async (file) => {
    setLoading(true);

    try {
      const res = await candidateWorkflowServices.bulkImportCandidates(file);

      if (res.success === false) {
        return {
          success: false,
          error: res.message,
          details: res.data || [],
        };
      }

      toast.success(res.message || "Candidates imported successfully");

      return {
        success: true,
      };
    } catch (err) {
      console.error("IMPORT ERROR", err);

      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to import candidates";

      const details = err?.response?.data?.data || [];

      toast.error(message);

      return {
        success: false,

        error: message,

        details: Array.isArray(details) ? details : [],
      };
    } finally {
      setLoading(false);
    }
  };

  const downloadCandidateTemplate = async (positionIds = []) => {
    try {
      const res =
        await candidateWorkflowServices.downloadCandidateTemplate(positionIds);
      // HANDLE NON-200 RESPONSE
      if (res.status !== 200) {
        let errorData = {};

        try {
          const text = await res.data.text();

          errorData = JSON.parse(text);
        } catch (e) {
          console.error("ERROR PARSE FAILED", e);
        }

        return {
          success: false,

          error: errorData?.data || errorData?.message || "Download failed",

          details: errorData?.data || [],
        };
      }

      // SUCCESS FILE DOWNLOAD
      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;

      link.download = "candidate-template.xlsx";

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);

      return {
        success: true,
      };
    } catch (err) {
      console.error("DOWNLOAD TEMPLATE ERROR", err);

      // HANDLE BLOB ERROR RESPONSE
      if (err?.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();

          const errorData = JSON.parse(text);

          return {
            success: false,

            error: errorData?.data || errorData?.message || "Download failed",

            details: errorData?.data || [],
          };
        } catch (parseErr) {
          console.error("BLOB PARSE ERROR", parseErr);
        }
      }

      return {
        success: false,

        error:
          err?.response?.data?.data ||
          err?.response?.data?.message ||
          err?.message ||
          "Download failed",

        details: err?.response?.data?.data || [],
      };
    }
  };

  return {
    loading,

    bulkImportCandidates,

    downloadCandidateTemplate,
  };
};

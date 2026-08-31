// src/modules/master/pages/JobGrade/hooks/useJobGrades.js

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

import masterApiService from "../../../services/masterApiService";
import { mapJobGradesFromApi } from "../mappers/jobGradeMapper";

export const useJobGrades = () => {
  const { t } = useTranslation(["jobGrade"]);
  const [jobGrades, setJobGrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const fetchJobGrades = async () => {
    try {
      const res = await masterApiService.getAllJobGrades();
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];

      const sorted = [...list].sort((a, b) => {
        const da = new Date(a.createdDate || 0).getTime();
        const db = new Date(b.createdDate || 0).getTime();
        return db - da;
      });

      setJobGrades(mapJobGradesFromApi(sorted));
    } catch {
      toast.error(t("fetch_error"));
    }
  };

  useEffect(() => {
    fetchJobGrades();
  }, []);

  const addJobGrade = async (payload) => {
    try {
      await masterApiService.addJobGrade(payload);
      await fetchJobGrades();
      toast.success(t("add_success"));
    } catch (error) {
      toast.error(error?.response?.data?.message || t("add_error"));
    }
  };

  const updateJobGrade = async (id, payload) => {
    try {
      await masterApiService.updateJobGrade(id, payload);
      await fetchJobGrades();
      toast.success(t("update_success"));
    } catch (error) {
      toast.error(error?.response?.data?.message || t("update_error"));
    }
  };

  const deleteJobGrade = async (id) => {
    try {
      await masterApiService.deleteJobGrade(id);
      await fetchJobGrades();
      toast.success(t("delete_success"));
    } catch (error) {
      toast.error(error?.response?.data?.message || t("delete_error"));
    }
  };

  const downloadJobGradeTemplate = async () => {
    try {
      const res = await masterApiService.downloadJobGradeTemplate();

      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "JobGrade_Template.xlsx";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error(t("jobGrade:download_error") || "Download failed");
    }
  };

  const bulkAddJobGrades = async (file) => {
    setLoading(true);
    try {
      const res = await masterApiService.bulkAddJobGrades(file);

      //  business failure
      if (res.success === false) {
        toast.error(res.message);
        return {
          success: false,
          error: res.message,
          details: res.data || [],
        };
      }
      // success
      toast.success(res.message || "File uploaded successfully");

      return {
        success: true,
      };
    } catch (err) {
      //  network / server error

      const message = "Something went wrong";
      toast.error(message);

      return {
        success: false,
        error: message,
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    jobGrades,
    fetchJobGrades,
    addJobGrade,
    updateJobGrade,
    deleteJobGrade,
    bulkAddJobGrades,
    downloadJobGradeTemplate,
  };
};

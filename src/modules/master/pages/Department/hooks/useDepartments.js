import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import masterApiService from "../../../services/masterApiService";
import { mapDepartmentsFromApi } from "../mappers/departmentMapper";
import { useTranslation } from "react-i18next";

export const useDepartments = () => {
  const { t } = useTranslation(["department", "validation"]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchDepartments = async () => {
    try {
      const res = await masterApiService.getAllDepartments();

      const apiList = Array.isArray(res.data) ? res.data : res.data?.data || [];

      const mapped = mapDepartmentsFromApi(apiList);
      setDepartments(mapped);
    } catch (err) {
      console.error("Department fetch failed", err);
      setDepartments([]);
    }
  };

  const bulkAddDepartments = async (file) => {
    setLoading(true);

    try {
      const res = await masterApiService.bulkAddDepartments(file);
      if (res.success === false) {
        return {
          success: false,
          error: res.message,
          details: res.data || [], //  ADD THIS
        };
      }

      await fetchDepartments();
      toast.success(res.message || "File uploaded successfully");

      return {
        success: true,
      };
    } catch (err) {
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
  const downloadDepartmentTemplate = async () => {
    try {
      const res = await masterApiService.downloadDepartmentTemplate();
      const blob = res.data;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "DepartmentsDTO_template.xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
      toast.error(
        t("department:download_error") || "Failed to download template"
      );
    }
  };
  useEffect(() => {
    fetchDepartments();
  }, []);

  const addDepartment = async (payload) => {
    await masterApiService.addDepartment(payload);
    await fetchDepartments();
    toast.success(t("department:add_success"));
  };

  const updateDepartment = async (id, payload) => {
    await masterApiService.updateDepartment(id, payload);
    await fetchDepartments();
    toast.success(t("department:update_success"));
  };

  const deleteDepartment = async (id) => {
    await masterApiService.deleteDepartment(id);
    await fetchDepartments();
    toast.success(t("department:delete_success"));
  };

  return {
    departments,
    loading,
    fetchDepartments,
    addDepartment,
    updateDepartment,
    deleteDepartment,
    bulkAddDepartments,
    downloadDepartmentTemplate,
  };
};

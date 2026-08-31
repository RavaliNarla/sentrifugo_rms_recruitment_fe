import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import masterApiService from "../../../services/masterApiService";
import { mapPositionsFromApi } from "../mappers/positionMapper";
import i18n from "i18next";

export const usePositions = () => {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(false);

  const buildDeptMap = (departments = []) => {
    const map = {};
    departments.forEach((d) => {
      map[d.departmentId] = d.departmentName; // ✅ FIXED
    });
    return map;
  };

  const buildJobGradeMap = (jobGrades = []) => {
    const map = {};
    jobGrades.forEach((jg) => {
      map[jg.jobGradeId] = jg.jobGradeCode; //  what you want to display
    });
    return map;
  };

  const fetchPositions = async () => {
    setLoading(true);
    try {
      //  Fetch positions
      const posRes = await masterApiService.getAllPositions();
      const positionApiData = posRes?.data || [];
      const mappedPositions = mapPositionsFromApi(positionApiData);

      const jobGradeRes = await masterApiService.getAllJobGrades();
      const jobGradeApiData = Array.isArray(jobGradeRes.data)
        ? jobGradeRes.data
        : jobGradeRes.data?.data || [];

      const jobGradeMap = buildJobGradeMap(jobGradeApiData);

      const deptRes = await masterApiService.getAllDepartments();
      const deptApiData = Array.isArray(deptRes.data)
        ? deptRes.data
        : deptRes.data?.data || [];

      const deptMap = buildDeptMap(deptApiData);

      //  Enrich positions
      const enrichedPositions = mappedPositions.map((p) => ({
        ...p,
        department: deptMap[p.departmentId] || "—",
        jobGrade: jobGradeMap[p.jobGradeId] || "—",
      }));

      setPositions(enrichedPositions);
    } catch (err) {
      console.error("Fetch positions failed", err);
      setPositions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPositions();
  }, []);

  const addPosition = async (payload) => {
    await masterApiService.addPosition(payload);
    await fetchPositions();
    toast.success(i18n.t("position:add_success"));
  };

  const updatePosition = async (id, payload) => {
    await masterApiService.updatePosition(id, payload);
    await fetchPositions();
    toast.success(i18n.t("position:update_success"));
  };

  const deletePosition = async (id) => {
    await masterApiService.deletePosition(id);
    await fetchPositions();
    toast.success(i18n.t("position:delete_success"));
  };

  // Download positions template (xlsx)
  const downloadPositionTemplate = async () => {
    try {
      const res = await masterApiService.downloadPositionTemplate();
      const blob = res.data;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "MasterPositionsDTO_template.xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
      toast.error(
        i18n.t("position:download_error", "Failed to download template")
      );
    }
  };

  const bulkAddPositions = async (file) => {
    setLoading(true);

    try {
      const res = await masterApiService.bulkAddPositions(file);

      //  business failure
      if (res.success === false) {
        toast.error(res.message);

        return {
          success: false,
          message: res.message, //   summary
          data: res.data, //  row-wise errors
        };
      }

      await fetchPositions();
      //  success
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
    positions,
    loading,
    fetchPositions,
    addPosition,
    updatePosition,
    deletePosition,
    downloadPositionTemplate,
    bulkAddPositions,
  };
};

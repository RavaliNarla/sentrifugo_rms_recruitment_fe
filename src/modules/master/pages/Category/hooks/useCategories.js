import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

import masterApiService from "../../../services/masterApiService";
import {
  mapCategoriesFromApi,
  mapCategoryFromApi,
  mapCategoryToApi,
} from "../mappers/categoryMapper";

export const useCategories = () => {
  const { t } = useTranslation(["category"]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(false);
  const fetchCategories = async () => {
    try {
      const res = await masterApiService.getAllCategories();

      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];

      const mapped = mapCategoriesFromApi(list);

      //  FORCE newest first ALWAYS (by ID)
      const sorted = [...mapped].sort((a, b) => Number(b.id) - Number(a.id));

      setCategories(sorted);
    } catch (error) {
      toast.error(t("category:fetch_error"));
      setCategories([]);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  /* ================= ADD ================= */
  const addCategory = async (payload) => {
    try {
      const res = await masterApiService.addCategory(mapCategoryToApi(payload));

      toast.success(t("category:add_success"));
      const newItem = mapCategoryFromApi(res.data);
      //  add on top instantly
      setCategories((prev) => [newItem, ...prev]);
    } catch (error) {
      toast.error(error?.response?.data?.message || t("category:add_error"));
    }
  };

  /* ================= UPDATE ================= */
  const updateCategory = async (id, payload) => {
    try {
      const res = await masterApiService.updateCategory(
        id,
        mapCategoryToApi(payload, { id })
      );
      const updatedItem = mapCategoryFromApi(res.data);

      toast.success(t("category:update_success"));

      //  update in same position
      setCategories((prev) =>
        prev.map((c) =>
          String(c.id) === String(id) ? { ...c, ...updatedItem } : c
        )
      );
    } catch (error) {
      toast.error(error?.response?.data?.message || t("category:update_error"));
    }
  };

  /* ================= DELETE ================= */
  const deleteCategory = async (id) => {
    try {
      await masterApiService.deleteCategory(id);

      toast.success(t("category:delete_success"));

      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (error) {
      toast.error(error?.response?.data?.message || t("category:delete_error"));
    }
  };

  /* ================= DOWNLOAD TEMPLATE ================= */
  const downloadCategoryTemplate = async () => {
    try {
      const res = await masterApiService.downloadCategoryTemplate();

      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Category_Template.xlsx";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(t("category:download_error", "Download failed"));
    }
  };

  /* ================= BULK IMPORT ================= */
  const bulkAddCategories = async (file) => {
    setLoading(true);
    try {
      const res = await masterApiService.bulkAddCategories(file);

      //  business failure
      if (res.success === false) {
        return {
          success: false,
          error: res.message,
          details: res.data || [],
        };
      }
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

  return {
    categories,
    loading,
    addCategory,
    updateCategory,
    deleteCategory,
    bulkAddCategories,
    downloadCategoryTemplate,
    importCategories: () => {},
    fetchCategories,
  };
};

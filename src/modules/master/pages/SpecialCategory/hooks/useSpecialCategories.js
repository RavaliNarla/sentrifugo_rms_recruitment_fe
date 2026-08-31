import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import masterApiService from "../../../services/masterApiService";
import {
  mapSpecialCategoriesFromApi,
  mapSpecialCategoryFromApi,
} from "../mappers/specialCategoryMapper";
import { useTranslation } from "react-i18next";

export const useSpecialCategories = () => {
  const { t } = useTranslation(["specialCategory", "validation"]);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ========================= FETCH (ALWAYS SORT NEWEST FIRST)  ========================= */
  const fetchCategories = async () => {
    try {
      setLoading(true);

      const res = await masterApiService.getAllSpecialCategories();

      const apiList = Array.isArray(res.data) ? res.data : res.data?.data || [];

      const mapped = mapSpecialCategoriesFromApi(apiList);

      //  THIS LINE FIXES REFRESH ORDER
      setCategories(
        mapped.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate))
      );
    } catch (err) {
      console.error("SpecialCategory fetch failed", err);
      setCategories([]);
      toast.error(
        t("specialCategory:fetch_error") || "Failed to fetch special categories"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  /* ========================= ADD → SHOW ON TOP INSTANTLY ========================= */
  const addCategory = async (payload) => {
    const res = await masterApiService.addSpecialCategory(payload);

    const newItem = mapSpecialCategoryFromApi(res?.data?.data ?? res?.data);

    //  ADD TO TOP (NO WAIT)
    setCategories((prev) => [newItem, ...prev]);

    toast.success(
      t("specialCategory:add_success") || "Special category added successfully"
    );
  };

  /* ========================= UPDATE ========================= */
  const updateCategory = async (id, payload) => {
    await masterApiService.updateSpecialCategory(id, payload);
    await fetchCategories();
    toast.success(
      t("specialCategory:update_success") ||
        "Special category updated successfully"
    );
  };

  /* ========================= DELETE ========================= */
  const deleteCategory = async (id) => {
    await masterApiService.deleteSpecialCategory(id);

    // instant UI update
    setCategories((prev) => prev.filter((c) => c.id !== id));

    toast.success(
      t("specialCategory:delete_success") ||
        "Special category deleted successfully"
    );
  };

  /* ========================= DOWNLOAD TEMPLATE ========================= */
  const downloadSpecialCategoryTemplate = async () => {
    try {
      const res = await masterApiService.downloadSpecialCategoryTemplate();

      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "SpecialCategory_Template.xlsx";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error(t("specialCategory:download_error") || "Download failed");
    }
  };

  /* ========================= BULK IMPORT ========================= */
  const bulkAddSpecialCategories = async (file) => {
    setLoading(true);
    try {
      const res = await masterApiService.bulkAddSpecialCategories(file);
      if (res.success === false) {
        return {
          success: false,
          error: res.message,
          details: res.data || [],
        };
      }
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
    categories,
    loading,
    fetchCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    bulkAddSpecialCategories,
    downloadSpecialCategoryTemplate,
  };
};

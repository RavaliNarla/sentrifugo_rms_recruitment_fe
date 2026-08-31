import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

import masterApiService from "../../../services/masterApiService";
import {
  mapDocumentsFromApi,
  mapDocumentFromApi,
} from "../mappers/documentMapper";

export const useDocuments = () => {
  const { t } = useTranslation(["documents", "validation"]);

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ================= FETCH ================= */
  const fetchDocuments = async () => {
    try {
      const res = await masterApiService.getAllDocumentTypes();
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];

      const mapped = mapDocumentsFromApi(list);

      //  newest first
      const sorted = [...mapped].sort((a, b) => Number(b.id) - Number(a.id));

      setDocuments(sorted);
    } catch (error) {
      toast.error(t("documents:fetch_error"));
      setDocuments([]);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  /* ================= ADD ================= */
  const addDocument = async (payload) => {
    try {
      const res = await masterApiService.addDocumentType(payload);

      const newItem = mapDocumentFromApi(res.data);

      //  add on top instantly (NO refetch)
      setDocuments((prev) => [newItem, ...prev]);

      toast.success(t("documents:document_added_successfully"));
    } catch (error) {
      toast.error(error?.response?.data?.message || t("documents:add_error"));
    }
  };

  /* ================= UPDATE ================= */
  const updateDocument = async (id, payload) => {
    try {
      const res = await masterApiService.updateDocumentType(id, payload);
      const updatedItem = mapDocumentFromApi(res.data);

      toast.success(t("documents:document_updated_successfully"));

      //  update in same position
      setDocuments((prev) =>
        prev.map((d) =>
          String(d.id) === String(id) ? { ...d, ...updatedItem } : d
        )
      );
    } catch (error) {
      toast.error(
        error?.response?.data?.message || t("documents:update_error")
      );
    }
  };

  /* ================= DELETE ================= */
  const deleteDocument = async (id) => {
    try {
      await masterApiService.deleteDocumentType(id);

      toast.success(t("documents:document_deleted_successfully"));

      //  remove instantly
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch (error) {
      toast.error(
        error?.response?.data?.message || t("documents:delete_error")
      );
    }
  };

  /* ================= BULK IMPORT ================= */
  const bulkAddDocuments = async (file) => {
    setLoading(true);
    try {
      const res = await masterApiService.bulkAddDocuments(file);

      if (res.success === false) {
        toast.error(res.message);
        return { success: false };
      }

      toast.success(res.message || "File uploaded successfully");

      //  refresh after bulk import ONLY
      await fetchDocuments();

      return { success: true };
    } catch (err) {
      toast.error("Something went wrong");
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  /* ================= DOWNLOAD TEMPLATE ================= */
  const downloadDocumentTemplate = async () => {
    try {
      const res = await masterApiService.downloadDocumentTemplate();

      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Document_Template.xlsx";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(t("document:download_error"));
    }
  };

  return {
    documents,
    fetchDocuments,
    addDocument,
    updateDocument,
    deleteDocument,
    bulkAddDocuments,
    downloadDocumentTemplate,
    loading,
  };
};

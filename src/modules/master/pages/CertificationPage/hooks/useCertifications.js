// src/modules/master/pages/Certification/hooks/useCertifications.js

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import masterApiService from "../../../services/masterApiService";
import {
  mapCertificationsFromApi,
  mapCertificationFromApi,
  mapCertificationToApi,
} from "../mappers/certificationMapper";

export const useCertifications = () => {
  const { t } = useTranslation(["certification"]);
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ================= FETCH ================= */
  const fetchCertifications = async () => {
    try {
      const res = await masterApiService.getAllCertificates();
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];

      const mapped = mapCertificationsFromApi(list);
      setCertifications(mapped);
    } catch (error) {
      toast.error(t("fetch_error"));
      setCertifications([]);
    }
  };
  useEffect(() => {
    fetchCertifications();
  }, []);

  /* ================= ADD ================= */
  const addCertification = async (payload) => {
    try {
      const res = await masterApiService.addCertificates(
        mapCertificationToApi(payload)
      );

      const newItem = mapCertificationFromApi(res.data);

      toast.success(t("add_success"));

      //  add instantly on top
      setCertifications((prev) => [newItem, ...prev]);
    } catch (error) {
      toast.error(error?.response?.data?.message || t("add_error"));
    }
  };

  /* ================= UPDATE ================= */
  const updateCertification = async (id, payload) => {
    try {
      const res = await masterApiService.updateCertificates(
        id,
        mapCertificationToApi(payload, { id })
      );

      const updatedItem = mapCertificationFromApi(res.data);

      toast.success(t("update_success"));

      //  update in place
      setCertifications((prev) =>
        prev.map((c) =>
          String(c.id) === String(id) ? { ...c, ...updatedItem } : c
        )
      );
    } catch (error) {
      toast.error(error?.response?.data?.message || t("update_error"));
    }
  };

  /* ================= DELETE ================= */
  const deleteCertification = async (id) => {
    try {
      await masterApiService.deleteCertificates(id);

      toast.success(t("delete_success"));

      //  remove instantly
      setCertifications((prev) =>
        prev.filter((c) => String(c.id) !== String(id))
      );
    } catch (error) {
      toast.error(error?.response?.data?.message || t("delete_error"));
    }
  };

  /* ================= DOWNLOAD TEMPLATE ================= */
  const downloadCertificationTemplate = async () => {
    try {
      const res = await masterApiService.downloadCertificatesTemplate();

      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Certification_Template.xlsx";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(t("download_error") || "Download failed");
    }
  };

  /* ================= BULK IMPORT ================= */
  const bulkAddCertifications = async (file) => {
    setLoading(true);
    try {
      const res = await masterApiService.bulkAddCertificates(file);

      // business failure
      if (res.success === false) {
        // toast.error(res.message);
        return {
          success: false,
          error: res.message,
          details: res.data || [],
        };
      }

      toast.success(res.message || t("bulk_success"));
      await fetchCertifications();

      return { success: true };
    } catch (err) {
      const message = t("bulk_error") || "Something went wrong";
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
    certifications,
    loading,
    fetchCertifications,
    addCertification,
    updateCertification,
    deleteCertification,
    bulkAddCertifications,
    downloadCertificationTemplate,
  };
};

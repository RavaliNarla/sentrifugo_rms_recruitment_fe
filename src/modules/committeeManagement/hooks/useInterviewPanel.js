import { useState, useCallback, useEffect } from "react";
import { toast } from "react-toastify";
import masterApiService from "../../master/services/masterApiService";
import committeeManagementService from "../services/committeeManagementService";
import { mapInterviewMembersApi } from "../mappers/interviewMembersMapper";
import {
  mapInterviewPanelsApiToUI,
  mapPanelToFormData,
  preparePanelPayload,
} from "../mappers/InterviewPanelMapper";
import { useTranslation } from "react-i18next";

export const useInterviewPanel = () => {
  const { t } = useTranslation(["interviewPanelCommittee", "common"]);
  const [panels, setPanels] = useState([]);
  const [communityOptions, setCommunityOptions] = useState([]);
  const [membersOptions, setMembersOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    community: "",
    members: [],
    // interviewCenterId: ""
  });

  const [errors, setErrors] = useState({});

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [activeTab, setActiveTab] = useState("MANAGE");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [search, setSearch] = useState({
    panelName: "",
    committeeName: "",
    panelMemberName: "",
  });
  const [showFilters, setShowFilters] = useState(true);
  const [savingPanel, setSavingPanel] = useState(false);

  const [showUpdateConfirmModal, setShowUpdateConfirmModal] = useState(false);
  const [pendingPayload, setPendingPayload] = useState(null);
  useEffect(() => {
    const panelNameValue = search.panelName?.trim();
    const committeeNameValue = search.committeeName?.trim();

    // 🔴 If both empty → load all data
    if (!panelNameValue && !committeeNameValue) {
      setPage(0);
      fetchPanels();
      return;
    }

    // 🟡 If panelName has less than 2 chars and no committee selected → do nothing
    if (panelNameValue && panelNameValue.length < 2 && !committeeNameValue)
      return;

    const timer = setTimeout(() => {
      setPage(0);
      fetchPanels();
    }, 400);

    return () => clearTimeout(timer);
  }, [search.panelName, search.committeeName]);

  useEffect(() => {
    setPage(0);
  }, [size]);

  const fetchPanels = useCallback(async () => {
    try {
      setLoading(true);

      // 👉 Pagination only (NO filters)
      const res = await masterApiService.getInterviewPanelsSearch({
        page,
        size,
        panelName: search.panelName,
        committeeName: search.committeeName,
      });

      const data = res?.data;

      setPanels(mapInterviewPanelsApiToUI(data?.content || []));
      setTotalPages(data?.totalPages || 0);
    } catch (err) {
      console.error("Fetch Panels Error:", err);
      toast.error(t("failed_load_panels"));
    } finally {
      setLoading(false);
    }
  }, [page, size, search, t]);

 
  const initData = useCallback(async () => {
    try {
      setLoading(true);

      // Individual API calls for better error handling
      let commRes, memRes, centerRes;

      try {
        commRes = await masterApiService.getMasterDropdownData();
        setCommunityOptions(
          (commRes?.data || []).map((c) => ({
            id: c.interviewCommitteeId,
            name: c.committeeName,
          }))
        );
      } catch (error) {
        console.error("Failed to load community options:", error);
        toast.error(t("failed_load_communities"));
        setCommunityOptions([]);
      }

      try {
        memRes = await committeeManagementService.getPanelMembers();
        setMembersOptions(mapInterviewMembersApi(memRes));
      } catch (error) {
        console.error("Failed to load panel members:", error);
        toast.error(t("failed_load_members"));
        setMembersOptions([]);
      }

      try {
        centerRes = await masterApiService.getAllInterviewCenters();
      } catch (error) {
        console.error("Failed to load interview centers:", error);
        toast.error(t("failed_load_centers"));
      }
    } catch (error) {
      console.error("Init Data Error:", error);
      toast.error(t("failed_load_initial"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  const validatePanelForm = () => {
    const newErrors = {};

    if (!formData.name?.trim()) {
      newErrors.name = "panel_name_required";
    } else if (formData.name.trim().length > 200) {
      newErrors.name = "panel_name_max";
    }

    if (!formData.community) {
      newErrors.community = "panel_type_required";
    }

    if (!formData.members || formData.members.length === 0) {
      newErrors.members = "member_required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearError = (field) => {
    if (errors?.[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };
  const continuePanelUpdate = async () => {
    if (!pendingPayload) return;

    try {
      setSavingPanel(true);

      const res = await masterApiService.updateInterviewPanel(
        formData.id,
        pendingPayload
      );

      if (!res?.success) {
        setErrorMessage(res?.data || "Failed to update the panel");

        setShowErrorModal(true);
        return;
      }

      toast.success(t("panel_updated"));

      fetchPanels();

      setFormData({
        name: "",
        community: "",
        members: [],
      });

      setErrors({});

      setShowUpdateConfirmModal(false);
      setPendingPayload(null);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update panel");
    } finally {
      setSavingPanel(false);
    }
  };

  const handleSave = async () => {
    if (!validatePanelForm()) {
      //toast.error("Please fix the validation errors");
      return;
    }

    const cleanedFormData = {
      ...formData,
      name: formData.name?.trim(),
    };

    const payload = preparePanelPayload(
      cleanedFormData,
      communityOptions,
      membersOptions
    );

    try {
      if (formData.id) {
        const isresScheduled = await masterApiService.checkScheduledInterviews(
          formData.id
        );

        if (isresScheduled?.data) {
          setPendingPayload(payload);
          setShowUpdateConfirmModal(true);
          return;
        }

        // ✅ UPDATE
        try {
          const res = await masterApiService.updateInterviewPanel(
            formData.id,
            payload
          );

          if (!res?.success) {
            setErrorMessage(res?.data || "Failed to update the panel");
            setShowErrorModal(true);
            return; // ⛔ VERY IMPORTANT
          }

          toast.success(t("panel_updated"));
        } catch (error) {
          console.error("Error updating panel:", error);
          toast.error("Failed to update panel");
        } finally {
          setSavingPanel(false);
        }
      } else {
        // ✅ CREATE
        const res = await masterApiService.addInterviewPanel(payload);

        if (!res?.success) {
          setErrorMessage(res?.data || "Failed to save the panel");
          setShowErrorModal(true);
          return; // ⛔ VERY IMPORTANT
        }

        toast.success(t("panel_created"));
      }

      // ✅ Only runs on SUCCESS
      fetchPanels();
      setFormData({
        name: "",
        community: "",
        members: [],
      });
      setErrors({});
    } catch (err) {
      console.error("SAVE ERROR 👉", err);
      toast.error(err?.response?.data?.message || t("failed_save_panel"));
    }
  };
  const handleDelete = useCallback(
    async (id) => {
      try {
        const res = await masterApiService.deleteInterviewPanel(id);
        if (res?.success === false) {
          setErrorMessage(res?.data || t("panel_assigned_cannot_delete"));
          setShowErrorModal(true);
          return;
        }

        toast.success(t("panel_deleted"));
        fetchPanels();
      } catch (err) {
        console.error("DELETE ERROR 👉", err);
        toast.error(err?.response?.message || t("failed_delete_panel"));
      }
    },
    [fetchPanels, t]
  );

  const handleEdit = async (panelId) => {
    try {
      const res = await masterApiService.getInterviewPanelById(panelId);
      const mappedForm = mapPanelToFormData(res?.data);
      setFormData(mappedForm);
    } catch (err) {
      toast.error(t("failed_load_panel_details"));
    }
  };
  useEffect(() => {
    initData();
  }, [initData]);

  useEffect(() => {
    fetchPanels();
  }, [page, size]);

  useEffect(() => {
    if (activeTab === "MANAGE") {
      setFormData({
        name: "",
        community: "",
        members: [],
      });
      setErrors({});

      // 🔹 Reset filters
      setSearch({
        panelName: "",
        committeeName: "",
        panelMemberName: "",
      });

      // 🔹 Reset pagination
      setPage(0);
    }
  }, [activeTab]);
  const bulkAddPanels = async (file) => {
    setLoading(true);

    try {
      const res = (await committeeManagementService.bulkAddPanels(file)) || {};

      if (!res.success) {
        return {
          success: false,
          error: res.message || "Validation failed",
          details: res.data || [],
        };
      }

      toast.success(res.message || "Panels imported successfully");

      return { success: true };
    } catch (err) {
      toast.error("Unexpected server error");

      return {
        success: false,
        error: "Unexpected server error",
      };
    } finally {
      setLoading(false);
    }
  };

  const downloadPanelTemplate = async () => {
    try {
      const res = await committeeManagementService.downloadPanelTemplate();
      const blob = res.data;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "ImportPanels_template.xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
      toast.error(
        t("interviewPanelCommittee:download_error") ||
          "Failed to download template"
      );
    }
  };
  return {
    panels,
    loading,

    communityOptions,
    membersOptions,
    // centerOptions,

    formData,
    setFormData,

    errors,
    setErrors,
    clearError,

    handleSave,
    handleDelete,
    handleEdit,
    initData,
    fetchPanels,

    page,
    setPage,
    totalPages,
    size,
    setSize,

    search,

    setSearch,

    setShowFilters,
    showFilters,

    activeTab,
    setActiveTab,
    showErrorModal,
    setShowErrorModal,
    errorMessage,
    bulkAddPanels,
    downloadPanelTemplate,
    savingPanel,
    showUpdateConfirmModal,
    setShowUpdateConfirmModal,
    continuePanelUpdate,
  };
};

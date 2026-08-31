import { useState, useEffect } from "react";
import "../../../style/css/Committee.css";
import masterApiService from "../../master/services/masterApiService";
import committeeManagementService from "../services/committeeManagementService";
import { mapPanelsApi } from "../mappers/InterviewPanelMapper";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

export const useAssignPositions = (userId) => {
  const { t } = useTranslation(["interviewPanelCommittee"]);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [formData, setFormData] = useState({
    requisitionId: "",
    positionId: "",
    panelType: "",
    members: [],
  });

  const [requisitions, setRequisitions] = useState([]);
  const [positions, setPositions] = useState([]);
  const [isManuallyDirty, setIsManuallyDirty] = useState(false);
  const [selectedRequisition, setSelectedRequisition] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("");
  const [allPanels, setAllPanels] = useState([]);
  const [availablePanels, setAvailablePanels] = useState([]);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errorList, setErrorList] = useState([]);

  const [page, setPage] = useState(0);
  const [size] = useState(1000);

  const [panelErrors, setPanelErrors] = useState({});

  const [originalCommittees, setOriginalCommittees] = useState({
    SCREENING: [],
    INTERVIEW: [],
    COMPENSATION: [],
  });

  const validatePanels = () => {
    const errors = {};
    let isValid = true;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    Object.entries(selectedCommittees).forEach(([type, panels]) => {
      panels.forEach((panel) => {
        const key = `${type}_${panel.id}`;
        errors[key] = {};

        const isNewPanel = !panel.positionPanelId;

        if (!panel.startDate) {
          errors[key].startDate = "start_date_required";
          isValid = false;
        }

        if (!panel.endDate) {
          errors[key].endDate = "end_date_required";
          isValid = false;
        }

        if (
          panel.startDate &&
          panel.endDate &&
          new Date(panel.endDate) < new Date(panel.startDate)
        ) {
          errors[key].endDate = "end_before_start";
          isValid = false;
        }

        if (isNewPanel) {
          if (panel.endDate && new Date(panel.endDate) <= today) {
            errors[key].endDate = "end_future_required";
            isValid = false;
          }
        }

        if (!panel.members || panel.members.length === 0) {
          errors[key].members = "member_required";
          isValid = false;
        }

        if (Object.keys(errors[key]).length === 0) {
          delete errors[key];
        }
      });
    });

    setPanelErrors(errors);

    if (!isValid) {
      toast.error(t("fix_committee_errors"));
    }

    return isValid;
  };

  useEffect(() => {
    fetchRequisitions();
  }, []);

  const fetchRequisitions = async () => {
    try {
      const res = await committeeManagementService.getRequisitions();

      setRequisitions(res?.data || []);
    } catch (err) {
      console.error("Failed to load requisitions", err);
    }
  };

  const handleRequisitionChange = async (e) => {
    const reqId = e.target.value;

    setSelectedRequisition(reqId);
    setSelectedPosition(""); // reset position

    // 🔥 RESET PANEL STATE
    setSelectedCommittees({
      SCREENING: [],
      INTERVIEW: [],
      COMPENSATION: [],
    });

    setAvailablePanels(allPanels); // reset from source of truth
    setPanelErrors({});
    setActiveTab("SCREENING");

    if (!reqId) {
      setPositions([]);
      return;
    }

    try {
      const res =
        await committeeManagementService.getPositionsByRequisition(reqId);
      setPositions(res?.data || []);
    } catch (err) {
      console.error("Failed to load positions", err);
    }
  };
  const loadPositionData = async (positionId) => {
    if (!positionId) {
      setSelectedCommittees({
        SCREENING: [],
        INTERVIEW: [],
        COMPENSATION: [],
      });
      setAvailablePanels([]);
      setAllPanels([]); // ✅ add this
      setPanelErrors({});
      return;
    }

    try {
      setLoading(true);

      // 1️⃣ Load all panels first
      const panelsRes = await masterApiService.getInterviewPanelsSearch({
        page,
        size,
      });

      const apiData = panelsRes?.data?.content || [];
      const mappedPanels = mapPanelsApi(apiData);
      setAllPanels(mappedPanels);

      // 2️⃣ Load assigned panels
      const assignedRes =
        await committeeManagementService.getPanelsByPosition(selectedPosition);

      const responseData = assignedRes?.data ?? {};

      const interviewPanelList = responseData?.interviewPanelList ?? [];
      const screeningPanelList = responseData?.screeningPanelList ?? [];
      const compensationPanelList = responseData?.compensationPanelList ?? [];
      const getStatusBadge = (status = "") => {
        switch (status) {
          case "APPROVED":
            return "success";
          case "REJECTED":
            return "danger";
          case "L1_REJECTED":
          case "L2_REJECTED":
            return "danger";
          case "NEW":
            return "warning";
          case "L1_PENDING":
            return "yellowwarning";
          case "L2_PENDING":
            return "info";
          default:
            return "secondary";
        }
      };

      const mapAssigned = (list) =>
        list.map((p) => {
          const rawStatus = p.positionPanelStatus ?? "";
          const isLocked = p.positionPanelStatus === "L2_PENDING";
          return {
            id: p.interviewPanel.interviewPanelId,
            positionPanelId: p.positionPanelId,
            name: p.interviewPanel.panelName,
            committeeName:
              p.interviewPanel.committee.committeeName.toUpperCase(),
            committeeId: p.interviewPanel.committee.interviewCommitteeId,
            members: p.interviewPanel.panelMembers.map((m) => ({
              ...m.panelMember,
              interviewPanelMemberId: m.interviewPanelMemberId,
            })),
            startDate: p.startDate || "",
            endDate: p.endDate || "",

            canEdit: !isLocked && p.canEdit !== false,

            // ✅ SAME PATTERN AS REQUISITION
            rawStatus,
            statusType: getStatusBadge(rawStatus),

            // display text
            positionPanelStatus: rawStatus
              .toLowerCase()
              .replace("_", " ")
              .replace(/^l1/, "L1"),
          };
        });

      const assigned = {
        SCREENING: mapAssigned(screeningPanelList),
        INTERVIEW: mapAssigned(interviewPanelList),
        COMPENSATION: mapAssigned(compensationPanelList),
      };

      setSelectedCommittees({
        SCREENING: assigned?.SCREENING || [],
        INTERVIEW: assigned?.INTERVIEW || [],
        COMPENSATION: assigned?.COMPENSATION || [],
      });
      setOriginalCommittees(assigned);

      // 3️⃣ Calculate available panels properly
      const assignedIds = Object.values(assigned)
        .flat()
        .map((p) => p.id);

      const available = mappedPanels.filter((p) => !assignedIds.includes(p.id));

      setAvailablePanels(available);
    } catch (err) {
      console.error("Load Position Data Error:", err);
      toast.error(t("failed_load_panels"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPositionData(selectedPosition);
  }, [selectedPosition]);

  const isPanelChanged = (panel, originalPanel) => {
    if (!originalPanel) return true;

    const currentMembers = (panel.members || []).map((m) => m.userId).sort();

    const originalMembers = (originalPanel.members || [])
      .map((m) => m.userId)
      .sort();

    return (
      panel.startDate !== originalPanel.startDate ||
      panel.endDate !== originalPanel.endDate ||
      JSON.stringify(currentMembers) !== JSON.stringify(originalMembers)
    );
  };

  const isDirty = () => {
    return Object.entries(selectedCommittees).some(([type, panels]) => {
      const originalPanels = originalCommittees?.[type] || [];

      // length changed → add/remove happened
      if (panels.length !== originalPanels.length) return true;

      return panels.some((panel) => {
        const originalPanel = originalPanels.find((p) => p.id === panel.id);
        return isPanelChanged(panel, originalPanel);
      });
    });
  };

  const [activeTab, setActiveTab] = useState("SCREENING");
  const [showHistory, setShowHistory] = useState(true);

  const [selectedCommittees, setSelectedCommittees] = useState({
    SCREENING: [],
    INTERVIEW: [],
    COMPENSATION: [],
  });
  const [context, setContext] = useState({
    requisitionId: "1",
    positionId: "1",
  });

  const updateCommitteeDate = (type, id, field, value) => {
    setSelectedCommittees((prev) => ({
      ...prev,
      [type]: prev[type].map((c) =>
        c.id === id
          ? { ...c, [field]: value, isDirty: true } // ✅ KEY
          : c
      ),
    }));

    setIsManuallyDirty(true);

    // 2️⃣ CLEAR validation error for this field
    const errorKey = `${type}_${id}`;

    setPanelErrors((prev) => {
      if (!prev?.[errorKey]?.[field]) return prev;

      return {
        ...prev,
        [errorKey]: {
          ...prev[errorKey],
          [field]: "",
        },
      };
    });
  };
  const showError = (message, errors = []) => {
    setErrorMessage(message);
    setErrorList(Array.isArray(errors) ? errors : []);
    setShowErrorModal(true);
  };

  const handleAssignCommittees = async () => {
    if (loading) return;
    if (!selectedPosition) {
      toast.error(t("select_requisition_position"));
      return;
    }
    const isValid = validatePanels();
    if (!isValid) return; // ❌ stop here

    try {
      setLoading(true);

      const payload = {
        interviewPanelList: [],
        screeningPanelList: [],
        compensationPanelList: [],
      };

      Object.entries(selectedCommittees).forEach(([committeeType, panels]) => {
        panels.forEach((panel, seqIndex) => {
          const originalPanel = originalCommittees?.[committeeType]?.find(
            (p) => p.id === panel.id
          );

          const isChanged =
            !originalPanel ||
            panel.startDate !== originalPanel.startDate ||
            panel.endDate !== originalPanel.endDate ||
            JSON.stringify(panel.members.map((m) => m.userId).sort()) !==
              JSON.stringify(originalPanel.members.map((m) => m.userId).sort());

          let finalPanel = panel;

          if (!finalPanel) return;

          // ✅ detect change properly
          const actionEnum = !panel.positionPanelId
            ? "ADD"
            : isChanged
              ? "MODIFY"
              : null;

          // ✅ reset status if changed
          let positionPanelStatus = panel.rawStatus;

          if (!panel.positionPanelId || isChanged) {
            positionPanelStatus = "L1_PENDING";
          }

          const panelPayload = {
            positionId: null,
            actionEnum, // ✅ ADD THISif (!finalPanel) return;
            positionPanelStatus,
            interviewPanel: {
              panelName: finalPanel.name,
              description: finalPanel.description || "",
              committee: {
                committeeName: finalPanel.committeeName,
                committeeDesc: finalPanel.committeeDesc || "",
                interviewCommitteeId: finalPanel.committeeId,
              },
              panelMembers: finalPanel.members.map((m) => ({
                panelId: finalPanel.id,
                panelMember: {
                  name: m.name,
                  role: m.role,
                  email: m.email,
                  userId: m.userId,
                },
                interviewPanelMemberId: m.interviewPanelMemberId,
              })),
              interviewPanelId: finalPanel.id,
            },
            startDate: finalPanel.startDate,
            endDate: finalPanel.endDate,
            sequenceNo: seqIndex,
            positionPanelId: finalPanel.positionPanelId,
          };
          if (committeeType === "INTERVIEW") {
            payload.interviewPanelList.push(panelPayload);
          } else if (committeeType === "SCREENING") {
            payload.screeningPanelList.push(panelPayload);
          } else if (committeeType === "COMPENSATION") {
            payload.compensationPanelList.push(panelPayload);
          }
        });
      });

      const res = await committeeManagementService.assignPanelToPosition(
        selectedPosition,
        payload
      );
      if (res?.success) {
        toast.success(t("assign_success"));

        // ✅ Reload updated data
        await loadPositionData(selectedPosition);
        setIsManuallyDirty(false);
      } else {
        // toast.error(res?.message || "Failed to assign committees");
        showError(res?.message || t("validation_failed"), res?.data || []);
      }
    } catch (err) {
      setLoading(false);
      console.error("ASSIGN ERROR 👉", err);
      toast.error(err?.response?.data?.message || t("assign_failed"));
    } finally {
      setLoading(false);
    }
  };

  /* ================= BULK IMPORT ================= */

  const bulkImportPositionAssignments = async (file) => {
    setLoading(true);

    try {
      const res =
        await committeeManagementService.bulkImportPositionAssignments(file);

      if (!res.success) {
        return {
          success: false,
          error: res.message || "Validation failed",
          details: res.data || [],
        };
      }

      // Success case - refresh data
      if (selectedPosition) {
        await loadPositionData(selectedPosition);
        setIsManuallyDirty(false);
      }
      toast.success(
        res?.message || "Position assignments imported successfully"
      );
      return { success: true };
    } catch (err) {
      console.error("Bulk Import Error:", err);
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Unexpected server error";
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const downloadPositionAssignmentTemplate = async () => {
    try {
      const res =
        await committeeManagementService.downloadPositionAssignmentTemplate();
      const blob = res.data;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "PositionAssignments_template.xlsx";
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
    history,
    loading,
    formData,
    setFormData,
    handleRequisitionChange,
    requisitions,
    positions,
    selectedRequisition,
    selectedPosition,
    setSelectedPosition,
    availablePanels,
    setAvailablePanels,
    updateCommitteeDate,

    activeTab,
    setActiveTab,
    showHistory,
    setShowHistory,
    selectedCommittees,
    setSelectedCommittees,
    context,
    setContext,
    handleAssignCommittees,
    panelErrors,
    setPanelErrors,
    showErrorModal,
    setShowErrorModal,
    errorMessage,
    setErrorMessage,
    errorList,
    setErrorList,
    isDirty,
    setIsManuallyDirty,
    bulkImportPositionAssignments,
    downloadPositionAssignmentTemplate,
    loadPositionData,
  };
};

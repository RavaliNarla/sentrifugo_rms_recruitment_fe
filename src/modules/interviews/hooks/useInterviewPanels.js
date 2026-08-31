import { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import interviewService from "../services/interviewService";

export const useInterviewPanels = (positionId, initialSelectedPanels = []) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editPanel, setEditPanel] = useState(null);
  const [openInfoIndex, setOpenInfoIndex] = useState(null);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const panelBoxRef = useRef(null);
  const [availablePanels, setAvailablePanels] = useState([]); // API
  const [selectedPanels, setSelectedPanels] = useState(initialSelectedPanels); // USER SELECTION

  useEffect(() => {
    // ONLY INITIAL LOAD
    if (initialSelectedPanels?.length && selectedPanels.length === 0) {
      setSelectedPanels(initialSelectedPanels);
    }
  }, []);

  useEffect(() => {
    const handleOutside = (e) => {
      if (!panelBoxRef.current) return;
      if (!panelBoxRef.current.contains(e.target)) {
        setOpenInfoIndex(null);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);
  const savePanel = (data) => {
    try {
      const isDuplicate = selectedPanels.some((p) => p.id === data.panelId);

      // ❌ BLOCK duplicate (only in ADD mode)
      if (!editPanel && isDuplicate) {
        toast.error("Panel already selected");
        return;
      }

      const newPanel = {
        id: data.panelId || Date.now(),
        name: data.panelName,
        slots: data.slots,
      };

      if (editPanel) {
        setSelectedPanels((prev) =>
          prev.map((p, i) => (i === editPanel.index ? newPanel : p))
        );
      } else {
        setSelectedPanels((prev) => [...prev, newPanel]);
      }

      setEditPanel(null);
      setShowAddModal(false);
    } catch {
      toast.error("Failed to save panel");
    }
  };
  const confirmDelete = (index) => {
    setSelectedPanels((prev) => prev.filter((_, i) => i !== index));

    setDeleteIndex(null);

    setOpenInfoIndex(null);
  };

  const openEdit = (panel, index) => {
    const availablePanel = availablePanels.find((p) => p.id === panel.id);

    setEditPanel({
      ...panel,

      ranges: availablePanel?.ranges || [],

      index,
    });
    setShowAddModal(true);
  };
  //new for load the panles which are assigned in committe management
  const loadPanels = async (positionId) => {
    if (!positionId) return;

    try {
      const response = await interviewService.getPanelsByPosition(positionId);

      // ✅ FIXED PATH
      const apiList = response?.data || [];

      const groupedPanels = {};

      apiList.forEach((item) => {
        const panelId = item.interviewPanel?.interviewPanelId;

        // create panel once
        if (!groupedPanels[panelId]) {
          groupedPanels[panelId] = {
            id: panelId,

            name: item.interviewPanel?.panelName,

            members: (item.interviewPanel?.panelMembers || []).map((m) => ({
              name: m.panelMember?.name,
              role: m.panelMember?.role,
              email: m.panelMember?.email,
            })),

            slots: [],

            // ✅ IMPORTANT
            ranges: [],

            status: item.positionPanelStatus,

            canEdit: item.canEdit,
          };
        }

        // ✅ ADD ALL RANGES
        groupedPanels[panelId].ranges.push({
          startDate: item.startDate,

          endDate: item.endDate,

          positionPanelId: item.positionPanelId,
          positionName: item.positionName || "Position",
        });
      });

      const formatted = Object.values(groupedPanels);

      setAvailablePanels(formatted);

      // ❗ OPTIONAL: If you want already assigned panels pre-selected
      // setSelectedPanels(formatted);
    } catch (error) {
      console.error("Error loading panels:", error);
      setAvailablePanels([]); // ✅ fix wrong state
    }
  };
  useEffect(() => {
    loadPanels(positionId);
  }, [positionId]);

  return {
    availablePanels,
    selectedPanels,
    showAddModal,
    editPanel,
    openInfoIndex,
    deleteIndex,
    panelBoxRef,

    setShowAddModal,
    setEditPanel,
    setOpenInfoIndex,
    setDeleteIndex,
    savePanel,
    confirmDelete,
    openEdit,
  };
};

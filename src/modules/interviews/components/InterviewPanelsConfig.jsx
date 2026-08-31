import React from "react";
import "../../../style/css/InterviewPanelsConfig.css";
import AddPanelModal from "../../interviews/components/AddPanelModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import { useInterviewPanels } from "../../interviews/hooks/useInterviewPanels";
import { useTranslation } from "react-i18next";
import ApplySuccessModal from "../../interviews/components/ApplySuccessModal";
import { toast } from "react-toastify";
import Loader from "../../../shared/components/Loader";
import InterviewScheduleSummaryModal from "./InterviewScheduleSummaryModal";
const InterviewPanelsConfig = ({
  positionId,
  //startTime,
  // onStartTimeChange,
  candidates,
  onScheduleReady,
  onApplyAll,
  initialSelectedPanels = [],
}) => {
  const {
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
  } = useInterviewPanels(positionId, initialSelectedPanels);

  const activeCount = selectedPanels.length;
  const { t } = useTranslation(["interviewSchedule", "common"]);
  const [showApplySuccess, setShowApplySuccess] = React.useState(false);
  const [scheduledCount, setScheduledCount] = React.useState(0);
  const [isApplying, setIsApplying] = React.useState(false);
  const [showCapacityModal, setShowCapacityModal] = React.useState(false);

  const [capacityMessage, setCapacityMessage] = React.useState("");

  const [showSummaryModal, setShowSummaryModal] = React.useState(false);

  const handleApplyAll = async () => {
    // ✅ Validate Position
    if (!positionId) {
     toast.error(t("position_missing"));
      return;
    }

    // ✅ Validate Panels
    if (!selectedPanels || selectedPanels.length === 0) {
      toast.error(t("please_add_panel"));
      return;
    }

    // ✅ Calculate total interview capacity
    const totalCapacity = selectedPanels.reduce((sum, panel) => {
      const panelCapacity = (panel.slots || []).reduce((slotSum, slot) => {
        return slotSum + Number(slot.perDay || 0);
      }, 0);

      return sum + panelCapacity;
    }, 0);

    // ✅ Total candidates
    const totalCandidates = candidates?.length || 0;

    const remainingCandidates = totalCandidates - totalCapacity;

    // ✅ Validate capacity
    if (totalCapacity < totalCandidates) {
//       setCapacityMessage(
//         `Unable to schedule all candidates.

// Only ${totalCapacity} interview slots are available. ${remainingCandidates} more candidates still need to be scheduled.

// Please add additional interview slots or create another panel to continue.`
//       );


setCapacityMessage(
  t("capacity_insufficient_message", {
    totalCapacity,
    remainingCandidates,
  })
);

      setShowCapacityModal(true);

      return;
    }

    // ✅ ONLY OPEN CONFIRMATION MODAL
    onApplyAll({
      selectedPanels,
      positionId,
      candidates,
    });
  };
  return (
    <>
      <div className="ipc-card mt-4">
        {isApplying && <Loader />}

        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="ipc-title d-flex align-items-center gap-2">
            <i className="bi bi-calendar-event"></i>
            {t("panel_config_title")}
          </div>

          <div className="d-flex gap-2">
            {/* VIEW SUMMARY BUTTON */}
            <button
              className="ipc-btn-outline"
              onClick={() => {
                // open summary modal
                setShowSummaryModal(true);
              }}
            >
              <i className="bi bi-eye me-2"></i>
            {t("view_summary")}
            </button>

            <button
              className="ipc-btn-blue"
              onClick={() => {
                setOpenInfoIndex(null);
                setEditPanel(null);
                setShowAddModal(true);
              }}
            >
              <i className="bi bi-plus-lg me-2"></i>
              {t("add_panel")}
            </button>
          </div>
        </div>

        <hr />

        {/* LABEL */}
        <div className="d-flex justify-content-between mb-2">
          <label className="ipc-label">
            {t("interview_panels")} <span className="text-danger">*</span>
          </label>

          <span className="ipc-count">
            {t("active_panels", { count: activeCount })}
          </span>
        </div>

        {/* PANEL CHIPS */}
        <div className="ipc-panel-box" ref={panelBoxRef}>
          {selectedPanels.map((p, i) => (
            <div key={i} className="ipc-panel-chip">
              <span className="ipc-panel-name">{p.name}</span>

              <i
                className="bi bi-people ipc-chip-icon"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenInfoIndex((prev) => (prev === i ? null : i));
                }}
              />

              {openInfoIndex === i && (
                <>
                  <i
                    className="bi bi-pencil ipc-chip-edit"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEdit(p, i);
                    }}
                  />

                  <i
                    className="bi bi-x-circle ipc-chip-delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenInfoIndex(null);
                      setDeleteIndex(i);
                    }}
                  />
                </>
              )}

              {openInfoIndex === i && (
                <div className="ipc-chip-popover">
                  <div className="ipc-pop-head">
                    <span>{t("date")}</span>
                    <span>{t("interviews")}</span>
                  </div>

                  {(p.slots || []).map((s, idx) => (
                    <div key={idx} className="ipc-pop-row">
                      <span>{new Date(s.date).toLocaleDateString()}</span>
                      <span>
                        {s.perDay} {t("per_day")}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* START TIME */}
        <div className="row mt-3 align-items-end">
          {/* <div className="col-md-3">
            <Form.Label className="ipc-label">
              {t("start_time")} <span className="text-danger">*</span>
            </Form.Label>

            <Form.Control
              type="time"
              value={startTime}
              onChange={(e) => onStartTimeChange(e.target.value)}
              className="ipc-time-input"
            />
          </div> */}

          <div className="col-md-3 ms-auto text-md-end mt-3 mt-md-0">
            <button className="ipc-apply-btn" onClick={handleApplyAll}>
              <i className="bi bi-check2-circle me-2"></i>
              {t("apply_to_all")}
            </button>
          </div>
        </div>
      </div>

      {/* MODALS */}

      <AddPanelModal
        show={showAddModal}
        mode={editPanel ? "edit" : "add"}
        initialPanel={editPanel?.id}
        initialRows={editPanel?.slots}
        //panels={availablePanels}
        panels={availablePanels.filter((panel) => {
          // show current editing panel
          if (editPanel && panel.id === editPanel.id) {
            return true;
          }

          // hide already selected panels
          return !selectedPanels.some((selected) => selected.id === panel.id);
        })}
        onClose={() => setShowAddModal(false)}
        onSave={savePanel}
        selectedPanels={selectedPanels}
      />

      <DeleteConfirmModal
        show={deleteIndex !== null}
        name={selectedPanels[deleteIndex]?.name}
        onCancel={() => setDeleteIndex(null)}
        onConfirm={() => confirmDelete(deleteIndex)}
      />

      <ApplySuccessModal
        show={showApplySuccess}
        count={scheduledCount}
        onOk={() => setShowApplySuccess(false)}
      />

      <InterviewScheduleSummaryModal
        show={showSummaryModal}
        onClose={() => setShowSummaryModal(false)}
        candidates={candidates}
        selectedPanels={selectedPanels}
        availablePanels={availablePanels}
      />
      {showCapacityModal && (
        <div className="ipc-alert-overlay">
          <div className="ipc-alert-modal">
            <div className="ipc-alert-icon">
              <i className="bi bi-exclamation-triangle-fill"></i>
            </div>

            <h4 className="ipc-alert-title">  {t("capacity_insufficient_title")}</h4>

            <p className="ipc-alert-message">{capacityMessage}</p>

            <div className="text-end mt-4">
              <button
                className="ipc-alert-btn"
                onClick={() => setShowCapacityModal(false)}
              >
                {t("ok")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InterviewPanelsConfig;

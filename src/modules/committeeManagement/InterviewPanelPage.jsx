import { useState, useEffect } from "react";
import InterviewPanelFormModal from "./components/InterviewPanelFormModal";
import InterviewPanelTable from "./components/InterviewPanelTable";
import AssignPositionsPage from "./AssignPositionsPage";
import "../../style/css/InterviewPanelPage.css";
import { useInterviewPanel } from "./hooks/useInterviewPanel";
import { FiUsers, FiFileText, FiUpload } from "react-icons/fi";
import { Modal, Button } from "react-bootstrap";
import DeleteConfirmationModal from "./components/DeleteConfirmationModal";
import ErrorModal from "./components/ErrorModal";
import PanelImportModal from "./components/PanelImportModal";
import { useTranslation } from "react-i18next";
import Loader from "../../shared/components/Loader";
const InterviewPanelPage = () => {
  const {
    panels,
    loading,
    communityOptions,
    membersOptions,
    formData,
    setFormData,
    errors,
    setErrors,

    initData,
    fetchPanels,
    handleSave,
    handleDelete,
    handleEdit,
    clearError,

    page,
    setPage,
    totalPages,
    search,
    setSearch,
    showFilters,
    setShowFilters,
    size,
    setSize,
    activeTab,
    setActiveTab,
    showErrorModal,
    setShowErrorModal,
    errorMessage,
    savingPanel,
    showUpdateConfirmModal,
    setShowUpdateConfirmModal,
    continuePanelUpdate,
  } = useInterviewPanel();

  useEffect(() => {
    initData();
  }, []);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deletePanelName, setDeletePanelName] = useState("");
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);

  const { t } = useTranslation(["interviewPanelCommittee", "common"]);
  return (
    <div className="interview-panel-container">
      <div className="panel-card">
        <div className="panel-header">
          <div>
            <h2>{t("interviewPanelCommittee:committee_management")}</h2>
            <span className="page-subtitle">
              {" "}
              {t("interviewPanelCommittee:committee_subtitle")}
            </span>
          </div>
          <div className="tabs-container">
            <div className="tabs">
              <button
                className={`tab ${activeTab === "MANAGE" ? "active" : ""}`}
                onClick={() => setActiveTab("MANAGE")}
              >
                <FiUsers className="tab-icon" />
                <span>{t("interviewPanelCommittee:manage_panels")}</span>
              </button>
              <button
                className={`tab ${activeTab === "ASSIGN" ? "active" : ""}`}
                onClick={() => setActiveTab("ASSIGN")}
              >
                <FiFileText className="tab-icon" />
                <span>{t("interviewPanelCommittee:assign_to_positions")}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="panel-content">
          {activeTab === "MANAGE" && (
            <div className="panel-layout">
              <div className="panel-form-section">
                <div className="panel-form-card">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="card-title">
                      {formData.id
                        ? t("interviewPanelCommittee:update_panel_title")
                        : t("interviewPanelCommittee:create_panel_title")}
                      <p className="card-subtitle">
                        {t("interviewPanelCommittee:subtitle")}
                      </p>
                    </span>
                    {!formData.id && (
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => setShowBulkImportModal(true)}
                        className="d-flex align-items-center gap-2 bulk-import-btn"
                      >
                        <FiUpload />
                        {t("interviewPanelCommittee:bulk_import")}
                      </Button>
                    )}
                  </div>

                  <InterviewPanelFormModal
                    communityOptions={communityOptions}
                    membersOptions={membersOptions}
                    formData={formData}
                    setFormData={setFormData}
                    onSave={handleSave}
                    errors={errors}
                    setErrors={setErrors}
                    clearError={clearError}
                  />
                </div>
              </div>
              <div className="panel-table-section">
                <div className="panel-table-card">
                  <InterviewPanelTable
                    panels={panels}
                    loading={loading}
                    onEdit={handleEdit}
                    //onDelete={handleDelete}
                    page={page}
                    setPage={setPage}
                    totalPages={totalPages}
                    search={search}
                    setSearch={setSearch}
                    showFilters={showFilters}
                    setShowFilters={setShowFilters}
                    size={size}
                    setSize={setSize}
                    onDelete={(id, panelName) => {
                      setDeleteId(id);
                      setDeletePanelName(panelName);
                      setShowDeleteModal(true);
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "ASSIGN" && (
            <div className="assign-positions-container">
              <AssignPositionsPage refreshPanels={fetchPanels} />
            </div>
          )}
        </div>
        <DeleteConfirmationModal
          show={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setDeleteId(null);
            setDeletePanelName("");
          }}
          onConfirm={() => {
            handleDelete(deleteId);
            setShowDeleteModal(false);
            setDeleteId(null);
            setDeletePanelName("");
          }}
          title={t("interviewPanelCommittee:confirm_delete")}
          message={t("interviewPanelCommittee:delete_panel_message")}
          itemLabel={deletePanelName}
        />
      </div>
      {(loading || savingPanel) && <Loader />}
      <ErrorModal
        show={showErrorModal}
        message={errorMessage}
        errors={[]} // no list needed here
        onClose={() => setShowErrorModal(false)}
      />
      <Modal
        show={showUpdateConfirmModal}
        onHide={() => setShowUpdateConfirmModal(false)}
        centered
        backdrop="static"
      >
        <Modal.Body className="update-confirm-modal-body">
          <div className="update-confirm-icon">
            <i className="bi bi-exclamation-triangle-fill" />
          </div>

          <h5 className="update-confirm-title">Scheduled Interviews Found</h5>

          <p className="update-confirm-text">
            Some interviews are already scheduled for this panel. Continuing the
            update will notify newly added panel members about the scheduled
            interviews.
          </p>

          <div className="update-confirm-actions">
            <button
              className="btn btn-light"
              onClick={() => setShowUpdateConfirmModal(false)}
            >
              Cancel
            </button>

            <button
              className="btn btn-warning text-white"
              onClick={continuePanelUpdate}
            >
              Continue Update
            </button>
          </div>
        </Modal.Body>
      </Modal>
      <Modal
        show={showBulkImportModal}
        onHide={() => setShowBulkImportModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title className="header-title">
            {t("interviewPanelCommittee:bulk_import_panels")}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <PanelImportModal
            t={t}
            onClose={() => setShowBulkImportModal(false)}
            onSuccess={() => {
              fetchPanels();
              setShowBulkImportModal(false);
            }}
          />
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default InterviewPanelPage;

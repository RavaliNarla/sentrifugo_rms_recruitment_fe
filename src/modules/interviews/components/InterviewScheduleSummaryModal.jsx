import React from "react";
import { Modal } from "react-bootstrap";
import "../../../style/css/InterviewPanelsConfig.css";
import { useTranslation } from "react-i18next";

const InterviewScheduleSummaryModal = ({
  show,
  onClose,
  candidates = [],
  selectedPanels = [],
  availablePanels = [],
}) => {
  // ZONE SUMMARY
  
  const { t } = useTranslation("interviewSchedule");

  const zoneMap = {};

  candidates.forEach((candidate) => {
    const zone = candidate.zone || t("na");

    zoneMap[zone] = (zoneMap[zone] || 0) + 1;
  });

  const zoneDetails = Object.entries(zoneMap).map(([zone, count]) => ({
    zone,
    count,
  }));


  return (
    <Modal
      show={show}
      onHide={onClose}
      centered
      size="lg"
      dialogClassName="iss-modal-dialog"
    >
      <Modal.Header closeButton>
        <Modal.Title>{t("view_summary")}</Modal.Title>
      </Modal.Header>

      <Modal.Body className="iss-modal-body">
        {/* TOTAL CANDIDATES */}
        <div className="iss-total-row">
          <span className="iss-total-label"> {t("total_candidates")}  </span>
          <span className="iss-total-value">{candidates.length}</span>
        </div>

        {/* ZONE DETAILS */}
        <div className="iss-section">
          <div className="iss-section-header">  {t("zones")}</div>
          <div className="iss-list">
            {zoneDetails.length > 0 ? (
              zoneDetails.map((item, index) => (
                <div key={index} className="iss-list-item">
                  <span className="iss-item-name">{item.zone}</span>
                  <span className="iss-item-count">{item.count}</span>
                </div>
              ))
            ) : (
              <div className="iss-empty"> {t("no_zone_details")}</div>
            )}
          </div>
        </div>

        {/* PANEL DETAILS */}
        <div className="iss-section">
          <div className="iss-section-header">  {t("panel_details")}</div>
          <div className="iss-list">
            {availablePanels.length > 0 ? (
              availablePanels.map((panel, index) => (
                <div key={index} className="iss-panel-card">
                  <div className="iss-panel-name">{panel.name}</div>
                  <div className="iss-panel-meta">
                    <span>{panel.startDate}</span>
                    <span className="iss-separator">→</span>
                    <span>{panel.endDate}</span>
                  </div>
                  <div className="iss-panel-members">
                    {(panel.members || []).map((m) => m.name).join(", ")}
                  </div>
                </div>
              ))
            ) : (
              <div className="iss-empty"> {t("no_panel_details")}</div>
            )}
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default InterviewScheduleSummaryModal;

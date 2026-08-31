import React from "react";
import { Modal } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import "../../../style/css/InterviewPanelsConfig.css";

const ApplySuccessModal = ({ show, count = 0, onOk }) => {
  const { t } = useTranslation("interviewSchedule");

  return (
    <Modal show={show} onHide={onOk} centered dialogClassName="apply-modal">
      <Modal.Body className="apply-body text-center">
        {/* ICON */}
        <div className="apply-icon">
          <i className="bi bi-check2-circle me-1"></i>
        </div>

        {/* MESSAGE */}
        <div className="apply-text">{t("apply_success_text", { count })}</div>

        {/* BUTTON */}
        <button className="apply-ok-btn" onClick={onOk}>
          {t("ok")}
        </button>
      </Modal.Body>
    </Modal>
  );
};

export default ApplySuccessModal;

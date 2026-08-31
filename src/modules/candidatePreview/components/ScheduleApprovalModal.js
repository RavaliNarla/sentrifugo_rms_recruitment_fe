import React from "react";
import { Modal } from "react-bootstrap";
import { useTranslation } from "react-i18next";

const ScheduleApprovalModal = ({ show, onClose, onApprove, loading }) => {
  const { t } = useTranslation(["interviewSchedule", "common"]);
  return (
    <Modal
      show={show}
      centered
      onHide={onClose}
      className="schedule-approval-modal"
    >
      <Modal.Header closeButton>
       <Modal.Title>{t("submit_for_approval")}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
         {t("review_before_submit")}
      </Modal.Body>

      <Modal.Footer>
        <button className="btn btn-light" onClick={onClose}>
         {t("common:cancel")}
        </button>

        <button
          className="btn btn-primary"
          disabled={loading}
          onClick={onApprove}
        >
          {loading ? t("submitting") : t("submit")}
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default ScheduleApprovalModal;

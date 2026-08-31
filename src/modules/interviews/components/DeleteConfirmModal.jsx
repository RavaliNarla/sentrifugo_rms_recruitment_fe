import React from "react";
import { Modal } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import "../../../style/css/InterviewPanelsConfig.css";

const DeleteConfirmModal = ({
  show,
  title,
  message,
  name,
  onCancel,
  onConfirm,
}) => {
  const { t } = useTranslation(["interviewSchedule", "common"]);

  return (
    <Modal show={show} onHide={onCancel} centered dialogClassName="del-modal">
      <Modal.Body className="del-body">
        {/* HEADER */}
        <div className="del-header">
          <div className="del-title">{title || t("delete_title")}</div>

          <button className="del-close" onClick={onCancel}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        {/* MESSAGE */}
        <div className="del-message">
          {message || t("delete_message", { name })}
        </div>

        {/* FOOTER */}
        <div className="del-footer">
          {/* ✅ from COMMON */}
          <button className="del-cancel" onClick={onCancel}>
            {t("common:cancel")}
          </button>

          {/* ✅ delete from interviewSchedule */}
          <button className="del-delete" onClick={onConfirm}>
            {t("common:delete")}
          </button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default DeleteConfirmModal;

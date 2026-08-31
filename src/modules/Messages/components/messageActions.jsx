import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "react-bootstrap";
const MessageActions = ({ item, onSubmitApproval }) => {
  const { t } = useTranslation(["messages", "common"]);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const status = (item.status || "").toUpperCase().replace(/\s+/g, "_");
  const showAccept = status === "PENDING" || status === "L1_PENDING";
  const showReject = status === "PENDING" || status === "L1_PENDING";
  const disableAccept = status === "L1_PENDING";
  const disableReject = false;
  const hideActions = [
    "REJECTED",
    "L2_PENDING",
    "L1_REJECTED",
    "APPROVED",
    "L2_REJECTED",
  ].includes(status);
  const handleRejectConfirm = async () => {
    await onSubmitApproval(item.id, "REJECTED", comment);
    setShowRejectModal(false);
    setComment("");
    setError("");
  };
  return (
    <>
      {!hideActions && (
        <div className="msg-actions d-flex align-items-start gap-2">
          <div style={{ flex: 1 }}>
            <input
              type="text"
              placeholder={t("messages:send_message")}
              className={`msg-input form-control ${error ? "is-invalid" : ""}`}
              value={comment}
              onChange={(e) => {
                setComment(e.target.value);

                if (e.target.value.trim()) {
                  setError("");
                }
              }}
            />
            {error && (
              <small className="text-danger d-block mt-1">{error}</small>
            )}
          </div>
          {showAccept && (
            <button
              className="btn msg-btn-accept"
              disabled={disableAccept}
              onClick={async () => {
                if (!comment.trim()) {
                  setError(t("messages:this_field_required"));
                  return;
                }
                await onSubmitApproval(item.id, "L1_PENDING", comment);
                setComment("");
                setError("");
              }}
            >
              {t("messages:accept")}
            </button>
          )}
          {showReject && (
            <button
              className="btn btn-danger msg-btn-reject"
              disabled={disableReject}
              onClick={() => {
                if (!comment.trim()) {
                  setError(t("messages:this_field_required"));
                  return;
                }
                setShowRejectModal(true);
              }}
            >
              {t("messages:reject")}
            </button>
          )}
        </div>
      )}
      {!hideActions && (
        <Modal
          show={showRejectModal}
          onHide={() => setShowRejectModal(false)}
          centered
          dialogClassName="del-modal"
        >
          <Modal.Body className="del-body">
            <div className="del-header">
              <div className="del-title">{t("messages:confirm_reject")}</div>
              <button
                className="del-close"
                onClick={() => setShowRejectModal(false)}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="del-message">
              {t("messages:confirm_reject_message")}
              <div className="text-muted small mt-2">
                {t("messages:reason")}: {comment}
              </div>
            </div>
            <div className="del-footer">
              <button
                className="del-cancel"
                onClick={() => setShowRejectModal(false)}
              >
                {t("common:cancel")}
              </button>
              <button className="del-delete" onClick={handleRejectConfirm}>
                {t("messages:reject")}
              </button>
            </div>
          </Modal.Body>
        </Modal>
      )}
    </>
  );
};
export default MessageActions;

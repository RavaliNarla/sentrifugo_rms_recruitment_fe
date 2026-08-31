// src/components/ApprovalCommentModal.jsx
import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import "../../../style/css/ApprovalCommentModal.css";
import { useTranslation } from "react-i18next";
const ApprovalCommentModal = ({ show, actionType, onClose, onConfirm }) => {
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const { t } = useTranslation();

  useEffect(() => {
    if (!show) {
      setComment("");
      setError("");
    }
  }, [show]);
  const handleConfirm = () => {
    const trimmedComment = comment.trim(); // trims BOTH start + end

    if (!trimmedComment) {
      setError(t(`approvalHistory:comment_is_required`));
      return;
    }

    setError("");
    onConfirm(trimmedComment);
  };

  return (
    <Modal
      show={show}
      onHide={onClose}
      centered
      size="lg"
      dialogClassName="approval-modal"
    >
      <Modal.Header closeButton className="modal-header-custom">
        <Modal.Title className="modal-title-custom">
          {actionType === "approve"
            ? t(`approvalHistory:approval_comments`)
            : t(`approvalHistory:rejection_comments`)}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="modal-body-custom">
        <Form.Group>
          <Form.Label className="comment-label">
            {t(`approvalHistory:Comments`)}
            <span className="text-danger">*</span>
          </Form.Label>
          <Form.Control
            as="textarea"
            rows={4}
            placeholder={t(`approvalHistory:enter_comments`)}
            value={comment}
            onChange={(e) => {
              let value = e.target.value;

              // 1. Remove leading spaces
              value = value.replace(/^\s+/, "");

              // 2. Replace multiple spaces inside with single space
              value = value.replace(/\s{2,}/g, " ");

              setComment(value);

              if (value.trim()) setError("");
            }}
            isInvalid={!!error}
            className="comment-textarea"
          />
          <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>
        </Form.Group>
      </Modal.Body>

      <Modal.Footer className="modal-footer-custom">
        <Button variant="" className="btn-cancel" onClick={onClose}>
          {t(`approvalHistory:cancel`)}
        </Button>

        <Button
          variant=""
          className={actionType === "approve" ? "btn-approve" : "btn-reject"}
          onClick={handleConfirm}
        >
          {actionType === "approve"
            ? t(`approvalHistory:approve`)
            : t(`approvalHistory:reject`)}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ApprovalCommentModal;

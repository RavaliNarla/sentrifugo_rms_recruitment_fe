import React from "react";
import { Modal } from "react-bootstrap";
import { useTranslation } from "react-i18next";

export default function ZonalRejectedCommentModal({ show, onHide, comment }) {
  const { t } = useTranslation(["candidateWorkflow", "common"]);
  return (
    <Modal show={show} onHide={onHide} centered backdrop="static">
      <Modal.Header style={{ color: "rgb(22, 43, 117)", fontWeight: 500 }}>
        <Modal.Title style={{ fontSize: "1rem", fontWeight: 500 }}>
          {t("candidateWorkflow:zonal_rejection_comment")}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {comment ? (
          <p className="mb-0 fs-14">{comment}</p>
        ) : (
          <p className="text-muted mb-0 fs-14">No comment available</p>
        )}
      </Modal.Body>

      <Modal.Footer className="border-0">
        <button className="btn btn-outline-secondary" onClick={onHide}>
          {t("common:close")}
        </button>
      </Modal.Footer>
    </Modal>
  );
}

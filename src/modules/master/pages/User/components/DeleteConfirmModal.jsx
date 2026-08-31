// src/modules/master/pages/JobGrade/components/DeleteConfirmModal.jsx

import React from "react";
import { Modal, Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";

const DeleteConfirmModal = ({ show, onHide, onConfirm, target }) => {
  const { t } = useTranslation(["user"]);

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      dialogClassName="delete-confirm-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>{t("confirm_delete")}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p>{t("delete_msg")}</p>

        {target && (
          <div className="delete-confirm-user">
            <strong>{target.name || target.email}</strong>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onHide}>
          {t("cancel")}
        </Button>

        <Button variant="danger" onClick={onConfirm}>
          {t("delete")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteConfirmModal;

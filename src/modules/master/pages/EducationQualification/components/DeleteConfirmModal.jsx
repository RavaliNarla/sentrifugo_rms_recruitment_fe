import React from "react";
import { Modal, Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";

const DeleteConfirmModal = ({ show, onHide, onConfirm, target }) => {
  const { t } = useTranslation(["education", "common"]);

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      backdrop="static"
      keyboard={false}
      dialogClassName="delete-confirm-modal"
    >
      {/* HEADER */}
      <Modal.Header closeButton>
        <Modal.Title>{t("education:delete_title")}</Modal.Title>
      </Modal.Header>

      {/* BODY */}
      <Modal.Body>
        <p>
          {target
            ? t("education:delete_message_with_name", {
                name: target?.educationLevel,
              })
            : t("education:delete_message")}
        </p>

        {target && (
          <div className="delete-confirm-user mt-2">
            <strong>
              {target?.educationLevel} - {target?.course}
            </strong>
          </div>
        )}
      </Modal.Body>

      {/* FOOTER */}
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onHide}>
          {t("common:cancel")}
        </Button>

        <Button variant="danger" onClick={onConfirm}>
          {t("common:delete")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteConfirmModal;

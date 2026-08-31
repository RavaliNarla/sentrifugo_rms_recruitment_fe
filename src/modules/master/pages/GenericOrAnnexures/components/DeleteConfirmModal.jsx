import { Modal, Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";

const DeleteConfirmModal = ({ show, onHide, onConfirm, target }) => {
  const { t } = useTranslation(["genericOrAnnexures"]);

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      dialogClassName="delete-confirm-modal"
    >
      {/* ===== HEADER ===== */}
      <Modal.Header closeButton>
        <Modal.Title>{t("confirm_delete", "Confirm Delete")}</Modal.Title>
      </Modal.Header>

      {/* ===== BODY ===== */}
      <Modal.Body>
        <p>
          {t("delete_message", "Are you sure you want to delete this file?")}
        </p>

        {/*  FILE NAME SHOWN */}
        {target?.name && (
          <div className="delete-confirm-user">
            <strong>{target.name}</strong>
          </div>
        )}
      </Modal.Body>

      {/* ===== FOOTER ===== */}
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onHide}>
          {t("cancel", "Cancel")}
        </Button>

        <Button variant="danger" onClick={onConfirm}>
          {t("delete", "Delete")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteConfirmModal;

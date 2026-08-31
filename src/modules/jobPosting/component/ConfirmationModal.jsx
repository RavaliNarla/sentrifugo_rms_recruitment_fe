import React from "react";
import { Modal, Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";

const ConfirmationModal = ({
  show,
  onClose,
  onConfirm,
  title,
  message,
  itemLabel,
  icon,
  confirmText = "Confirm",
  confirmVariant = "primary",
  loading = false,
  showWarning = false,
}) => {
  const { t } = useTranslation(["importModal", "common"]);
  return (
    <Modal
      show={show}
      onHide={onClose}
      centered
      backdrop="static"
      className="modalimport"
    >
      <Modal.Header closeButton>
        <Modal.Title className="f16 bluecol">
          {title || t("importModal:confirm_default_title")}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="text-center">
        {icon && (
          <img src={icon} alt="icon" className="mb-3" style={{ width: 40 }} />
        )}

        <p className="mb-1 f14">
          {message || t("importModal:confirm_default_message")}
        </p>

        {itemLabel && <strong className="d-block">{itemLabel}</strong>}

        {showWarning && (
          <p className="text-muted mt-2">{t("importModal:cannot_undo")}</p>
        )}
      </Modal.Body>

      <Modal.Footer className="mt-3">
        <Button
          variant="outline-secondary"
          onClick={onClose}
          disabled={loading}
          className="f14"
        >
          {t("common:cancel")}
        </Button>

        <Button
          variant={confirmVariant}
          onClick={onConfirm}
          disabled={loading}
          className="f14"
        >
          {loading
            ? t("importModal:processing")
            : confirmText || t("importModal:confirm_button")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmationModal;

import React from "react";
import { Modal, Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";

const ErrorModal = ({ show, message, errors = [], onClose }) => {
  const { t } = useTranslation("common");
  const hasErrors = Array.isArray(errors) && errors.length > 0;

  return (
    <Modal size="lg" show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title className="text-danger">
          {hasErrors ? message || t("validation_failed") : t("alert")}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* If error list exists */}
        {hasErrors ? (
          <ul className="mb-0 ps-3">
            {errors.map((err, index) => (
              <li key={index} className="mb-2 error-display">
                {err}
              </li>
            ))}
          </ul>
        ) : (
          // Fallback single message display
          <p className="mb-0">{message || t("something_went_wrong")}</p>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="primary" onClick={onClose}>
          {t("close")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ErrorModal;

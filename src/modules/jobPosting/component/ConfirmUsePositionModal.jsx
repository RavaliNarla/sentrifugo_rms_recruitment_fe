// src/modules/jobPosting/component/ConfirmUsePositionModal.js
import React from "react";
import { Modal, Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";

const ConfirmUsePositionModal = ({ show, fields = [], onYes, onNo }) => {
  const { t } = useTranslation(["importModal"]);
  return (
    <Modal show={show} backdrop="static" keyboard={false} centered>
      <Modal.Body className=" p-4 text-center">
        <p className="mb-4 fw-semibold">
          {" "}
          {t("importModal:confirm_position_found")}{" "}
        </p>
        <p className="text-center"> {t("importModal:confirm_use_position")}</p>

        <div className="d-flex justify-content-center gap-3">
          <Button variant="primary" onClick={onYes}>
            {t("importModal:yes")}
          </Button>
          <Button variant="outline-secondary" onClick={onNo}>
            {t("importModal:no")}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ConfirmUsePositionModal;

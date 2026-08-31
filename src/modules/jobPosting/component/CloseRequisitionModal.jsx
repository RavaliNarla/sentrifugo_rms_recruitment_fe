import React from "react";
import { Modal, Button } from "react-bootstrap";
import { ExclamationCircleFill } from "react-bootstrap-icons";
import "../../../style/css/ApprovedInfoModal.css";

const RequisitionCloseConfirmModal = ({
    show,
    onHide,
    onConfirm,
    requisitionName,
}) => {
    return (
        <Modal
            show={show}
            onHide={onHide}
            centered
            className="close-req-modal"
        >
            <Modal.Body className="close-req-body">
                <div className="close-req-badge">
                    Close Requisition
                </div>

                <h4 className="close-req-title">
                    Confirm Closure
                </h4>

                <p className="close-req-text">
                    You are about to close this requisition.
                    Once closed, candidates will no longer be able
                    to apply for this position.
                </p>

                <div className="close-req-card">
                    <span className="close-req-label">
                        Requisition ID
                    </span>

                    <span className="close-req-value">
                        {requisitionName}
                    </span>
                </div>

                <div className="req-close-footer-actions">
                    <Button
                        variant="outline-secondary"
                        onClick={onHide}
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="primary"
                        onClick={onConfirm}
                    >
                        Confirm Closure
                    </Button>
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default RequisitionCloseConfirmModal;
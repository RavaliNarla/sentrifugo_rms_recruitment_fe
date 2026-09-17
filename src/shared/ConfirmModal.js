import React from "react";

/**
 * Generic yes/no confirmation dialog, styled like the app's other modals.
 * `show` defaults to true for callers that conditionally render this element
 * (e.g. `{open && <ConfirmModal ... />}`); pass `show` explicitly for callers
 * that keep the element always mounted and toggle visibility via state.
 */
const ConfirmModal = ({ show = true, title = "Please Confirm", message, confirmLabel = "Yes", cancelLabel = "No", onConfirm, onCancel }) => {
  if (!show) return null;
  return (
    <div className="modal show d-block" style={{ background: "rgba(15,60,30,0.45)" }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button className="btn-close" onClick={onCancel} />
          </div>
          <div className="modal-body">
            <p className="mb-0">{message}</p>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onCancel}>{cancelLabel}</button>
            <button className="btn btn-primary" onClick={onConfirm}>{confirmLabel}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;

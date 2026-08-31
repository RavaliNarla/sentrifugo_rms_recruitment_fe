import React from "react";

const ScheduleErrorModal = ({
  show,
  onClose,
  errorMessage,
  errorCandidates = [],
}) => {
  if (!show) return null;

  return (
    <div className="ipc-alert-overlay">
      <div
        className="ipc-alert-modal"
        style={{
          width: "95%",
          maxWidth: "700px",
        }}
      >
        <h4 className="mb-4">Scheduling Failed</h4>

        <div
          style={{
            maxHeight: "400px",
            overflowY: "auto",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            fontSize: "15px",
            lineHeight: "1.7",
          }}
        >
          {/* MAIN MESSAGE */}
          <div className="mb-3">{errorMessage || "Scheduling failed"}</div>

          {errorCandidates?.length > 0 && (
            <div className="schedule-error-box">
              {errorCandidates.map((item, index) => (
                <div key={index} className="schedule-error-row">
                  <i className="bi bi-exclamation-circle me-2" />

                  <span>
                    {typeof item === "string" ? item : item?.message || "Error"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="text-end mt-4">
          <button className="btn btn-primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleErrorModal;

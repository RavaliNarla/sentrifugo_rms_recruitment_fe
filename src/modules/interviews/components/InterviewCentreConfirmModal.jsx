import React from "react";
import { useTranslation } from "react-i18next";

const InterviewCentreConfirmModal = ({
  show,
  onProceed,
  onReview,
  onClose,
}) => {
   const { t } = useTranslation("interviewSchedule");

  if (!show) return null;
 
  return (
    <div className="ipc-alert-overlay">
      <div className="ipc-alert-modal" style={{ position: "relative" }}>
        <button
          className="btn-close position-absolute top-0 end-0 m-3"
          onClick={onClose}
        ></button>

        <div className="ipc-alert-icon">
          <i className="bi bi-building-check"></i>
        </div>

        <h4 className="ipc-alert-title">
        <h4 className="ipc-alert-title">
  {t("confirm_interview_centre_title")}
</h4>
        </h4>

        <p className="ipc-alert-message">
          {t("confirm_interview_centre_message_1")}
        </p>

        <p className="ipc-alert-message mt-3">
           {t("confirm_interview_centre_message_2")}
        </p>

        <div className="d-flex justify-content-end gap-2 mt-4">
          <button className="btn btn-light" onClick={onReview}>
            {t("review_centres")}
          </button>

          <button className="btn btn-primary" onClick={onProceed}>
            {t("proceed")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InterviewCentreConfirmModal;

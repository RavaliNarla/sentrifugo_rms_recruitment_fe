import React from "react";
import { useTranslation } from "react-i18next";
import "../../../style/css/InterviewPanelsConfig.css";

const ScheduleReadyBar = ({ count = 0, onCancel, onSchedule, isScheduling = false }) => {
  const { t } = useTranslation(["interviewSchedule", "common"]);

  return (
    <div className="schedule-ready-bar d-flex justify-content-between align-items-center">
      {/* LEFT */}
      <div className="d-flex align-items-center gap-2 schedule-ready-text">
        <i className="bi bi-people"></i>

        {t("ready_to_schedule", {
          count: String(count).padStart(2, "0"),
        })}
      </div>

      {/* RIGHT */}
      <div className="d-flex gap-2">
        <button className="sr-btn-cancel" onClick={onCancel}>
          <i className="bi bi-x me-1"></i>
          {t("common:cancel")}
        </button>

        <button className="sr-btn-primary" onClick={onSchedule} disabled={isScheduling}>
          <i className="bi bi-check2-circle me-1"></i>
          {t("schedule_interviews")}
        </button>
      </div>
    </div>
  );
};

export default ScheduleReadyBar;

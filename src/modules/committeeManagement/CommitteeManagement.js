import React, { useState } from "react";
import ManagePanelsTab from "./ManagePanelsTab";
import InterviewSchedulesTab from "./InterviewSchedulesTab";
import "./CommitteeManagement.css";

const CommitteeManagement = () => {
  const [activeTab, setActiveTab] = useState("MANAGE_PANELS");

  return (
    <div className="committee-page">
      <div className="committee-tabs">
        <button
          className={`committee-tab ${activeTab === "MANAGE_PANELS" ? "active" : ""}`}
          onClick={() => setActiveTab("MANAGE_PANELS")}
        >
          <i className="bi bi-people" /> Manage Panels
        </button>
        <button
          className={`committee-tab ${activeTab === "SCHEDULES" ? "active" : ""}`}
          onClick={() => setActiveTab("SCHEDULES")}
        >
          <i className="bi bi-calendar3" /> Interview Schedules
        </button>
      </div>

      <div className="mt-4">
        {activeTab === "MANAGE_PANELS" ? <ManagePanelsTab /> : <InterviewSchedulesTab />}
      </div>
    </div>
  );
};

export default CommitteeManagement;

import React, { useState } from "react";
import ManagePanelsTab from "./ManagePanelsTab";
import AssignToPositionsTab from "./AssignToPositionsTab";
import "./CommitteeManagement.css";

const CommitteeManagement = () => {
  const [activeTab, setActiveTab] = useState("MANAGE_PANELS");

  return (
    <div className="committee-page">
      <div className="committee-tabs">
        <button className={`committee-tab ${activeTab === "MANAGE_PANELS" ? "active" : ""}`} onClick={() => setActiveTab("MANAGE_PANELS")}>
          <i className="bi bi-people" /> Manage Panels
        </button>
        <button className={`committee-tab ${activeTab === "ASSIGN" ? "active" : ""}`} onClick={() => setActiveTab("ASSIGN")}>
          <i className="bi bi-file-earmark-text" /> Assign to Positions
        </button>
      </div>

      <div className="mt-4">
        {activeTab === "MANAGE_PANELS" ? <ManagePanelsTab /> : <AssignToPositionsTab />}
      </div>
    </div>
  );
};

export default CommitteeManagement;

import React, { useState } from "react";
import ManagePanelsTab from "./ManagePanelsTab";
import AssignToPositionsTab from "./AssignToPositionsTab";

const CommitteeManagement = () => {
  const [activeTab, setActiveTab] = useState("MANAGE_PANELS");

  return (
    <div>
      <h4 className="mb-1">Committee Management</h4>
      <p className="text-muted">Manage interview panels and assign them to positions</p>

      <div className="card">
        <div className="card-header bg-white d-flex gap-2">
          <button className={`btn btn-sm ${activeTab === "MANAGE_PANELS" ? "btn-primary" : "btn-outline-secondary"}`} onClick={() => setActiveTab("MANAGE_PANELS")}>
            Manage Panels
          </button>
          <button className={`btn btn-sm ${activeTab === "ASSIGN" ? "btn-primary" : "btn-outline-secondary"}`} onClick={() => setActiveTab("ASSIGN")}>
            Assign to Positions
          </button>
        </div>
        <div className="card-body">
          {activeTab === "MANAGE_PANELS" ? <ManagePanelsTab /> : <AssignToPositionsTab />}
        </div>
      </div>
    </div>
  );
};

export default CommitteeManagement;

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import recruiterApiService from "../../core/recruiterApiService";
import CandidatePoolTab from "./components/CandidatePoolTab";
import InterviewPoolTab from "./components/InterviewPoolTab";
import CompensationPoolTab from "./components/CompensationPoolTab";
import OfferPoolTab from "./components/OfferPoolTab";

const TAB_ICONS = {
  CANDIDATE_POOL: "bi-people",
  INTERVIEW_POOL: "bi-person-video3",
  COMPENSATION_POOL: "bi-cash-coin",
  OFFER_POOL: "bi-check2-circle",
};

const CandidateWorkflow = () => {
  const privileges = useSelector((state) => state.user.privileges) || {};

  const tabs = [
    { key: "CANDIDATE_POOL", label: "Candidate Pool", privilege: "CandidatePool" },
    { key: "INTERVIEW_POOL", label: "Interview Pool", privilege: "InterviewPool" },
    { key: "COMPENSATION_POOL", label: "Compensation Pool", privilege: "CompensationPool" },
    { key: "OFFER_POOL", label: "Offer Pool", privilege: "OfferPool" },
  ].filter((t) => privileges[t.privilege]);

  const [activeTab, setActiveTab] = useState(tabs[0]?.key);
  const [requisitions, setRequisitions] = useState([]);
  const [positions, setPositions] = useState([]);
  const [requisitionId, setRequisitionId] = useState("");
  const [positionId, setPositionId] = useState("");

  useEffect(() => {
    recruiterApiService.getApprovedRequisitions()
      .then((res) => setRequisitions(res.data.data || []))
      .catch(() => toast.error("Failed to load requisitions"));
  }, []);

  useEffect(() => {
    if (!requisitionId) {
      setPositions([]);
      setPositionId("");
      return;
    }
    recruiterApiService.getActivePositionsByRequisition(requisitionId)
      .then((res) => {
        setPositions(res.data.data || []);
        setPositionId("");
      })
      .catch(() => toast.error("Failed to load positions"));
  }, [requisitionId]);

  return (
    <div>
      <div className="app-card mb-3">
        <div className="row">
          <div className="col-md-6 mb-2">
            <label className="form-label fs-14 text-muted">Requisition</label>
            <select className="form-select" value={requisitionId} onChange={(e) => setRequisitionId(e.target.value)}>
              <option value="">Select Requisition</option>
              {requisitions.map((r) => (
                <option key={r.id} value={r.id}>{r.requisitionCode} - {r.title}</option>
              ))}
            </select>
          </div>
          <div className="col-md-6 mb-2">
            <label className="form-label fs-14 text-muted">Position</label>
            <select className="form-select" value={positionId} onChange={(e) => setPositionId(e.target.value)} disabled={!requisitionId}>
              <option value="">Select Position</option>
              {positions.map((p) => (
                <option key={p.id} value={p.id}>{p.positionTitleName} - {p.locationName}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="app-card">
        <div className="pool-tabs mb-3">
          {tabs.map((t) => (
            <button
              key={t.key}
              className={`pool-tab-btn ${activeTab === t.key ? "active" : ""}`}
              onClick={() => setActiveTab(t.key)}
            >
              <i className={`bi ${TAB_ICONS[t.key]}`} />
              {t.label}
            </button>
          ))}
        </div>

        {!positionId ? (
          <div className="text-center text-muted py-5">Select a requisition and position to continue.</div>
        ) : (
          <>
            {activeTab === "CANDIDATE_POOL" && <CandidatePoolTab requisitionId={requisitionId} positionId={positionId} />}
            {activeTab === "INTERVIEW_POOL" && <InterviewPoolTab positionId={positionId} />}
            {activeTab === "COMPENSATION_POOL" && <CompensationPoolTab positionId={positionId} />}
            {activeTab === "OFFER_POOL" && <OfferPoolTab positionId={positionId} />}
          </>
        )}
      </div>
    </div>
  );
};

export default CandidateWorkflow;

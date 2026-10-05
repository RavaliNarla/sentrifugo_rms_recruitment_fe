import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import recruiterApiService from "../../core/recruiterApiService";
import SearchableSelect from "../../shared/SearchableSelect";
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
    { key: "COMPENSATION_POOL", label: "Compensation Management", privilege: "CompensationPool" },
    { key: "OFFER_POOL", label: "Offer Pool", privilege: "OfferPool" },
  ].filter((t) => privileges[t.privilege]);

  const navigate = useNavigate();
  const location = useLocation();
  // Coming back from the Schedule Interviews page: reselect the same requisition / position / tab.
  const restore = location.state?.restore || {};
  const pendingPositionIdRef = useRef(restore.positionId || "");

  const [activeTab, setActiveTab] = useState(
    tabs.some((t) => t.key === restore.activeTab) ? restore.activeTab : tabs[0]?.key
  );
  const [requisitions, setRequisitions] = useState([]);
  const [positions, setPositions] = useState([]);
  const [requisitionId, setRequisitionId] = useState(restore.requisitionId || "");
  const [positionId, setPositionId] = useState("");
  // Once a tab has been switched to, keep it mounted (just hidden) so revisiting it doesn't
  // unmount/remount/refetch and flash a "Loading..." state again.
  const [visitedTabs, setVisitedTabs] = useState(() => new Set(activeTab ? [activeTab] : []));

  useEffect(() => {
    if (activeTab) setVisitedTabs((prev) => (prev.has(activeTab) ? prev : new Set(prev).add(activeTab)));
  }, [activeTab]);

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
    // Ignore stale responses (requisition changed, or StrictMode's dev double-invoke) so an
    // older response can't consume/clear the position restored from the Schedule page.
    let cancelled = false;
    recruiterApiService.getActivePositionsByRequisition(requisitionId)
      .then((res) => {
        if (cancelled) return;
        const list = res.data.data || [];
        setPositions(list);
        const pending = pendingPositionIdRef.current;
        pendingPositionIdRef.current = "";
        setPositionId(pending && list.some((p) => p.id === pending) ? pending : "");
      })
      .catch(() => { if (!cancelled) toast.error("Failed to load positions"); });
    return () => { cancelled = true; };
  }, [requisitionId]);

  /**
   * candidates: [{ id, name }] - in reschedule mode each also carries its current
   * { panelId, panelName, interviewDate, startTime, endTime, durationMinutes, roundName }.
   */
  const openSchedulePage = (candidates, round = 1, mode = "schedule") => {
    navigate("/candidate-workflow/schedule-interview", {
      state: { candidates, round, mode, returnTo: { requisitionId, positionId, activeTab } },
    });
  };

  return (
    <div>
      <div className="app-card mb-3">
        <div className="row">
          <div className="col-md-6 mb-2">
            <label className="form-label fs-14 text-muted">Requisition</label>
            <SearchableSelect
              value={requisitionId}
              onChange={setRequisitionId}
              placeholder="Select Requisition"
              searchPlaceholder="Search requisitions..."
              ariaLabel="Requisition"
              options={[
                { value: "", label: "Select Requisition" },
                ...requisitions.map((r) => ({ value: r.id, label: `${r.requisitionCode} - ${r.title}` })),
              ]}
            />
          </div>
          <div className="col-md-6 mb-2">
            <label className="form-label fs-14 text-muted">Position</label>
            <SearchableSelect
              value={positionId}
              onChange={setPositionId}
              disabled={!requisitionId}
              placeholder="Select Position"
              searchPlaceholder="Search positions..."
              ariaLabel="Position"
              options={[
                { value: "", label: "Select Position" },
                ...positions.map((p) => ({ value: p.id, label: `${p.positionTitleName} - ${p.locationName}` })),
              ]}
            />
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
            {visitedTabs.has("CANDIDATE_POOL") && (
              <div style={{ display: activeTab === "CANDIDATE_POOL" ? "block" : "none" }}>
                <CandidatePoolTab requisitionId={requisitionId} positionId={positionId} isActive={activeTab === "CANDIDATE_POOL"} onScheduleInterviews={openSchedulePage} />
              </div>
            )}
            {visitedTabs.has("INTERVIEW_POOL") && (
              <div style={{ display: activeTab === "INTERVIEW_POOL" ? "block" : "none" }}>
                <InterviewPoolTab positionId={positionId} isActive={activeTab === "INTERVIEW_POOL"} onScheduleInterviews={openSchedulePage} />
              </div>
            )}
            {visitedTabs.has("COMPENSATION_POOL") && (
              <div style={{ display: activeTab === "COMPENSATION_POOL" ? "block" : "none" }}>
                <CompensationPoolTab positionId={positionId} isActive={activeTab === "COMPENSATION_POOL"} />
              </div>
            )}
            {visitedTabs.has("OFFER_POOL") && (
              <div style={{ display: activeTab === "OFFER_POOL" ? "block" : "none" }}>
                <OfferPoolTab positionId={positionId} isActive={activeTab === "OFFER_POOL"} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CandidateWorkflow;

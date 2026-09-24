import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import recruiterApiService from "../../../core/recruiterApiService";
import Pagination from "../../../shared/Pagination";
import { formatDate } from "../../../shared/dateFormat";
import ScheduleInterviewModal from "./ScheduleInterviewModal";

const STATUS_PILL = {
  INVITE_SENT: "status-pill-info",
  SCHEDULED: "status-pill-info",
  DECLINED: "status-pill-danger",
  QUALIFIED: "status-pill-success",
  DISQUALIFIED: "status-pill-danger",
};

const STATUS_LABELS = {
  INVITE_SENT: "INVITE SENT",
  SCHEDULED: "SCHEDULED",
  DECLINED: "DECLINED",
  QUALIFIED: "QUALIFIED",
  DISQUALIFIED: "DISQUALIFIED",
};

/** Display-only: L{round} + status (e.g. L1 QUALIFIED). Backend status values unchanged. */
const poolStatusLabel = (status, round) => {
  if (!status) return "-";
  const label = STATUS_LABELS[status] || String(status).replace(/_/g, " ");
  const r = round != null && round !== "" ? Number(round) : 1;
  const roundNum = Number.isFinite(r) && r > 0 ? r : 1;
  return `L${roundNum} ${label}`;
};

const decisionLabel = (d) => {
  if (!d) return "-";
  if (d === "SELECT") return "Select (Recommend)";
  if (d === "REJECT") return "Reject";
  if (d === "HOLD") return "Hold";
  return d;
};

const formatScore = (s) => {
  if (s == null || s === "") return "-";
  const n = Number(s);
  return Number.isNaN(n) ? String(s) : (Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.?0+$/, ""));
};

const InterviewerScoresHint = ({ scores }) => {
  if (!scores || scores.length === 0) return null;
  return (
    <span className="ms-1 interviewer-scores-hint" title="">
      <i className="bi bi-info-circle text-app-primary" style={{ cursor: "pointer" }} />
      <span className="interviewer-scores-popover">
        <div className="fw-semibold mb-1">Interviewer markings</div>
        <div className="text-muted mb-2" style={{ fontSize: "0.72rem" }}>
          Status uses average score only (pass ≥ 5). Decisions below are advisory.
        </div>
        {scores.map((s, idx) => (
          <div key={idx} className="mb-2 pb-2 border-bottom" style={{ fontSize: "0.8rem" }}>
            <div className="fw-semibold">{s.interviewerName || "Interviewer"}</div>
            <div>Rating: {formatScore(s.score)}</div>
            <div>Rationale: {s.rationale?.trim() ? s.rationale : "-"}</div>
            <div>Decision: {decisionLabel(s.decision)}</div>
          </div>
        ))}
      </span>
    </span>
  );
};

const InterviewPoolTab = ({ positionId, isActive }) => {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showNextRoundModal, setShowNextRoundModal] = useState(false);
  const [searchText, setSearchText] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await recruiterApiService.searchInterviewPool({ positionId, page, size, searchText });
      setRows(res.data.data.content || []);
      setTotalPages(res.data.data.totalPages || 0);
    } catch (e) {
      toast.error("Failed to load interview pool");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    setSelected([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [positionId, page, size]);

  // Clear the selection and search text when navigating away to another tab - since this tab
  // now stays mounted (to avoid a reload flicker on revisit), they would otherwise persist.
  useEffect(() => {
    if (!isActive) {
      setSelected([]);
      setSearchText("");
    }
  }, [isActive]);

  // Only reload on a genuine searchText change, not on mount (compares actual values rather
  // than a "have I run before" flag, so it stays correct under StrictMode's double-invoke too).
  const prevSearchTextRef = useRef(searchText);
  useEffect(() => {
    if (prevSearchTextRef.current === searchText) return;
    prevSearchTextRef.current = searchText;
    const timeout = setTimeout(() => {
      setPage(0);
      load();
    }, 400);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  const toggleSelect = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const selectedRows = rows.filter((r) => selected.includes(r.candidateId));
  const canMove = selectedRows.length > 0 && selectedRows.every((r) => r.applicationStatus === "QUALIFIED");

  const sharedRound = (() => {
    if (selectedRows.length === 0) return null;
    if (!selectedRows.every((r) => r.applicationStatus === "QUALIFIED")) return null;
    const rounds = selectedRows.map((r) => r.round ?? 1);
    const first = rounds[0];
    return rounds.every((x) => x === first) ? first : null;
  })();
  const nextRound = sharedRound != null ? sharedRound + 1 : null;
  const canScheduleNext = nextRound != null;

  const handleMoveToCompensation = async () => {
    try {
      await recruiterApiService.moveToCompensation(selected);
      toast.success("Candidate(s) moved to Compensation Section");
      setSelected([]);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to move candidates");
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div className="d-flex align-items-center flex-wrap gap-2">
          <div className="search-boxpost">
            <i className="bi bi-search" />
            <input className="form-control form-control-sm" placeholder="Search candidates..." value={searchText} onChange={(e) => setSearchText(e.target.value)} />
          </div>
          {selected.length > 0 && (
            <span className="badge rounded-pill text-bg-light border text-app-primary fs-13">{selected.length} Candidates Selected</span>
          )}
        </div>
        <div className="d-flex gap-2">
          {canScheduleNext && (
            <button className="btn btn-outline-primary" onClick={() => setShowNextRoundModal(true)}>
              Schedule Next Round ({selected.length})
            </button>
          )}
          {canMove && (
            <button className="btn btn-blue-dark" onClick={handleMoveToCompensation}>
              Move to Compensation Section ({selected.length})
            </button>
          )}
        </div>
      </div>

      {loading ? <div>Loading...</div> : (
        <table className="table table-hover align-middle">
          <thead>
            <tr className="text-muted fs-13">
              <th></th>
              <th>Candidate</th>
              <th>Round</th>
              <th>Date</th>
              <th>Time</th>
              <th>Panel</th>
              <th>Score</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.candidateId}>
                <td>
                  {r.applicationStatus === "QUALIFIED" && (
                    <input type="checkbox" className="form-check-input" checked={selected.includes(r.candidateId)} onChange={() => toggleSelect(r.candidateId)} />
                  )}
                </td>
                <td>{r.candidateName}</td>
                <td>{r.round != null ? r.round : 1}</td>
                <td>{formatDate(r.interviewDate)}</td>
                <td>{r.startTime ? `${r.startTime} - ${r.endTime}` : "-"}</td>
                <td>{r.panelName || "-"}</td>
                <td>
                  {r.finalScore != null ? formatScore(r.finalScore) : "-"}
                  <small className="text-muted ms-1">({r.membersScored}/{r.membersTotal} scored)</small>
                  {(r.membersScored > 0) && <InterviewerScoresHint scores={r.memberScores} />}
                </td>
                <td><span className={`status-pill ${STATUS_PILL[r.applicationStatus] || "status-pill-secondary"}`}>{poolStatusLabel(r.applicationStatus, r.round)}</span></td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={8} className="text-center text-muted py-4">No candidates in the interview pool.</td></tr>
            )}
          </tbody>
        </table>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={setPage} size={size} onSizeChange={(s) => { setSize(s); setPage(0); }} />

      {showNextRoundModal && canScheduleNext && (
        <ScheduleInterviewModal
          candidates={selectedRows.map((r) => ({ id: r.candidateId, name: r.candidateName }))}
          round={nextRound}
          onClose={() => setShowNextRoundModal(false)}
          onScheduled={() => {
            setShowNextRoundModal(false);
            setSelected([]);
            load();
          }}
        />
      )}
    </div>
  );
};

export default InterviewPoolTab;

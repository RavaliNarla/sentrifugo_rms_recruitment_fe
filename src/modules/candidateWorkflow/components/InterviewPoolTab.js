import React, { useEffect, useRef, useState } from "react";
import { Modal } from "react-bootstrap";
import { toast } from "react-toastify";
import recruiterApiService from "../../../core/recruiterApiService";
import SearchableSelect from "../../../shared/SearchableSelect";
import Pagination from "../../../shared/Pagination";
import { formatDate } from "../../../shared/dateFormat";
import { formatTime12 } from "../../../shared/TimeInput";

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

/** Display-only: R{round} + status (e.g. R1 QUALIFIED). Backend status values unchanged. */
const poolStatusLabel = (status, round) => {
  if (!status) return "-";
  const label = STATUS_LABELS[status] || String(status).replace(/_/g, " ");
  const r = round != null && round !== "" ? Number(round) : 1;
  const roundNum = Number.isFinite(r) && r > 0 ? r : 1;
  return `R${roundNum} ${label}`;
};

const formatRoundCell = (round, roundName) => {
  const r = round != null && round !== "" ? Number(round) : 1;
  const roundNum = Number.isFinite(r) && r > 0 ? r : 1;
  const name = typeof roundName === "string" ? roundName.trim() : "";
  return name ? `${roundNum} (${name})` : String(roundNum);
};

const STATUS_FILTER_OPTIONS = ["INVITE_SENT", "SCHEDULED", "DECLINED", "QUALIFIED", "DISQUALIFIED"];

const COMPETENCY_LABELS = [
  { key: "TECHNICAL_KNOWLEDGE", label: "Technical Knowledge" },
  { key: "RELEVANT_EXPERIENCE", label: "Relevant Experience" },
  { key: "COMMUNICATION", label: "Communication" },
  { key: "PROBLEM_SOLVING", label: "Problem Solving" },
  { key: "ATTITUDE_APPROACH", label: "Attitude & Approach" },
];

const decisionLabel = (d) => {
  if (!d) return "-";
  if (d === "STRONG_HIRE") return "Strong Hire";
  if (d === "HIRE") return "Hire";
  if (d === "HOLD") return "Hold";
  if (d === "DO_NOT_HIRE") return "Do Not Hire";
  if (d === "SELECT") return "Select (Recommend)";
  if (d === "REJECT") return "Reject";
  return d;
};

const formatScore = (s) => {
  if (s == null || s === "") return "-";
  const n = Number(s);
  return Number.isNaN(n) ? String(s) : (Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.?0+$/, ""));
};

const formatRoundHeading = (round, roundName) => {
  const r = round != null && round !== "" ? Number(round) : 1;
  const roundNum = Number.isFinite(r) && r > 0 ? r : 1;
  const name = typeof roundName === "string" ? roundName.trim() : "";
  return name ? `Round ${roundNum} (${name})` : `Round ${roundNum}`;
};

const DECISION_PILL = {
  STRONG_HIRE: "status-pill-success",
  HIRE: "status-pill-success",
  SELECT: "status-pill-success",
  HOLD: "status-pill-warning",
  DO_NOT_HIRE: "status-pill-danger",
  REJECT: "status-pill-danger",
};

/** Scored rounds for a row, newest round first (falls back to the legacy flat score list). */
const feedbackRounds = (row) => {
  const rounds = Array.isArray(row?.roundFeedback) && row.roundFeedback.length > 0
    ? row.roundFeedback.filter((rf) => Array.isArray(rf.scores) && rf.scores.length > 0)
    : (row?.memberScores?.length ? [{ round: null, roundName: null, scores: row.memberScores }] : []);
  return [...rounds].sort((a, b) => (Number(b.round) || 0) - (Number(a.round) || 0));
};

const hasCompetency = (ratings) =>
  !!ratings && typeof ratings === "object" && COMPETENCY_LABELS.some((c) => ratings[c.key] != null && ratings[c.key] !== "");

/** Click the (i) next to a score: full interviewer feedback in a popup (nothing cut off, scrolls if long). */
const InterviewFeedbackModal = ({ row, onClose }) => {
  if (!row) return null;
  const rounds = feedbackRounds(row);
  return (
    <Modal show onHide={onClose} centered scrollable size="lg">
      <Modal.Header closeButton>
        <div>
          <Modal.Title className="text-app-primary" style={{ fontSize: "1.05rem" }}>
            Interview Feedback — {row.candidateName}
          </Modal.Title>
          <div className="text-muted fs-13 mt-1">
            Average score <span className="fw-semibold text-body">{formatScore(row.finalScore)}</span>
            {" · "}{row.membersScored}/{row.membersTotal} scored
            {" · "}
            <span className={`status-pill ${STATUS_PILL[row.applicationStatus] || "status-pill-secondary"}`}>
              {poolStatusLabel(row.applicationStatus, row.round)}
            </span>
          </div>
        </div>
      </Modal.Header>
      <Modal.Body>
        {rounds.map((rf, rIdx) => (
          <div key={`round-${rf.round ?? rIdx}`} className={rIdx < rounds.length - 1 ? "mb-4" : ""}>
            {rf.round != null && (
              <div className="fw-semibold text-app-primary mb-2 ps-2" style={{ borderLeft: "3px solid currentColor" }}>
                {formatRoundHeading(rf.round, rf.roundName)}
              </div>
            )}
            {rf.scores.map((sc, idx) => {
              const observations = typeof sc.keyObservations === "string" ? sc.keyObservations.trim() : "";
              return (
                <div key={idx} className="border rounded p-3 mb-2">
                  <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
                    <span className="fw-semibold">{sc.interviewerName || "Interviewer"}</span>
                    <span className="d-flex align-items-center gap-2">
                      <span className="fs-14">Rating <span className="fw-semibold">{formatScore(sc.score)}</span></span>
                      {sc.decision && (
                        <span className={`status-pill ${DECISION_PILL[sc.decision] || "status-pill-secondary"}`}>
                          {decisionLabel(sc.decision)}
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="fs-14 mb-2">
                    <span className="text-muted">Rationale: </span>
                    <span style={{ whiteSpace: "pre-wrap" }}>{sc.rationale?.trim() ? sc.rationale : "-"}</span>
                  </div>
                  {hasCompetency(sc.competencyRatings) && (
                    <table className="table table-sm table-borderless mb-2 fs-14" style={{ maxWidth: 360 }}>
                      <thead>
                        <tr className="text-muted fs-13"><th className="fw-normal">Competency</th><th className="fw-normal text-end">Rating</th></tr>
                      </thead>
                      <tbody>
                        {COMPETENCY_LABELS.map((c) => (
                          <tr key={c.key}>
                            <td className="py-1">{c.label}</td>
                            <td className="py-1 text-end">
                              {sc.competencyRatings[c.key] != null && sc.competencyRatings[c.key] !== "" ? `${sc.competencyRatings[c.key]}/5` : "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                  {observations && (
                    <div className="fs-14">
                      <span className="text-muted">Key Observations: </span>
                      <span style={{ whiteSpace: "pre-wrap" }}>{observations}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </Modal.Body>
      <Modal.Footer>
        <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
      </Modal.Footer>
    </Modal>
  );
};

const InterviewPoolTab = ({ positionId, isActive, onScheduleInterviews }) => {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  /** "" = all, otherwise "{round}|{STATUS}" (e.g. "2|SCHEDULED" = R2 SCHEDULED). */
  const [statusFilter, setStatusFilter] = useState("");
  /** Rounds present for this position (R1, R2, ...) - builds the status filter options. */
  const [rounds, setRounds] = useState([1]);
  const [confirmCancel, setConfirmCancel] = useState(false);
  /** Row whose interviewer feedback popup is open (null = closed). */
  const [feedbackRow, setFeedbackRow] = useState(null);

  const load = async (silent) => {
    if (!silent) setLoading(true);
    const [filterRound, filterStatus] = statusFilter ? statusFilter.split("|") : [];
    try {
      const [res, roundsRes] = await Promise.all([
        recruiterApiService.searchInterviewPool({
          positionId, page, size, searchText,
          statuses: filterStatus ? [filterStatus] : undefined,
          round: filterRound ? Number(filterRound) : undefined,
        }),
        recruiterApiService.getInterviewPoolRounds(positionId).catch(() => null),
      ]);
      setRows(res.data.data.content || []);
      setTotalPages(res.data.data.totalPages || 0);
      const levels = roundsRes?.data?.data;
      if (Array.isArray(levels) && levels.length) setRounds(levels);
    } catch (e) {
      toast.error("Failed to load interview pool");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isActive) return;
    load();
    setSelected([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [positionId, page, size, statusFilter]);

  // Clear the selection and search text when navigating away to another tab - since this tab
  // now stays mounted (to avoid a reload flicker on revisit), they would otherwise persist.
  // On the other hand, silently re-fetch (no loading flash) when revisiting - a candidate may
  // have just been moved in here from another tab (e.g. Candidate Pool) while we were away.
  const prevIsActiveRef = useRef(isActive);
  useEffect(() => {
    if (!isActive) {
      setSelected([]);
      setSearchText("");
      setStatusFilter("");
    } else if (!prevIsActiveRef.current) {
      load(true);
    }
    prevIsActiveRef.current = isActive;
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const clearFilters = () => {
    setSearchText("");
    setStatusFilter("");
    setPage(0);
  };

  const toggleSelect = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const selectedRows = rows.filter((r) => selected.includes(r.candidateId));
  const canMove = selectedRows.length > 0 && selectedRows.every((r) => r.applicationStatus === "QUALIFIED");

  const canSelectRow = (r) =>
    r.applicationStatus === "QUALIFIED"
    || ((r.applicationStatus === "SCHEDULED" || r.applicationStatus === "INVITE_SENT")
      && Number(r.membersScored || 0) === 0);

  const canRescheduleOrCancel = selectedRows.length > 0
    && selectedRows.every((r) =>
      (r.applicationStatus === "SCHEDULED" || r.applicationStatus === "INVITE_SENT")
      && Number(r.membersScored || 0) === 0);

  const sharedRound = (() => {
    if (selectedRows.length === 0) return null;
    if (!selectedRows.every((r) => r.applicationStatus === "QUALIFIED")) return null;
    const rounds = selectedRows.map((r) => r.round ?? 1);
    const first = rounds[0];
    return rounds.every((x) => x === first) ? first : null;
  })();
  const nextRound = sharedRound != null ? sharedRound + 1 : null;
  const canScheduleNext = nextRound != null;

  const rescheduleRound = (() => {
    if (!canRescheduleOrCancel) return null;
    const rounds = selectedRows.map((r) => r.round ?? 1);
    const first = rounds[0];
    return rounds.every((x) => x === first) ? first : null;
  })();

  const handleMoveToCompensation = async () => {
    try {
      await recruiterApiService.moveToCompensation(selected);
      toast.success("Candidate(s) moved to Compensation Management successfully");
      setSelected([]);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to move candidates");
    }
  };

  const handleCancelInterviews = async () => {
    setConfirmCancel(false);
    try {
      await recruiterApiService.cancelInterviews(selected);
      toast.success("Interview(s) cancelled — slots freed");
      setSelected([]);
      load();
      window.dispatchEvent(new CustomEvent("rms:notifications-refresh"));
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to cancel interviews");
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div className="d-flex align-items-center flex-wrap gap-2">
          <span className="text-muted fs-14">Filter by:</span>
          <button className="btn btn-link fs-14 text-danger p-0 text-decoration-none" onClick={clearFilters}>Clear all</button>
          <SearchableSelect
            size="sm"
            style={{ width: 210 }}
            value={statusFilter}
            onChange={(v) => { setStatusFilter(v); setPage(0); }}
            placeholder="All Statuses"
            searchPlaceholder="Search statuses..."
            ariaLabel="Status filter"
            options={[
              { value: "", label: "All Statuses" },
              ...rounds.flatMap((r) => STATUS_FILTER_OPTIONS.map((s) => ({ value: `${r}|${s}`, label: poolStatusLabel(s, r) }))),
            ]}
          />
          <div className="search-boxpost">
            <i className="bi bi-search" />
            <input className="form-control form-control-sm" placeholder="Search candidates..." value={searchText} onChange={(e) => setSearchText(e.target.value)} />
          </div>
          {selected.length > 0 && (
            <span className="badge rounded-pill text-bg-light border text-app-primary fs-13">{selected.length} Candidates Selected</span>
          )}
        </div>
        <div className="d-flex gap-2">
          {canRescheduleOrCancel && rescheduleRound != null && (
            <>
              <button
                type="button"
                className="btn btn-outline-primary"
                title="Reschedule selected interviews"
                onClick={() => onScheduleInterviews(selectedRows.map((r) => ({
                  id: r.candidateId,
                  name: r.candidateName,
                  panelId: r.panelId,
                  panelName: r.panelName,
                  interviewDate: r.interviewDate,
                  startTime: r.startTime,
                  endTime: r.endTime,
                  durationMinutes: r.durationMinutes,
                  roundName: r.roundName,
                })), rescheduleRound, "reschedule")}
              >
                <i className="bi bi-calendar2-week me-1" />
                Reschedule ({selected.length})
              </button>
              <button
                type="button"
                className="btn btn-outline-danger"
                title="Cancel selected interviews"
                onClick={() => setConfirmCancel(true)}
              >
                <i className="bi bi-x-circle me-1" />
                Cancel ({selected.length})
              </button>
            </>
          )}
          {canScheduleNext && (
            <button className="btn btn-outline-primary" onClick={() => onScheduleInterviews(selectedRows.map((r) => ({ id: r.candidateId, name: r.candidateName })), nextRound)}>
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
                  {canSelectRow(r) && (
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={selected.includes(r.candidateId)}
                      onChange={() => toggleSelect(r.candidateId)}
                      title={
                        (r.applicationStatus === "SCHEDULED" || r.applicationStatus === "INVITE_SENT")
                        && Number(r.membersScored || 0) > 0
                          ? "Cannot reschedule — scoring has started"
                          : undefined
                      }
                    />
                  )}
                </td>
                <td>{r.candidateName}</td>
                <td>{formatRoundCell(r.round, r.roundName)}</td>
                <td>{formatDate(r.interviewDate)}</td>
                <td>{r.startTime ? `${formatTime12(r.startTime)} - ${formatTime12(r.endTime)}` : "-"}</td>
                <td>{r.panelName || "-"}</td>
                <td>
                  {r.finalScore != null ? formatScore(r.finalScore) : "-"}
                  <small className="text-muted ms-1">({r.membersScored}/{r.membersTotal} scored)</small>
                  {feedbackRounds(r).length > 0 && (
                    <button
                      type="button"
                      className="btn btn-link p-0 ms-1 align-baseline"
                      title="View interviewer feedback"
                      aria-label={`View interviewer feedback for ${r.candidateName}`}
                      onClick={() => setFeedbackRow(r)}
                    >
                      <i className="bi bi-info-circle text-app-primary" />
                    </button>
                  )}
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


      <InterviewFeedbackModal row={feedbackRow} onClose={() => setFeedbackRow(null)} />

      {confirmCancel && (
        <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.45)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Cancel interviews?</h5>
                <button type="button" className="btn-close" onClick={() => setConfirmCancel(false)} />
              </div>
              <div className="modal-body">
                Cancel interview for {selected.length} candidate(s)? Panel slots will be freed and candidates return to Shortlisted / Qualified.
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setConfirmCancel(false)}>Keep</button>
                <button type="button" className="btn btn-danger" onClick={handleCancelInterviews}>Cancel interviews</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewPoolTab;

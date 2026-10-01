import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import recruiterApiService from "../../core/recruiterApiService";
import DateInput from "../../shared/DateInput";
import { formatDate } from "../../shared/dateFormat";
import { formatTime12 } from "../../shared/TimeInput";

const DECISION_OPTIONS = [
  { value: "", label: "Select" },
  { value: "STRONG_HIRE", label: "Strong Hire" },
  { value: "HIRE", label: "Hire" },
  { value: "HOLD", label: "Hold" },
  { value: "DO_NOT_HIRE", label: "Do Not Hire" },
];

const COMPETENCY_ROWS = [
  { key: "TECHNICAL_KNOWLEDGE", label: "Technical Knowledge" },
  { key: "RELEVANT_EXPERIENCE", label: "Relevant Experience" },
  { key: "COMMUNICATION", label: "Communication" },
  { key: "PROBLEM_SOLVING", label: "Problem Solving" },
  { key: "ATTITUDE_APPROACH", label: "Attitude & Approach" },
];

const emptyCompetency = () =>
  COMPETENCY_ROWS.reduce((acc, row) => {
    acc[row.key] = "";
    return acc;
  }, {});

const CompetencyModal = ({ open, candidateName, draft, onChange, onClose }) => {
  if (!open) return null;
  const ratings = draft?.competencyRatings || emptyCompetency();
  const observations = draft?.keyObservations || "";

  const setRating = (key, value) => {
    onChange({
      ...draft,
      competencyRatings: { ...ratings, [key]: value },
    });
  };

  const clearRating = (key) => {
    setRating(key, "");
  };

  return (
    <div className="modal show d-block" tabIndex={-1} style={{ background: "rgba(0,0,0,0.45)" }} onClick={onClose}>
      <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-header">
            <div>
              <h5 className="modal-title mb-0" style={{ color: "#1b5e20" }}>
                Competency Assessment (1=Poor, 5=Excellent)
              </h5>
              <div className="text-muted fs-13">{candidateName} — optional</div>
            </div>
            <button type="button" className="btn-close" aria-label="Close" onClick={onClose} />
          </div>
          <div className="modal-body">
            <div className="table-responsive">
              <table className="table table-bordered align-middle mb-3">
                <thead className="table-light">
                  <tr>
                    <th>Competency</th>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <th key={n} className="text-center" style={{ width: 52 }}>{n}</th>
                    ))}
                    <th style={{ width: 72 }} />
                  </tr>
                </thead>
                <tbody>
                  {COMPETENCY_ROWS.map((row) => (
                    <tr key={row.key}>
                      <td>{row.label}</td>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <td key={n} className="text-center">
                          <input
                            type="radio"
                            name={`comp-${row.key}`}
                            checked={String(ratings[row.key]) === String(n)}
                            onChange={() => setRating(row.key, String(n))}
                          />
                        </td>
                      ))}
                      <td className="text-center">
                        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => clearRating(row.key)}>
                          Clear
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <label className="form-label fw-semibold" style={{ color: "#1b5e20" }}>Key Observations</label>
            <textarea
              className="form-control"
              rows={4}
              placeholder="Optional notes"
              value={observations}
              onChange={(e) => onChange({ ...draft, keyObservations: e.target.value })}
            />
            <div className="form-text mt-2">
              Competency assessment is optional. If you rate any competency, all five must be rated. Rating / Rationale / Decision outside become required for this candidate.
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-primary" onClick={onClose}>Done</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const InterviewerSchedule = () => {
  const [requisitions, setRequisitions] = useState([]);
  const [positions, setPositions] = useState([]);
  const [requisitionId, setRequisitionId] = useState("");
  const [positionId, setPositionId] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [rows, setRows] = useState([]);
  const [scores, setScores] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [competencyFor, setCompetencyFor] = useState(null);

  useEffect(() => {
    recruiterApiService.getMyInterviewRequisitions()
      .then((res) => setRequisitions(res.data.data || []))
      .catch(() => toast.error("Failed to load requisitions"));
  }, []);

  useEffect(() => {
    if (!requisitionId) { setPositions([]); setPositionId(""); return; }
    Promise.all([
      recruiterApiService.getActivePositionsByRequisition(requisitionId),
      recruiterApiService.getMyInterviewPositionIds(requisitionId),
    ])
      .then(([positionsRes, myIdsRes]) => {
        const myPositionIds = new Set(myIdsRes.data.data || []);
        setPositions((positionsRes.data.data || []).filter((p) => myPositionIds.has(p.id)));
        setPositionId("");
      })
      .catch(() => toast.error("Failed to load positions"));
  }, [requisitionId]);

  const load = async () => {
    if (!positionId || !dateFilter) { setRows([]); return; }
    setLoading(true);
    try {
      const res = await recruiterApiService.getMyInterviews(positionId, dateFilter);
      const data = res.data.data || [];
      setRows(data);
      const initial = {};
      data.forEach((r) => {
        let scoreStr = "";
        if (r.myScore != null && r.myScore !== "") {
          const n = Number(r.myScore);
          scoreStr = Number.isNaN(n) ? String(r.myScore) : String(n);
        }
        const ratings = { ...emptyCompetency() };
        if (r.myCompetencyRatings && typeof r.myCompetencyRatings === "object") {
          COMPETENCY_ROWS.forEach((row) => {
            const v = r.myCompetencyRatings[row.key];
            if (v != null && v !== "") ratings[row.key] = String(v);
          });
        }
        initial[r.candidateId] = {
          score: scoreStr,
          rationale: r.myRationale || "",
          decision: r.myDecision || "",
          competencyRatings: ratings,
          keyObservations: r.myKeyObservations || "",
        };
      });
      setScores(initial);
    } catch (e) {
      toast.error("Failed to load your interviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [positionId, dateFilter]);

  const updateScore = (candidateId, field, value) => {
    setScores((prev) => ({ ...prev, [candidateId]: { ...prev[candidateId], [field]: value } }));
  };

  const competencyFilledCount = (ratings = {}) =>
    COMPETENCY_ROWS.filter((row) => ratings[row.key] !== "" && ratings[row.key] != null).length;

  const handleSubmit = async () => {
    const requests = [];
    for (const row of rows) {
      const v = scores[row.candidateId] || {};
      const scoreRaw = v.score;
      const rationale = (v.rationale || "").trim();
      const decision = (v.decision || "").trim();
      const ratings = v.competencyRatings || emptyCompetency();
      const keyObservations = (v.keyObservations || "").trim();
      const filledComp = competencyFilledCount(ratings);
      const hasScore = !(scoreRaw === "" || scoreRaw === undefined || scoreRaw === null);
      const hasRationale = !!rationale;
      const hasDecision = !!decision;
      const anyMain = hasScore || hasRationale || hasDecision;
      const anyComp = filledComp > 0 || !!keyObservations;

      if (!anyMain && !anyComp) {
        // Untouched candidate — skip (all-or-none across candidates).
        continue;
      }

      if (filledComp > 0 && filledComp < COMPETENCY_ROWS.length) {
        toast.error(`In competency assessment for ${row.candidateName}: rate all five competencies (or clear them all).`);
        return;
      }

      if (anyComp && filledComp === COMPETENCY_ROWS.length && !(hasScore && hasRationale && hasDecision)) {
        toast.error(`Competency assessment for ${row.candidateName} requires Rating, Rationale, and Decision.`);
        return;
      }

      if (anyMain && !(hasScore && hasRationale && hasDecision)) {
        if (!hasScore) toast.error(`Enter Rating for ${row.candidateName}`);
        else if (!hasRationale) toast.error(`Enter Rationale for ${row.candidateName}`);
        else toast.error(`Select Decision for ${row.candidateName}`);
        return;
      }

      if (!hasScore) {
        toast.error(`Enter Rating for ${row.candidateName}`);
        return;
      }

      const score = Number(scoreRaw);
      if (Number.isNaN(score) || score < 1 || score > 10) {
        toast.error("Ratings must be between 1 and 10 (decimals like 7.5 allowed)");
        return;
      }

      const competencyRatings = filledComp === COMPETENCY_ROWS.length
        ? COMPETENCY_ROWS.reduce((acc, rowDef) => {
            acc[rowDef.key] = Number(ratings[rowDef.key]);
            return acc;
          }, {})
        : undefined;

      requests.push({
        candidateId: row.candidateId,
        score,
        rationale,
        decision,
        competencyRatings,
        keyObservations: keyObservations || undefined,
      });
    }

    if (requests.length === 0) {
      toast.error("Fill Rating, Rationale, and Decision for at least one candidate before submitting.");
      return;
    }
    setSaving(true);
    try {
      await recruiterApiService.submitScoreBatch(requests);
      toast.success("Scores submitted successfully");
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to submit scores");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="app-card mb-3">
        <div className="row">
          <div className="col-md-4">
            <label className="form-label">Requisition <span className="text-danger">*</span></label>
            <select className="form-select" value={requisitionId} onChange={(e) => setRequisitionId(e.target.value)}>
              <option value="">Select Requisition</option>
              {requisitions.map((r) => <option key={r.id} value={r.id}>{r.requisitionCode} - {r.title}</option>)}
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label">Position <span className="text-danger">*</span></label>
            <select className="form-select" value={positionId} onChange={(e) => setPositionId(e.target.value)} disabled={!requisitionId}>
              <option value="">Select Position</option>
              {positions.map((p) => <option key={p.id} value={p.id}>{p.positionTitleName} - {p.locationName}</option>)}
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label">Interview Date <span className="text-danger">*</span></label>
            <DateInput value={dateFilter} onChange={setDateFilter} placeholder="Select a date" />
          </div>
        </div>
      </div>

      {positionId && !dateFilter && (
        <div className="app-card text-center text-muted py-4">
          Select an Interview Date to view scheduled candidates.
        </div>
      )}

      {positionId && dateFilter && (
        <div className="app-card">
          {loading ? <div>Loading...</div> : (
            <>
              <table className="table">
                <thead className="table-light">
                  <tr>
                    <th>Candidate</th>
                    <th>Round</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th style={{ width: 100 }}>Rating (1-10)</th>
                    <th>Rationale</th>
                    <th style={{ width: 140 }}>Decision</th>
                    <th style={{ width: 150 }}>Competency</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => {
                    const draft = scores[r.candidateId] || {};
                    const filled = competencyFilledCount(draft.competencyRatings);
                    return (
                      <tr key={r.candidateId}>
                        <td>{r.candidateName}</td>
                        <td>{r.roundName ? `${r.round != null ? r.round : 1} (${r.roundName})` : (r.round != null ? r.round : 1)}</td>
                        <td>{formatDate(r.interviewDate)}</td>
                        <td>{formatTime12(r.startTime)} - {formatTime12(r.endTime)}</td>
                        <td><span className="badge bg-secondary">{r.applicationStatus}</span></td>
                        <td>
                          <input
                            type="number"
                            min={1}
                            max={10}
                            step="0.1"
                            className="form-control form-control-sm"
                            value={draft.score ?? ""}
                            onChange={(e) => updateScore(r.candidateId, "score", e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            className="form-control form-control-sm"
                            placeholder="Why this score?"
                            value={draft.rationale ?? ""}
                            onChange={(e) => updateScore(r.candidateId, "rationale", e.target.value)}
                          />
                        </td>
                        <td>
                          <select
                            className="form-select form-select-sm"
                            value={draft.decision ?? ""}
                            onChange={(e) => updateScore(r.candidateId, "decision", e.target.value)}
                          >
                            {DECISION_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                          </select>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-success"
                            onClick={() => setCompetencyFor(r)}
                          >
                            {filled > 0 ? `Assessment (${filled}/5)` : "Fill assessment"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {rows.length === 0 && (
                    <tr><td colSpan={9} className="text-center text-muted py-4">No candidates scheduled with your panel for this position on this date.</td></tr>
                  )}
                </tbody>
              </table>
              {rows.length > 0 && (
                <div className="d-flex justify-content-between align-items-center">
                  <div className="text-muted fs-13">
                    Only fill candidates you interviewed. Rating, Rationale, and Decision must be filled together for those rows.
                  </div>
                  <button className="btn btn-primary" disabled={saving} onClick={handleSubmit}>
                    {saving ? "Submitting..." : "Submit Scores"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      <CompetencyModal
        open={!!competencyFor}
        candidateName={competencyFor?.candidateName || ""}
        draft={competencyFor ? scores[competencyFor.candidateId] : null}
        onChange={(next) => competencyFor && setScores((prev) => ({ ...prev, [competencyFor.candidateId]: next }))}
        onClose={() => setCompetencyFor(null)}
      />
    </div>
  );
};

export default InterviewerSchedule;

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import recruiterApiService from "../../core/recruiterApiService";
import DateInput from "../../shared/DateInput";
import { formatDate } from "../../shared/dateFormat";

const DECISION_OPTIONS = [
  { value: "", label: "Select" },
  { value: "SELECT", label: "Select (Recommend)" },
  { value: "REJECT", label: "Reject" },
  { value: "HOLD", label: "Hold" },
];

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

  useEffect(() => {
    recruiterApiService.getApprovedRequisitions().then((res) => setRequisitions(res.data.data || []));
  }, []);

  useEffect(() => {
    if (!requisitionId) { setPositions([]); setPositionId(""); return; }
    recruiterApiService.getActivePositionsByRequisition(requisitionId).then((res) => {
      setPositions(res.data.data || []);
      setPositionId("");
    });
  }, [requisitionId]);

  const load = async () => {
    if (!positionId) { setRows([]); return; }
    setLoading(true);
    try {
      const res = await recruiterApiService.getMyInterviews(positionId, dateFilter || undefined);
      const data = res.data.data || [];
      setRows(data);
      // SCL_29: redisplay the interviewer's own previously-saved score/rationale/decision, not blank fields.
      const initial = {};
      data.forEach((r) => {
        initial[r.candidateId] = {
          score: r.myScore != null ? String(r.myScore) : "",
          rationale: r.myRationale || "",
          decision: r.myDecision || "",
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

  const handleSubmit = async () => {
    const requests = Object.entries(scores)
      .filter(([, v]) => v.score !== "" && v.score !== undefined)
      .map(([candidateId, v]) => ({ candidateId, score: Number(v.score), rationale: v.rationale, decision: v.decision || null }));

    if (requests.length === 0) {
      toast.error("Enter at least one score before submitting");
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
            <label className="form-label">Requisition</label>
            <select className="form-select" value={requisitionId} onChange={(e) => setRequisitionId(e.target.value)}>
              <option value="">Select Requisition</option>
              {requisitions.map((r) => <option key={r.id} value={r.id}>{r.requisitionCode} - {r.title}</option>)}
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label">Position</label>
            <select className="form-select" value={positionId} onChange={(e) => setPositionId(e.target.value)} disabled={!requisitionId}>
              <option value="">Select Position</option>
              {positions.map((p) => <option key={p.id} value={p.id}>{p.positionTitleName} - {p.locationName}</option>)}
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label">Interview Date</label>
            <DateInput value={dateFilter} onChange={setDateFilter} placeholder="All dates" />
          </div>
        </div>
      </div>

      {positionId && (
        <div className="app-card">
          {loading ? <div>Loading...</div> : (
            <>
              <table className="table">
                <thead className="table-light">
                  <tr>
                    <th>Candidate</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th style={{ width: 110 }}>Rating (1-10)</th>
                    <th>Rationale</th>
                    <th style={{ width: 160 }}>Decision</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.candidateId}>
                      <td>{r.candidateName}</td>
                      <td>{formatDate(r.interviewDate)}</td>
                      <td>{r.startTime} - {r.endTime}</td>
                      <td><span className="badge bg-secondary">{r.applicationStatus}</span></td>
                      <td>
                        <input
                          type="number"
                          min={1}
                          max={10}
                          className="form-control form-control-sm"
                          value={scores[r.candidateId]?.score ?? ""}
                          onChange={(e) => updateScore(r.candidateId, "score", e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          className="form-control form-control-sm"
                          placeholder="Why this score?"
                          value={scores[r.candidateId]?.rationale ?? ""}
                          onChange={(e) => updateScore(r.candidateId, "rationale", e.target.value)}
                        />
                      </td>
                      <td>
                        <select
                          className="form-select form-select-sm"
                          value={scores[r.candidateId]?.decision ?? ""}
                          onChange={(e) => updateScore(r.candidateId, "decision", e.target.value)}
                        >
                          {DECISION_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                  {rows.length === 0 && (
                    <tr><td colSpan={7} className="text-center text-muted py-4">No candidates scheduled with your panel for this position{dateFilter ? " on this date" : ""}.</td></tr>
                  )}
                </tbody>
              </table>
              {rows.length > 0 && (
                <div className="d-flex justify-content-end">
                  <button className="btn btn-primary" disabled={saving} onClick={handleSubmit}>
                    {saving ? "Submitting..." : "Submit Scores"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default InterviewerSchedule;

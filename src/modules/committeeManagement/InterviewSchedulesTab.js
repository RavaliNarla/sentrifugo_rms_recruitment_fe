import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import recruiterApiService from "../../core/recruiterApiService";
import masterApiService from "../../core/masterApiService";
import Pagination from "../../shared/Pagination";
import { formatDate } from "../../shared/dateFormat";

const todayStr = () => new Date().toISOString().slice(0, 10);
const plusDaysStr = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

const formatTime = (t) => {
  if (!t) return "-";
  const s = String(t);
  return s.length >= 5 ? s.slice(0, 5) : s;
};

/**
 * Read-only look-ahead: what interviews a panel (or an interviewer) has in a date range.
 * Complements Candidate Management, which is candidate-centric.
 */
const InterviewSchedulesTab = () => {
  const [view, setView] = useState("PANEL");
  const [panels, setPanels] = useState([]);
  const [interviewers, setInterviewers] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [fromDate, setFromDate] = useState(todayStr());
  const [toDate, setToDate] = useState(plusDaysStr(14));
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    recruiterApiService.getPanels()
      .then((res) => setPanels(res.data.data || []))
      .catch(() => toast.error("Failed to load panels"));
    masterApiService.getPanelMembers()
      .then((res) => setInterviewers(res.data.data || []))
      .catch(() => toast.error("Failed to load interviewers"));
  }, []);

  useEffect(() => {
    setSelectedId("");
    setRows([]);
    setPage(0);
  }, [view]);

  const load = async () => {
    if (!selectedId) {
      setRows([]);
      setTotalPages(0);
      return;
    }
    if (!fromDate || !toDate) {
      toast.error("Select From and To dates");
      return;
    }
    if (toDate < fromDate) {
      toast.error("To date cannot be before From date");
      return;
    }
    setLoading(true);
    try {
      const res = await recruiterApiService.getInterviewSchedules({
        view,
        id: selectedId,
        from: fromDate,
        to: toDate,
        page,
        size,
      });
      const data = res.data.data || {};
      setRows(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to load interview schedules");
      setRows([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, fromDate, toDate, page, size, view]);

  return (
    <div className="app-card">
      <div className="mb-3">
        <div className="fw-bold">Interview Schedules</div>
        <div className="text-muted small">
          See what a panel or interviewer has coming up — without digging through the candidate list.
        </div>
      </div>

      <div className="row g-3 align-items-end mb-3">
        <div className="col-md-3">
          <label className="form-label small">View by</label>
          <select className="form-select" value={view} onChange={(e) => setView(e.target.value)}>
            <option value="PANEL">By Panel</option>
            <option value="INTERVIEWER">By Interviewer</option>
          </select>
        </div>
        <div className="col-md-3">
          <label className="form-label small">{view === "PANEL" ? "Panel" : "Interviewer"}</label>
          <select className="form-select" value={selectedId} onChange={(e) => { setSelectedId(e.target.value); setPage(0); }}>
            <option value="">{view === "PANEL" ? "Select panel" : "Select interviewer"}</option>
            {view === "PANEL"
              ? panels.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)
              : interviewers.map((u) => (
                <option key={u.id} value={u.id}>{u.name}{u.role ? ` (${u.role})` : ""}</option>
              ))}
          </select>
        </div>
        <div className="col-md-2">
          <label className="form-label small">From</label>
          <input type="date" className="form-control" value={fromDate} onChange={(e) => { setFromDate(e.target.value); setPage(0); }} />
        </div>
        <div className="col-md-2">
          <label className="form-label small">To</label>
          <input type="date" className="form-control" value={toDate} onChange={(e) => { setToDate(e.target.value); setPage(0); }} />
        </div>
      </div>

      {loading ? (
        <div className="text-muted py-4">Loading...</div>
      ) : !selectedId ? (
        <div className="text-muted text-center py-4">Choose a {view === "PANEL" ? "panel" : "interviewer"} to see schedules.</div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead>
                <tr className="text-muted fs-13">
                  <th>Date</th>
                  <th>Time</th>
                  <th>Round</th>
                  <th>Candidate</th>
                  <th>Position</th>
                  <th>Location</th>
                  <th>Panel</th>
                  <th>Members</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td>{formatDate(r.interviewDate)}</td>
                    <td>{formatTime(r.startTime)} – {formatTime(r.endTime)}</td>
                    <td>{r.round != null ? r.round : 1}</td>
                    <td>
                      <div>{r.candidateName || "-"}</div>
                      <div className="text-muted small">{r.candidateEmail || ""}</div>
                    </td>
                    <td>{r.positionTitleName || "-"}</td>
                    <td>{r.locationName || "-"}</td>
                    <td>{r.panelName || "-"}</td>
                    <td className="small">{(r.panelMemberNames || []).join(", ") || "-"}</td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center text-muted py-4">No interviews in this date range.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination
            page={page}
            totalPages={totalPages}
            onChange={setPage}
            size={size}
            onSizeChange={(s) => { setSize(s); setPage(0); }}
          />
        </>
      )}
    </div>
  );
};

export default InterviewSchedulesTab;

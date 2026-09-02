import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import recruiterApiService from "../../../core/recruiterApiService";
import Pagination from "../../../shared/Pagination";

const STATUS_BADGE = {
  SCHEDULED: "info",
  QUALIFIED: "success",
  DISQUALIFIED: "danger",
};

const InterviewPoolTab = ({ positionId }) => {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await recruiterApiService.searchInterviewPool({ positionId, page, size });
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

  const toggleSelect = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const selectedRows = rows.filter((r) => selected.includes(r.candidateId));
  const canMove = selectedRows.length > 0 && selectedRows.every((r) => r.applicationStatus === "QUALIFIED");

  const handleMoveToCompensation = async () => {
    try {
      await recruiterApiService.moveToCompensation(selected);
      toast.success("Candidate(s) moved to Compensation Pool");
      setSelected([]);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to move candidates");
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-end mb-3">
        {canMove && (
          <button className="btn btn-outline-primary" onClick={handleMoveToCompensation}>
            Move to Compensation Pool ({selected.length})
          </button>
        )}
      </div>

      {loading ? <div>Loading...</div> : (
        <table className="table table-hover">
          <thead className="table-light">
            <tr>
              <th></th>
              <th>Candidate</th>
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
                <td>{r.interviewDate || "-"}</td>
                <td>{r.startTime ? `${r.startTime} - ${r.endTime}` : "-"}</td>
                <td>{r.panelName || "-"}</td>
                <td>
                  {r.finalScore != null ? r.finalScore : "-"}
                  <small className="text-muted ms-1">({r.membersScored}/{r.membersTotal} scored)</small>
                </td>
                <td><span className={`badge bg-${STATUS_BADGE[r.applicationStatus] || "secondary"}`}>{r.applicationStatus}</span></td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={7} className="text-center text-muted py-4">No candidates in the interview pool.</td></tr>
            )}
          </tbody>
        </table>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={setPage} size={size} onSizeChange={(s) => { setSize(s); setPage(0); }} />
    </div>
  );
};

export default InterviewPoolTab;

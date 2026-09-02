import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import recruiterApiService from "../../../core/recruiterApiService";
import Pagination from "../../../shared/Pagination";
import AddCandidateModal from "./AddCandidateModal";
import CandidateProfileModal from "./CandidateProfileModal";
import ScheduleInterviewModal from "./ScheduleInterviewModal";

const STATUS_BADGE = {
  ADDED: "secondary",
  SHORTLISTED: "warning",
  SCHEDULED: "info",
  QUALIFIED: "success",
  DISQUALIFIED: "danger",
  COMPENSATION_PENDING: "primary",
  MOVED_TO_OFFER: "dark",
};

const CandidatePoolTab = ({ requisitionId, positionId }) => {
  const [candidates, setCandidates] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [selected, setSelected] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [profileCandidate, setProfileCandidate] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await recruiterApiService.searchCandidates({ positionId, page, size });
      setCandidates(res.data.data.content || []);
      setTotalPages(res.data.data.totalPages || 0);
    } catch (e) {
      toast.error("Failed to load candidates");
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

  const handleShortlist = async (id) => {
    try {
      await recruiterApiService.shortlistCandidate(id);
      toast.success("Candidate shortlisted successfully");
      setProfileCandidate(null);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to shortlist candidate");
    }
  };

  const selectedCandidates = candidates.filter((c) => selected.includes(c.id));
  const canSchedule = selectedCandidates.length > 0 && selectedCandidates.every((c) => c.status === "SHORTLISTED");

  return (
    <div>
      <div className="d-flex justify-content-between mb-3">
        <div>
          {canSchedule && (
            <button className="btn btn-outline-primary" onClick={() => setShowScheduleModal(true)}>
              Schedule Interview ({selected.length})
            </button>
          )}
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <i className="bi bi-plus-lg" /> Add Candidate
        </button>
      </div>

      {loading ? <div>Loading...</div> : (
        <table className="table table-hover">
          <thead className="table-light">
            <tr>
              <th></th>
              <th>Candidate</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((c) => (
              <tr key={c.id}>
                <td>
                  {c.status === "SHORTLISTED" && (
                    <input type="checkbox" className="form-check-input" checked={selected.includes(c.id)} onChange={() => toggleSelect(c.id)} />
                  )}
                </td>
                <td>{c.name}</td>
                <td>{c.phone}</td>
                <td>{c.email}</td>
                <td><span className={`badge bg-${STATUS_BADGE[c.status] || "secondary"}`}>{c.status}</span></td>
                <td>
                  <button className="btn btn-sm btn-outline-secondary me-2" title="View Profile" onClick={() => setProfileCandidate(c)}>
                    <i className="bi bi-person" />
                  </button>
                  {c.hasResume && (
                    <a className="btn btn-sm btn-outline-secondary me-2" title="View Resume" href={recruiterApiService.fileUrl(c.resumeUrl)} target="_blank" rel="noreferrer">
                      <i className="bi bi-file-earmark-text" />
                    </a>
                  )}
                  {c.status === "ADDED" && (
                    <button className="btn btn-sm btn-outline-primary" onClick={() => handleShortlist(c.id)}>Shortlist</button>
                  )}
                </td>
              </tr>
            ))}
            {candidates.length === 0 && (
              <tr><td colSpan={6} className="text-center text-muted py-4">No candidates found for this position.</td></tr>
            )}
          </tbody>
        </table>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={setPage} size={size} onSizeChange={(s) => { setSize(s); setPage(0); }} />

      {showAddModal && (
        <AddCandidateModal
          requisitionId={requisitionId}
          positionId={positionId}
          onClose={() => setShowAddModal(false)}
          onSaved={() => { setShowAddModal(false); load(); }}
        />
      )}

      {profileCandidate && (
        <CandidateProfileModal candidate={profileCandidate} onClose={() => setProfileCandidate(null)} onShortlist={handleShortlist} />
      )}

      {showScheduleModal && (
        <ScheduleInterviewModal
          positionId={positionId}
          candidates={selectedCandidates}
          onClose={() => setShowScheduleModal(false)}
          onScheduled={() => { setShowScheduleModal(false); setSelected([]); load(); }}
        />
      )}
    </div>
  );
};

export default CandidatePoolTab;

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import recruiterApiService from "../../../core/recruiterApiService";
import Pagination from "../../../shared/Pagination";
import PdfViewerModal from "../../../shared/PdfViewerModal";
import { useFilePreview } from "../../../shared/useFilePreview";
import AddCandidateModal from "./AddCandidateModal";
import CandidateProfileModal from "./CandidateProfileModal";
import ScheduleInterviewModal from "./ScheduleInterviewModal";

const STATUS_PILL = {
  ADDED: "status-pill-secondary",
  SHORTLISTED: "status-pill-warning",
  SCHEDULED: "status-pill-info",
  QUALIFIED: "status-pill-success",
  DISQUALIFIED: "status-pill-danger",
  COMPENSATION_PENDING: "status-pill-warning",
  MOVED_TO_OFFER: "status-pill-secondary",
};

const STATUS_OPTIONS = ["ADDED", "SHORTLISTED", "SCHEDULED", "QUALIFIED", "DISQUALIFIED", "COMPENSATION_PENDING", "MOVED_TO_OFFER"];

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
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const filePreview = useFilePreview();

  const load = async () => {
    setLoading(true);
    try {
      const res = await recruiterApiService.searchCandidates({
        positionId,
        page,
        size,
        searchText,
        statuses: statusFilter ? [statusFilter] : undefined,
      });
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
  }, [positionId, page, size, statusFilter]);

  useEffect(() => {
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
      <div className="d-flex justify-content-between align-items-end flex-wrap gap-2 mb-3">
        <div className="d-flex align-items-center flex-wrap gap-2">
          <span className="text-muted fs-14">Filter by:</span>
          <button className="btn btn-link fs-14 text-danger p-0 text-decoration-none" onClick={clearFilters}>Clear all</button>
          <select className="form-select form-select-sm" style={{ width: 170 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
          </select>
          <div className="search-boxpost">
            <i className="bi bi-search" />
            <input className="form-control form-control-sm" placeholder="Search candidates..." value={searchText} onChange={(e) => setSearchText(e.target.value)} />
          </div>
          {selected.length > 0 && (
            <span className="badge rounded-pill text-bg-light border text-app-primary fs-13">{selected.length} Candidates Selected</span>
          )}
        </div>

        <div className="d-flex gap-2">
          {canSchedule && (
            <button className="btn btn-blue-dark" onClick={() => setShowScheduleModal(true)}>
              Schedule Interview ({selected.length})
            </button>
          )}
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <i className="bi bi-plus-lg" /> Add Candidate
          </button>
        </div>
      </div>

      {loading ? <div>Loading...</div> : (
        <table className="table table-hover align-middle">
          <thead>
            <tr className="text-muted fs-13">
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
                <td><span className={`status-pill ${STATUS_PILL[c.status] || "status-pill-secondary"}`}>{c.status.replace(/_/g, " ")}</span></td>
                <td>
                  <button className="icon-btn-circle me-2" title="View Profile" onClick={() => setProfileCandidate(c)}>
                    <i className="bi bi-person" />
                  </button>
                  {c.hasResume && (
                    <button
                      type="button"
                      className="icon-btn-circle me-2"
                      title="View Resume"
                      onClick={() => filePreview.openFile(c.resumeUrl, "Resume Preview")}
                    >
                      <i className="bi bi-file-earmark-text" />
                    </button>
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
        <CandidateProfileModal
          candidate={profileCandidate}
          onClose={() => setProfileCandidate(null)}
          onShortlist={handleShortlist}
          onViewFile={filePreview.openFile}
        />
      )}

      <PdfViewerModal
        show={filePreview.show}
        onHide={filePreview.close}
        fileUrl={filePreview.fileUrl}
        fileExtension={filePreview.fileExtension}
        loading={filePreview.loading}
        title={filePreview.title}
      />

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

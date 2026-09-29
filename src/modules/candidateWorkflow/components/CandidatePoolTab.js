import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import recruiterApiService from "../../../core/recruiterApiService";
import Pagination from "../../../shared/Pagination";
import PdfViewerModal from "../../../shared/PdfViewerModal";
import { useFilePreview } from "../../../shared/useFilePreview";
import ConfirmModal from "../../../shared/ConfirmModal";
import AddCandidateModal from "./AddCandidateModal";
import BulkUploadCandidatesModal from "./BulkUploadCandidatesModal";
import CandidateProfileModal from "./CandidateProfileModal";

const STATUS_PILL = {
  DRAFT: "status-pill-secondary",
  ADDED: "status-pill-secondary",
  SHORTLISTED: "status-pill-warning",
  REJECTED: "status-pill-danger",
  ON_HOLD: "status-pill-warning",
  INVITE_SENT: "status-pill-info",
  SCHEDULED: "status-pill-info",
  DECLINED: "status-pill-danger",
  QUALIFIED: "status-pill-success",
  DISQUALIFIED: "status-pill-danger",
  COMPENSATION_PENDING: "status-pill-warning",
  COMPENSATION_SUBMITTED: "status-pill-success",
  MOVED_TO_OFFER: "status-pill-secondary",
};

const STATUS_OPTIONS = ["DRAFT", "ADDED", "SHORTLISTED", "REJECTED", "ON_HOLD", "INVITE_SENT", "SCHEDULED", "DECLINED", "QUALIFIED", "DISQUALIFIED", "COMPENSATION_PENDING", "COMPENSATION_SUBMITTED", "MOVED_TO_OFFER"];

const STATUS_LABELS = {
  DRAFT: "Draft",
  ADDED: "Applied",
  SHORTLISTED: "SHORTLISTED",
  REJECTED: "REJECTED",
  ON_HOLD: "ON HOLD",
  INVITE_SENT: "INVITE SENT",
  SCHEDULED: "SCHEDULED",
  DECLINED: "DECLINED",
  COMPENSATION_PENDING: "COMPENSATION PENDING",
  COMPENSATION_SUBMITTED: "COMPENSATION SUBMITTED",
};

const DECISION_SUCCESS_MESSAGES = {
  SHORTLIST: "Candidate shortlisted successfully. A notification email has been sent to the candidate.",
  REJECT: "Candidate rejected successfully. A notification email has been sent to the candidate.",
  HOLD: "Candidate put on hold successfully. A notification email has been sent to the candidate.",
};

const ROUND_PREFIX_STATUSES = new Set([
  "INVITE_SENT", "SCHEDULED", "DECLINED", "QUALIFIED", "DISQUALIFIED",
]);

export const getStatusLabel = (status, interviewRound) => {
  if (!status) return "-";
  const base = STATUS_LABELS[status] || String(status).replace(/_/g, " ");
  if (!ROUND_PREFIX_STATUSES.has(status)) return base;
  const r = interviewRound != null && interviewRound !== "" ? Number(interviewRound) : 1;
  const roundNum = Number.isFinite(r) && r > 0 ? r : 1;
  return `R${roundNum} ${base}`;
};

/** Shortlist buttons only for Applied / SHORTLISTED / REJECTED / ON HOLD. */
export const canShortlistDecide = (status) =>
  ["ADDED", "SHORTLISTED", "REJECTED", "ON_HOLD"].includes(status);

const CandidatePoolTab = ({ requisitionId, positionId, isActive, onScheduleInterviews }) => {
  const [candidates, setCandidates] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [selected, setSelected] = useState([]);
  // Keeps the full candidate object for anything ever selected, so selections made on one
  // page (and their data, needed for canSchedule/ScheduleInterviewModal) survive navigating
  // to another page, where the original candidates array no longer holds that row.
  const [selectedCandidatesMap, setSelectedCandidatesMap] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [profileCandidate, setProfileCandidate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const filePreview = useFilePreview();
  const [confirmState, setConfirmState] = useState({ show: false, message: "", onConfirm: null });

  const askConfirm = (message, action) => setConfirmState({ show: true, message, onConfirm: action });
  const closeConfirm = () => setConfirmState({ show: false, message: "", onConfirm: null });

  // Guards against two overlapping fetches (e.g. React StrictMode's dev-only double-invoke
  // of effects on first mount) turning into two separate loading-spinner flips.
  const loadInFlightRef = useRef(false);
  const load = async (silent) => {
    if (loadInFlightRef.current) return;
    loadInFlightRef.current = true;
    if (!silent) setLoading(true);
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
      loadInFlightRef.current = false;
    }
  };

  useEffect(() => {
    if (!isActive) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [positionId, page, size, statusFilter]);

  // Only clear selection when the position or status filter genuinely changes context -
  // not on plain pagination/page-size changes, so selections persist across pages.
  useEffect(() => {
    setSelected([]);
    setSelectedCandidatesMap({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [positionId, statusFilter]);

  // Clear selection/filters when leaving; silent re-fetch when returning so status changes
  // made in other pools (e.g. Compensation Submitted) show without a full page refresh.
  const prevIsActiveRef = useRef(isActive);
  useEffect(() => {
    if (!isActive) {
      setSelected([]);
      setSelectedCandidatesMap({});
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

  const toggleSelect = (candidate) => {
    const id = candidate.id;
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    setSelectedCandidatesMap((prev) => {
      if (prev[id]) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: candidate };
    });
  };

  // SCL_25: shortlist decision — SHORTLIST / REJECT / HOLD → SHORTLISTED / REJECTED / ON_HOLD.
  const handleDecide = async (id, decision) => {
    try {
      await recruiterApiService.decideCandidate(id, decision);
      toast.success(DECISION_SUCCESS_MESSAGES[decision] || "Decision recorded successfully.");
      setProfileCandidate(null);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to record decision");
    }
  };

  // SCL_42: Edit/Delete are only available for newly-added candidates.
  const handleDelete = (c) => {
    askConfirm(`Are you sure you want to delete the candidate "${c.name}"?`, async () => {
      closeConfirm();
      try {
        await recruiterApiService.deleteCandidate(c.id);
        toast.success("Candidate deleted successfully");
        load();
      } catch (e) {
        toast.error(e.response?.data?.message || "Failed to delete candidate");
      }
    });
  };

  const selectedCandidates = selected.map((id) => selectedCandidatesMap[id]).filter(Boolean);
  const canSchedule = selectedCandidates.length > 0 && selectedCandidates.every((c) =>
    c.status === "SHORTLISTED" || c.status === "DECLINED"
  );

  return (
    <div>
      <div className="d-flex justify-content-between align-items-end flex-wrap gap-2 mb-3">
        <div className="d-flex align-items-center flex-wrap gap-2">
          <span className="text-muted fs-14">Filter by:</span>
          <button className="btn btn-link fs-14 text-danger p-0 text-decoration-none" onClick={clearFilters}>Clear all</button>
          <select className="form-select form-select-sm" style={{ width: 170 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{getStatusLabel(s)}</option>)}
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
            <button className="btn btn-blue-dark" onClick={() => onScheduleInterviews(selectedCandidates, 1)}>
              Schedule Interview ({selected.length})
            </button>
          )}
          <button className="btn btn-primary" onClick={() => { setEditingCandidate(null); setShowAddModal(true); }}>
            <i className="bi bi-plus-lg" /> Add Candidate
          </button>
          <button className="btn btn-outline-primary" onClick={() => setShowBulkModal(true)}>
            <i className="bi bi-upload" /> Bulk Upload
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
                  {(c.status === "SHORTLISTED" || c.status === "DECLINED") && (
                    <input type="checkbox" className="form-check-input" checked={selected.includes(c.id)} onChange={() => toggleSelect(c)} />
                  )}
                </td>
                <td>{c.name}</td>
                <td>{c.phone}</td>
                <td>{c.email}</td>
                <td><span className={`status-pill ${STATUS_PILL[c.status] || "status-pill-secondary"}`}>{getStatusLabel(c.status, c.interviewRound)}</span></td>
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
                  {(c.status === "DRAFT" || c.status === "ADDED") && (
                    <>
                      <button className="icon-btn-circle me-2" title="Edit Candidate" onClick={() => { setEditingCandidate(c); setShowAddModal(true); }}>
                        <i className="bi bi-pencil" />
                      </button>
                      <button className="icon-btn-circle danger" title="Delete Candidate" onClick={() => handleDelete(c)}>
                        <i className="bi bi-trash" />
                      </button>
                    </>
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
          editingCandidate={editingCandidate}
          onViewFile={filePreview.openFile}
          onClose={() => { setShowAddModal(false); setEditingCandidate(null); }}
          onSaved={() => { setShowAddModal(false); setEditingCandidate(null); load(); }}
          onDocumentsChanged={(updated) => {
            if (updated) setEditingCandidate((prev) => (prev ? { ...prev, ...updated } : prev));
            load();
          }}
        />
      )}

      {showBulkModal && (
        <BulkUploadCandidatesModal
          positionId={positionId}
          onClose={() => setShowBulkModal(false)}
          onImported={(closeModal = true) => {
            if (closeModal) setShowBulkModal(false);
            load();
          }}
        />
      )}

      {profileCandidate && (
        <CandidateProfileModal
          candidate={profileCandidate}
          onClose={() => setProfileCandidate(null)}
          onDecide={handleDecide}
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

      <ConfirmModal
        show={confirmState.show}
        message={confirmState.message}
        onConfirm={confirmState.onConfirm}
        onCancel={closeConfirm}
      />
    </div>
  );
};

export default CandidatePoolTab;

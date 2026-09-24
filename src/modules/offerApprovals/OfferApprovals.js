import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import recruiterApiService from "../../core/recruiterApiService";
import Pagination from "../../shared/Pagination";
import PdfViewerModal from "../../shared/PdfViewerModal";
import { useFilePreview } from "../../shared/useFilePreview";

const STATUS_BADGE = {
  L1_PENDING: "warning",
  L2_PENDING: "warning",
  SENT: "success",
  L1_REJECTED: "danger",
  L2_REJECTED: "danger",
};

// Statuses an approver can ever see, per level - drives the status filter dropdown.
const L1_STATUS_OPTIONS = ["L1_PENDING", "L2_PENDING", "SENT", "L1_REJECTED", "L2_REJECTED"];
const L2_STATUS_OPTIONS = ["L2_PENDING", "SENT", "L2_REJECTED"];

/** SCL_53-style "09-09-2026 12.45pm" from ISO datetime. */
const formatApprovalDateTime = (iso) => {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12 || 12;
  return `${dd}-${mm}-${yyyy} ${hours}.${minutes}${ampm}`;
};

/**
 * Offer Letter approval (Section 12/16 of the requirements doc) - the second of
 * the two retained approval flows. Only after L2 approves is the offer letter
 * automatically emailed to the candidate.
 */
const OfferApprovals = () => {
  const privileges = useSelector((state) => state.user.privileges) || {};
  const isL2 = !!privileges.L2Approval;
  const isL1 = !!privileges.L1Approval;
  const level = isL2 ? "L2" : "L1";
  const filePreview = useFilePreview();

  const [offers, setOffers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(false);
  const [acting, setActing] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [historyModal, setHistoryModal] = useState({ show: false, offer: null, rows: [], loading: false });
  const actingRef = useRef(false);

  const openApprovalHistory = async (offer) => {
    setHistoryModal({ show: true, offer, rows: [], loading: true });
    try {
      const res = await recruiterApiService.getOfferApprovalHistory(offer.id);
      setHistoryModal({ show: true, offer, rows: res.data.data || [], loading: false });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load approval history");
      setHistoryModal({ show: true, offer, rows: [], loading: false });
    }
  };

  const closeApprovalHistory = () => setHistoryModal({ show: false, offer: null, rows: [], loading: false });

  const pendingStatus = isL2 ? "L2_PENDING" : "L1_PENDING";
  const statusOptions = isL2 ? L2_STATUS_OPTIONS : L1_STATUS_OPTIONS;

  // Guards against overlapping fetches (e.g. React StrictMode's dev-only double-invoke on mount).
  const loadInFlightRef = useRef(false);
  const load = async (pageArg) => {
    if (loadInFlightRef.current) return;
    loadInFlightRef.current = true;
    setLoading(true);
    try {
      const params = { search: searchText || undefined, status: statusFilter || undefined, page: pageArg ?? page, size };
      const res = await recruiterApiService.getPendingOfferApprovals(params);
      setOffers(res.data.data.content || []);
      setTotalPages(res.data.data.totalPages || 0);
    } catch (e) {
      toast.error("Failed to load offer approvals");
    } finally {
      setLoading(false);
      loadInFlightRef.current = false;
    }
  };

  useEffect(() => {
    load(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size]);

  // Status filter reloads immediately (and jumps back to page 1) on a genuine change - not on mount.
  const prevStatusFilterRef = useRef(statusFilter);
  useEffect(() => {
    if (prevStatusFilterRef.current === statusFilter) return;
    prevStatusFilterRef.current = statusFilter;
    setPage(0);
    load(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  // Search is performed server-side - only reload (and jump back to page 1) on a genuine
  // searchText change, not on mount.
  const prevSearchTextRef = useRef(searchText);
  useEffect(() => {
    if (prevSearchTextRef.current === searchText) return;
    prevSearchTextRef.current = searchText;
    const timeout = setTimeout(() => {
      setPage(0);
      load(0);
    }, 400);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  const toggleSelect = (candidateId) => {
    setSelected((prev) => (prev.includes(candidateId) ? prev.filter((x) => x !== candidateId) : [...prev, candidateId]));
  };

  const actOnSelected = async (approve) => {
    if (selected.length === 0) return;
    if (actingRef.current) return;
    actingRef.current = true;
    setActing(true);
    try {
      await recruiterApiService.approveOrRejectOffers({ candidateIds: selected, approve, comments });
      toast.success(approve ? "Offer(s) approved" : "Offer(s) rejected");
      setSelected([]);
      setComments("");
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Action failed");
    } finally {
      actingRef.current = false;
      setActing(false);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div className="list-card-title-wrap">
          <i className="bi bi-envelope-paper-fill" />
          <span className="list-card-title">Offer Letter Requests</span>
          <span className="list-card-count">({level} Approver)</span>
        </div>
        {selected.length > 0 && (
          <div className="d-flex gap-2 align-items-center">
            <input
              className="form-control"
              placeholder="Comments (optional)"
              style={{ width: 260 }}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            />
            <button className="btn btn-outline-danger" disabled={acting} onClick={() => actOnSelected(false)}>Reject</button>
            <button className="btn btn-outline-success" disabled={acting} onClick={() => actOnSelected(true)}>Approve</button>
          </div>
        )}
      </div>

      <div className="d-flex align-items-center flex-wrap gap-2 mb-3">
        <div className="search-boxpost">
          <i className="bi bi-search" />
          <input
            className="form-control form-control-sm"
            placeholder="Search candidates..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
        <select className="form-select form-select-sm" style={{ width: 180 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          {statusOptions.map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
          ))}
        </select>
      </div>

      {acting && (
        <div
          className="d-flex align-items-center justify-content-center"
          style={{ position: "fixed", inset: 0, background: "rgba(0, 0, 0, 0.45)", zIndex: 2000 }}
        >
          <div className="d-flex flex-column align-items-center text-white">
            <span className="spinner-border mb-2" role="status" aria-hidden="true" />
            <span>Processing your request...</span>
          </div>
        </div>
      )}

      {loading ? (
        <div>Loading...</div>
      ) : (
        offers.map((offer) => (
          <div className="card mb-2" key={offer.id}>
            <div className="card-body d-flex align-items-start gap-2">
              {(isL1 || isL2) && (
                <input
                  type="checkbox"
                  className="form-check-input mt-1"
                  checked={selected.includes(offer.candidateId)}
                  disabled={offer.status !== pendingStatus}
                  onChange={() => toggleSelect(offer.candidateId)}
                />
              )}
              <div className="flex-grow-1">
                <span className={`badge bg-${STATUS_BADGE[offer.status] || "secondary"} me-2`}>{offer.status.replace(/_/g, " ")}</span>
                <span className="fw-bold">{offer.candidateName}</span>
                {offer.positionTitleName && <span className="text-muted"> — {offer.positionTitleName}</span>}
                <button
                  type="button"
                  className="btn btn-link p-0 lh-1 history-icon-btn ms-2"
                  title="Approval History"
                  onClick={() => openApprovalHistory(offer)}
                >
                  <i className="bi bi-clock-history" />
                </button>
                <div className="text-muted small mt-1">
                  Accept Before: {offer.acceptBeforeDate} | Joining Date: {offer.joiningDate || "-"}
                </div>
                {offer.approvalComments && <div className="text-muted small">Last comments: {offer.approvalComments}</div>}
              </div>
              {offer.offerFileUrl && (
                <button
                  type="button"
                  className="icon-btn-circle"
                  title="View Offer Letter"
                  onClick={() => filePreview.openFile(offer.offerFileUrl, "Offer Letter Preview")}
                >
                  <i className="bi bi-file-earmark-pdf" />
                </button>
              )}
            </div>
          </div>
        ))
      )}
      {!loading && offers.length === 0 && (
        <div className="text-center text-muted py-5">No offer letters in your approval queue.</div>
      )}

      {!loading && offers.length > 0 && (
        <Pagination page={page} totalPages={totalPages} onChange={setPage} size={size} onSizeChange={(s) => { setSize(s); setPage(0); }} />
      )}

      <PdfViewerModal
        show={filePreview.show}
        onHide={filePreview.close}
        fileUrl={filePreview.fileUrl}
        fileExtension={filePreview.fileExtension}
        loading={filePreview.loading}
        title={filePreview.title}
      />

      {historyModal.show && (
        <div className="modal show d-block" style={{ background: "rgba(0, 0, 0, 0.45)" }} onClick={closeApprovalHistory}>
          <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <div>
                  <h5 className="modal-title mb-0">Approval History</h5>
                  <div className="text-muted fs-13">
                    Track approvals and decisions
                    {historyModal.offer ? ` — ${historyModal.offer.candidateName}` : ""}
                  </div>
                </div>
                <button type="button" className="btn-close" onClick={closeApprovalHistory} />
              </div>
              <div className="modal-body">
                {historyModal.loading ? (
                  <div className="text-muted">Loading...</div>
                ) : historyModal.rows.length === 0 ? (
                  <div className="text-muted text-center py-4">No approval history yet for this offer.</div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-bordered align-middle mb-0 approval-history-table">
                      <thead>
                        <tr>
                          <th>Approver</th>
                          <th>Approval Date</th>
                          <th>Status</th>
                          <th>Comments</th>
                        </tr>
                      </thead>
                      <tbody>
                        {historyModal.rows.map((row) => (
                          <tr key={row.id}>
                            <td>{row.approverName || "-"}</td>
                            <td>{formatApprovalDateTime(row.approvalDate)}</td>
                            <td>{(row.status || "").replace(/_/g, " ")}</td>
                            <td>{row.comments?.trim() ? row.comments : "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeApprovalHistory}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfferApprovals;

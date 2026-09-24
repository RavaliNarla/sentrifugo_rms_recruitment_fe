import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import recruiterApiService from "../../core/recruiterApiService";
import ConfirmModal from "../../shared/ConfirmModal";
import Pagination from "../../shared/Pagination";
import { formatDate } from "../../shared/dateFormat";
import "./JobPostings.css";

const STATUS_PILL = {
  NEW: "status-pill-secondary",
  L1_PENDING: "status-pill-warning",
  L2_PENDING: "status-pill-warning",
  APPROVED: "status-pill-success",
  L1_REJECTED: "status-pill-danger",
  L2_REJECTED: "status-pill-danger",
  FULFILLED: "status-pill-info",
};

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "NEW", label: "New" },
  { value: "L1_PENDING", label: "L1 Pending" },
  { value: "L2_PENDING", label: "L2 Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "L1_REJECTED", label: "L1 Rejected" },
  { value: "L2_REJECTED", label: "L2 Rejected" },
  { value: "FULFILLED", label: "Fulfilled" },
];

const MONTH_OPTIONS = [
  { value: "", label: "All Months" },
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

/** SCL_53: BOB-style "09-09-2026 12.45pm" from ISO datetime. */
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

const JobPostings = () => {
  const navigate = useNavigate();
  const [requisitions, setRequisitions] = useState([]);
  const [positionsByReq, setPositionsByReq] = useState({});
  const [expanded, setExpanded] = useState({});
  const [historyModal, setHistoryModal] = useState({ show: false, requisition: null, rows: [], loading: false });
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [customYearFrom, setCustomYearFrom] = useState("");
  const [customYearTo, setCustomYearTo] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [jobTitleFilter, setJobTitleFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [filterOptions, setFilterOptions] = useState({ years: [], jobTitles: [], departments: [], locations: [] });
  const [confirmState, setConfirmState] = useState({ show: false, message: "", onConfirm: null });

  const askConfirm = (message, action) => setConfirmState({ show: true, message, onConfirm: action });
  const closeConfirm = () => setConfirmState({ show: false, message: "", onConfirm: null });

  useEffect(() => {
    recruiterApiService.getRequisitionFilterOptions()
      .then((res) => setFilterOptions(res.data.data || { years: [], jobTitles: [], departments: [], locations: [] }))
      .catch(() => toast.error("Failed to load filter options"));
  }, []);

  // Guards against overlapping fetches (e.g. React StrictMode's dev-only double-invoke on mount).
  const loadInFlightRef = useRef(false);
  const loadRequisitions = async (pageArg) => {
    if (loadInFlightRef.current) return;
    loadInFlightRef.current = true;
    setLoading(true);
    try {
      const params = {
        search: searchText || undefined,
        status: statusFilter || undefined,
        jobTitle: jobTitleFilter || undefined,
        department: departmentFilter || undefined,
        location: locationFilter || undefined,
        page: pageArg ?? page,
        size,
      };
      if (yearFilter === "CUSTOM") {
        if (customYearFrom) params.yearFrom = customYearFrom;
        if (customYearTo) params.yearTo = customYearTo;
      } else if (yearFilter) {
        params.yearFrom = yearFilter;
        params.yearTo = yearFilter;
        if (monthFilter) params.month = monthFilter;
      }

      const res = await recruiterApiService.searchRequisitions(params);
      const content = res.data.data.content || [];
      setRequisitions(content);
      setTotalPages(res.data.data.totalPages || 0);

      const positionResults = await Promise.all(
        content.map((req) =>
          recruiterApiService.getPositionsByRequisition(req.id).then((r) => [req.id, r.data.data]).catch(() => [req.id, []])
        )
      );
      const map = {};
      positionResults.forEach(([id, positions]) => { map[id] = positions; });
      setPositionsByReq(map);
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to load requisitions");
    } finally {
      setLoading(false);
      loadInFlightRef.current = false;
    }
  };

  useEffect(() => {
    loadRequisitions(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size]);

  // Dropdown filters reload immediately (and jump back to page 1) on a genuine change - not on mount.
  const filterKey = JSON.stringify({ statusFilter, yearFilter, customYearFrom, customYearTo, monthFilter, jobTitleFilter, departmentFilter, locationFilter });
  const prevFilterKeyRef = useRef(filterKey);
  useEffect(() => {
    if (prevFilterKeyRef.current === filterKey) return;
    prevFilterKeyRef.current = filterKey;
    setPage(0);
    loadRequisitions(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey]);

  // Search is performed server-side - only reload (and jump back to page 1) on a genuine
  // searchText change, not on mount.
  const prevSearchTextRef = useRef(searchText);
  useEffect(() => {
    if (prevSearchTextRef.current === searchText) return;
    prevSearchTextRef.current = searchText;
    const timeout = setTimeout(() => {
      setPage(0);
      loadRequisitions(0);
    }, 400);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  const toggleExpand = (requisitionId) => {
    setExpanded((prev) => ({ ...prev, [requisitionId]: !prev[requisitionId] }));
  };

  const toggleSelect = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleSubmit = () => {
    if (selected.length === 0) return;
    askConfirm(`Are you sure you want to submit ${selected.length} requisition(s) for approval?`, async () => {
      closeConfirm();
      setSubmitting(true);
      try {
        await recruiterApiService.submitForApproval(selected);
        toast.success("Requisition(s) submitted for approval");
        setSelected([]);
        await loadRequisitions();
      } catch (e) {
        toast.error(e.response?.data?.message || "Submit failed");
      } finally {
        setSubmitting(false);
      }
    });
  };

  const handleFulfil = (id) => {
    askConfirm("Are you sure you want to mark this requisition as fulfilled?", async () => {
      closeConfirm();
      try {
        await recruiterApiService.markFulfilled(id);
        toast.success("Requisition marked as fulfilled");
        loadRequisitions();
      } catch (e) {
        toast.error(e.response?.data?.message || "Action failed");
      }
    });
  };

  const handleUnfulfil = (id) => {
    askConfirm("Are you sure you want to reopen this requisition (undo Mark Fulfilled)?", async () => {
      closeConfirm();
      try {
        await recruiterApiService.unmarkFulfilled(id);
        toast.success("Requisition reopened");
        loadRequisitions();
      } catch (e) {
        toast.error(e.response?.data?.message || "Action failed");
      }
    });
  };

  // SCL_12: Edit/Delete for a requisition - Delete only while status = NEW (not yet submitted/approved).
  const handleDeleteRequisition = (req) => {
    askConfirm(`Are you sure you want to delete the requisition "${req.title}"?`, async () => {
      closeConfirm();
      try {
        await recruiterApiService.deleteRequisition(req.id);
        toast.success("Requisition deleted successfully");
        loadRequisitions();
      } catch (e) {
        toast.error(e.response?.data?.message || "Failed to delete requisition");
      }
    });
  };

  const openApprovalHistory = async (req, e) => {
    e.stopPropagation();
    setHistoryModal({ show: true, requisition: req, rows: [], loading: true });
    try {
      const res = await recruiterApiService.getRequisitionApprovalHistory(req.id);
      setHistoryModal({ show: true, requisition: req, rows: res.data.data || [], loading: false });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load approval history");
      setHistoryModal({ show: true, requisition: req, rows: [], loading: false });
    }
  };

  const closeApprovalHistory = () => setHistoryModal({ show: false, requisition: null, rows: [], loading: false });

  // SCL_13: Delete only for positions still in NEW status (parent requisition not yet approved).
  const handleDeletePosition = (pos, requisitionId) => {
    askConfirm(`Are you sure you want to delete the position "${pos.positionTitleName}"?`, async () => {
      closeConfirm();
      try {
        await recruiterApiService.deletePosition(pos.id);
        toast.success("Position deleted successfully");
        const r = await recruiterApiService.getPositionsByRequisition(requisitionId);
        setPositionsByReq((prev) => ({ ...prev, [requisitionId]: r.data.data || [] }));
      } catch (e) {
        toast.error(e.response?.data?.message || "Failed to delete position");
      }
    });
  };

  const years = filterOptions.years || [];
  const jobTitles = filterOptions.jobTitles || [];
  const departments = filterOptions.departments || [];
  const locations = filterOptions.locations || [];

  const clearFilters = () => {
    setSearchText("");
    setStatusFilter("");
    setYearFilter("");
    setCustomYearFrom("");
    setCustomYearTo("");
    setMonthFilter("");
    setJobTitleFilter("");
    setDepartmentFilter("");
    setLocationFilter("");
  };

  const hasActiveFilters =
    searchText || statusFilter || yearFilter || monthFilter || jobTitleFilter || departmentFilter || locationFilter;

  const selectableStatuses = ["NEW", "L1_REJECTED", "L2_REJECTED"];

  return (
    <div className="job-postings-page">
      <div className="d-flex justify-content-end align-items-center mb-3">
        <button className="btn btn-primary" onClick={() => navigate("/job-postings/create-requisition")}>
          <i className="bi bi-plus-lg me-1" /> Create New Requisition
        </button>
      </div>

      <div className="row filters-row g-2 mb-3 align-items-center">
        <div className="col-lg-auto col-md-4">
          <select
            className="form-select filter-pill"
            value={yearFilter}
            onChange={(e) => {
              const val = e.target.value;
              setYearFilter(val);
              setCustomYearFrom("");
              setCustomYearTo("");
              if (val === "CUSTOM") setMonthFilter("");
            }}
          >
            <option value="">All Years</option>
            {years.map((y) => <option key={y} value={y}>{`Year - ${y}`}</option>)}
            <option value="CUSTOM">Custom Range…</option>
          </select>
        </div>
        {yearFilter === "CUSTOM" && (
          <>
            <div className="col-lg-auto col-md-4">
              <input
                type="number"
                className="form-control filter-pill filter-pill-year"
                placeholder="From year"
                value={customYearFrom}
                onChange={(e) => setCustomYearFrom(e.target.value)}
              />
            </div>
            <div className="col-lg-auto col-md-4">
              <input
                type="number"
                className="form-control filter-pill filter-pill-year"
                placeholder="To year"
                value={customYearTo}
                onChange={(e) => setCustomYearTo(e.target.value)}
              />
            </div>
          </>
        )}
        <div className="col-lg-auto col-md-4">
          <select
            className="form-select filter-pill"
            value={monthFilter}
            disabled={yearFilter === "CUSTOM"}
            onChange={(e) => setMonthFilter(e.target.value)}
          >
            {MONTH_OPTIONS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>
        <div className="col-lg col-md-4">
          <div className="search-boxpost">
            <i className="bi bi-search" />
            <input
              className="form-control filter-pill"
              placeholder="Search requisitions by id, title"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
        </div>
        <div className="col-lg-auto col-md-4">
          <select
            className="form-select filter-pill"
            value={jobTitleFilter}
            onChange={(e) => setJobTitleFilter(e.target.value)}
          >
            <option value="">All Job Titles</option>
            {jobTitles.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="col-lg-auto col-md-4">
          <select
            className="form-select filter-pill"
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
          >
            <option value="">All Departments</option>
            {departments.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="col-lg-auto col-md-4">
          <select
            className="form-select filter-pill"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          >
            <option value="">All Locations</option>
            {locations.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div className="col-lg-auto col-md-4">
          <select className="form-select filter-pill" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
        {hasActiveFilters && (
          <div className="col-lg-auto col-md-4">
            <button type="button" className="btn btn-outline-secondary filter-pill" onClick={clearFilters}>
              <i className="bi bi-x-lg me-1" /> Clear Filters
            </button>
          </div>
        )}
      </div>

      {selected.length > 0 && (
        <div className="bulk-actions-bar">
          <button className="btn btn-blue-dark" onClick={handleSubmit} disabled={submitting}>
            <i className="bi bi-send me-1" /> Submit for Approval ({selected.length})
          </button>
        </div>
      )}

      {submitting && (
        <div
          className="d-flex align-items-center justify-content-center"
          style={{ position: "fixed", inset: 0, background: "rgba(0, 0, 0, 0.45)", zIndex: 2000 }}
        >
          <div className="d-flex flex-column align-items-center text-white">
            <span className="spinner-border mb-2" role="status" aria-hidden="true" />
            <span>Submitting for approval...</span>
          </div>
        </div>
      )}

      {loading ? (
        <div>Loading...</div>
      ) : (
        requisitions.map((req) => {
          const positions = positionsByReq[req.id] || [];
          const departmentCount = new Set(positions.map((p) => p.departmentName)).size;
          const vacancyCount = positions.reduce((sum, p) => sum + (p.vacancies || 0), 0);
          const positionsGroupedByDept = positions.reduce((acc, pos) => {
            const key = pos.departmentName || "Unassigned";
            if (!acc[key]) acc[key] = [];
            acc[key].push(pos);
            return acc;
          }, {});

          return (
            <div className="requisition-card" key={req.id}>
              <div className="d-flex justify-content-between align-items-start" style={{ cursor: "pointer" }} onClick={() => toggleExpand(req.id)}>
                <div className="d-flex align-items-start gap-2">
                  <input
                    type="checkbox"
                    className="form-check-input mt-1"
                    checked={selected.includes(req.id)}
                    disabled={!selectableStatuses.includes(req.status)}
                    onClick={(e) => e.stopPropagation()}
                    onChange={() => toggleSelect(req.id)}
                  />
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <span className="badge bg-light text-dark border">{req.requisitionCode}</span>
                      <span className={`status-pill ${STATUS_PILL[req.status] || "status-pill-secondary"}`}>
                        {req.status === "FULFILLED" ? "Fulfilled" : req.status.replace(/_/g, " ")}
                      </span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <div className="req-code">{req.title}</div>
                      <button
                        type="button"
                        className="btn btn-link p-0 lh-1 history-icon-btn"
                        title="Approval History"
                        onClick={(e) => openApprovalHistory(req, e)}
                      >
                        <i className="bi bi-clock-history" />
                      </button>
                    </div>
                    <div className="req-dates">
                      <span><i className="bi bi-calendar-event" />Start: {formatDate(req.startDate)}</span>
                      <span><i className="bi bi-calendar-check" />Expected Fulfilment: {formatDate(req.expectedFulfilmentDate)}</span>
                    </div>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-3">
                  <div className="req-meta d-none d-md-flex me-3">
                    <span><i className="bi bi-diagram-3" />Departments - {departmentCount}</span>
                    <span><i className="bi bi-briefcase" />Positions - {positions.length}</span>
                    <span><i className="bi bi-people" />Vacancies - {vacancyCount}</span>
                  </div>

                  {selectableStatuses.includes(req.status) && (
                    <button
                      className="icon-btn-circle"
                      title="Add Position"
                      onClick={(e) => { e.stopPropagation(); navigate(`/job-postings/${req.id}/add-position`); }}
                    >
                      <i className="bi bi-plus-lg" />
                    </button>
                  )}
                  {req.status === "APPROVED" && (
                    <button className="btn btn-sm btn-blue-dark" onClick={(e) => { e.stopPropagation(); handleFulfil(req.id); }}>
                      Mark Fulfilled
                    </button>
                  )}
                  {req.status === "FULFILLED" && (
                    <button className="btn btn-sm btn-outline-secondary" onClick={(e) => { e.stopPropagation(); handleUnfulfil(req.id); }}>
                      Undo Fulfilled
                    </button>
                  )}
                  {selectableStatuses.includes(req.status) && (
                    <button
                      className="icon-btn-circle"
                      title="Edit Requisition"
                      onClick={(e) => { e.stopPropagation(); navigate("/job-postings/create-requisition", { state: { requisition: req } }); }}
                    >
                      <i className="bi bi-pencil" />
                    </button>
                  )}
                  {req.status !== "NEW" && (
                    <button
                      className="icon-btn-circle"
                      title="View Requisition"
                      onClick={(e) => { e.stopPropagation(); navigate("/job-postings/create-requisition", { state: { requisition: req, viewOnly: true } }); }}
                    >
                      <i className="bi bi-eye" />
                    </button>
                  )}
                  {req.status === "NEW" && (
                    <button
                      className="icon-btn-circle danger"
                      title="Delete Requisition"
                      onClick={(e) => { e.stopPropagation(); handleDeleteRequisition(req); }}
                    >
                      <i className="bi bi-trash" />
                    </button>
                  )}
                  <button className="icon-btn-circle" onClick={(e) => { e.stopPropagation(); toggleExpand(req.id); }}>
                    <i className={`bi bi-chevron-${expanded[req.id] ? "up" : "down"}`} />
                  </button>
                </div>
              </div>

              {expanded[req.id] && (
                <div className="mt-3 pt-3 border-top">
                  {Object.keys(positionsGroupedByDept).length === 0 && (
                    <div className="text-muted">No positions added yet.</div>
                  )}
                  {Object.entries(positionsGroupedByDept).map(([deptName, deptPositions]) => (
                    <div className="department-card" key={deptName}>
                      <div className="department-header d-flex align-items-center gap-2">
                        <i className="bi bi-diagram-3" /> {deptName}
                        <span className="badge bg-white text-dark ms-2">{deptPositions.length} position{deptPositions.length !== 1 ? "s" : ""}</span>
                      </div>
                      {deptPositions.map((pos) => {
                        const canEditPosition = selectableStatuses.includes(req.status);
                        return (
                          <div className="position-card-inner" key={pos.id}>
                            <div className="position-row">
                              <div className="position-row-main">
                                <div className="position-title">{pos.positionTitleName}</div>
                                <div className="position-meta-inline">
                                  <span><b>Location:</b> {pos.locationName}</span>
                                  <span><b>Vacancies:</b> {pos.vacancies}</span>
                                  <span><b>Experience:</b> {pos.experienceYears ?? "-"} yrs</span>
                                  <span><b>Education:</b> {pos.educationQualificationName || "-"}</span>
                                </div>
                              </div>
                              {/* Always reserve this actions column so icons don't jump/disappear on layout or status changes */}
                              <div className="position-actions" onClick={(e) => e.stopPropagation()}>
                                {canEditPosition ? (
                                  <button
                                    type="button"
                                    className="icon-btn-circle"
                                    title="Edit Position"
                                    onClick={() => navigate(`/job-postings/${req.id}/add-position`, { state: { position: pos } })}
                                  >
                                    <i className="bi bi-pencil" />
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    className="icon-btn-circle"
                                    title="View Position"
                                    onClick={() => navigate(`/job-postings/${req.id}/add-position`, { state: { position: pos, viewOnly: true } })}
                                  >
                                    <i className="bi bi-eye" />
                                  </button>
                                )}
                                {req.status === "NEW" && (
                                  <button
                                    type="button"
                                    className="icon-btn-circle danger"
                                    title="Delete Position"
                                    onClick={() => handleDeletePosition(pos, req.id)}
                                  >
                                    <i className="bi bi-trash" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })
      )}
      {!loading && requisitions.length === 0 && (
        <div className="text-center text-muted py-5">
          No requisitions found. <Link to="/job-postings/create-requisition">Create one</Link>.
        </div>
      )}

      {!loading && requisitions.length > 0 && (
        <Pagination page={page} totalPages={totalPages} onChange={setPage} size={size} onSizeChange={(s) => { setSize(s); setPage(0); }} />
      )}

      <ConfirmModal
        show={confirmState.show}
        message={confirmState.message}
        onConfirm={confirmState.onConfirm}
        onCancel={closeConfirm}
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
                    {historyModal.requisition ? ` — ${historyModal.requisition.requisitionCode}` : ""}
                  </div>
                </div>
                <button type="button" className="btn-close" onClick={closeApprovalHistory} />
              </div>
              <div className="modal-body">
                {historyModal.loading ? (
                  <div className="text-muted">Loading...</div>
                ) : historyModal.rows.length === 0 ? (
                  <div className="text-muted text-center py-4">No approval history yet for this requisition.</div>
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

export default JobPostings;

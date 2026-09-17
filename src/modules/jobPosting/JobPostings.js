import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import recruiterApiService from "../../core/recruiterApiService";
import ConfirmModal from "../../shared/ConfirmModal";
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

const JobPostings = () => {
  const navigate = useNavigate();
  const [requisitions, setRequisitions] = useState([]);
  const [positionsByReq, setPositionsByReq] = useState({});
  const [expanded, setExpanded] = useState({});
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [customYearFrom, setCustomYearFrom] = useState("");
  const [customYearTo, setCustomYearTo] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [jobTitleFilter, setJobTitleFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [confirmState, setConfirmState] = useState({ show: false, message: "", onConfirm: null });

  const askConfirm = (message, action) => setConfirmState({ show: true, message, onConfirm: action });
  const closeConfirm = () => setConfirmState({ show: false, message: "", onConfirm: null });

  const loadRequisitions = async () => {
    setLoading(true);
    try {
      const res = await recruiterApiService.getRequisitions(0, 1000);
      const content = res.data.data.content || [];
      setRequisitions(content);

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
    }
  };

  useEffect(() => {
    loadRequisitions();
  }, []);

  const toggleExpand = (requisitionId) => {
    setExpanded((prev) => ({ ...prev, [requisitionId]: !prev[requisitionId] }));
  };

  const toggleSelect = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleSubmit = () => {
    if (selected.length === 0) return;
    askConfirm(`Submit ${selected.length} requisition(s) for approval?`, async () => {
      closeConfirm();
      try {
        await recruiterApiService.submitForApproval(selected);
        toast.success("Requisition(s) submitted for approval");
        setSelected([]);
        loadRequisitions();
      } catch (e) {
        toast.error(e.response?.data?.message || "Submit failed");
      }
    });
  };

  const handleFulfil = (id) => {
    askConfirm("Mark this requisition as fulfilled?", async () => {
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

  const handleUnfulfil = async (id) => {
    if (!window.confirm("Reopen this requisition (undo Mark Fulfilled)?")) return;
    try {
      await recruiterApiService.unmarkFulfilled(id);
      toast.success("Requisition reopened");
      loadRequisitions();
    } catch (e) {
      toast.error(e.response?.data?.message || "Action failed");
    }
  };

  // SCL_12: Edit/Delete for a requisition - Delete only while status = NEW (not yet submitted/approved).
  const handleDeleteRequisition = async (req) => {
    if (!window.confirm(`Delete requisition "${req.title}"? This cannot be undone.`)) return;
    try {
      await recruiterApiService.deleteRequisition(req.id);
      toast.success("Requisition deleted successfully");
      loadRequisitions();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to delete requisition");
    }
  };

  // SCL_13: Delete only for positions still in NEW status (parent requisition not yet approved).
  const handleDeletePosition = async (pos, requisitionId) => {
    if (!window.confirm(`Delete position "${pos.positionTitleName}"? This cannot be undone.`)) return;
    try {
      await recruiterApiService.deletePosition(pos.id);
      toast.success("Position deleted successfully");
      const r = await recruiterApiService.getPositionsByRequisition(requisitionId);
      setPositionsByReq((prev) => ({ ...prev, [requisitionId]: r.data.data || [] }));
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to delete position");
    }
  };

  const years = Array.from(
    new Set(requisitions.filter((r) => r.startDate).map((r) => r.startDate.slice(0, 4)))
  ).sort((a, b) => b.localeCompare(a));

  const allPositions = Object.values(positionsByReq).flat();
  const jobTitles = Array.from(new Set(allPositions.map((p) => p.positionTitleName).filter(Boolean))).sort();
  const departments = Array.from(new Set(allPositions.map((p) => p.departmentName).filter(Boolean))).sort();
  const locations = Array.from(new Set(allPositions.map((p) => p.locationName).filter(Boolean))).sort();

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

  const filteredRequisitions = requisitions.filter((req) => {
    if (statusFilter && req.status !== statusFilter) return false;
    if (searchText) {
      const haystack = `${req.requisitionCode} ${req.title}`.toLowerCase();
      if (!haystack.includes(searchText.toLowerCase())) return false;
    }
    if (yearFilter === "CUSTOM") {
      const reqYear = req.startDate ? parseInt(req.startDate.slice(0, 4), 10) : null;
      const from = customYearFrom ? parseInt(customYearFrom, 10) : null;
      const to = customYearTo ? parseInt(customYearTo, 10) : null;
      if (from && (!reqYear || reqYear < from)) return false;
      if (to && (!reqYear || reqYear > to)) return false;
    } else if (yearFilter) {
      if (!req.startDate || req.startDate.slice(0, 4) !== yearFilter) return false;
    }

    if (monthFilter) {
      const reqMonth = req.startDate ? String(parseInt(req.startDate.slice(5, 7), 10)) : null;
      if (reqMonth !== monthFilter) return false;
    }

    if (jobTitleFilter || departmentFilter || locationFilter) {
      const positions = positionsByReq[req.id] || [];
      if (jobTitleFilter && !positions.some((p) => p.positionTitleName === jobTitleFilter)) return false;
      if (departmentFilter && !positions.some((p) => p.departmentName === departmentFilter)) return false;
      if (locationFilter && !positions.some((p) => p.locationName === locationFilter)) return false;
    }

    return true;
  });

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
            onChange={(e) => { setYearFilter(e.target.value); setCustomYearFrom(""); setCustomYearTo(""); }}
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
          <select className="form-select filter-pill" value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)}>
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
          <button className="btn btn-blue-dark" onClick={handleSubmit}>
            <i className="bi bi-send me-1" /> Submit for Approval ({selected.length})
          </button>
        </div>
      )}

      {loading ? (
        <div>Loading...</div>
      ) : (
        filteredRequisitions.map((req) => {
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
                    <div className="req-code">{req.title}</div>
                    <div className="req-dates">
                      <span><i className="bi bi-calendar-event" />Start: {formatDate(req.startDate)}</span>
                      <span><i className="bi bi-calendar-check" />Expected Fulfilment: {formatDate(req.expectedFulfilmentDate)}</span>
                    </div>
                    {req.comments && <div className="text-muted fs-13 mt-1">Comments: {req.comments}</div>}
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
                                {pos.status === "NEW" && (
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
      {!loading && filteredRequisitions.length === 0 && (
        <div className="text-center text-muted py-5">
          No requisitions found. <Link to="/job-postings/create-requisition">Create one</Link>.
        </div>
      )}

      <ConfirmModal
        show={confirmState.show}
        message={confirmState.message}
        onConfirm={confirmState.onConfirm}
        onCancel={closeConfirm}
      />
    </div>
  );
};

export default JobPostings;

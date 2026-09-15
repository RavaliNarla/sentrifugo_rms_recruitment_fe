import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import recruiterApiService from "../../core/recruiterApiService";
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

const JobPostings = () => {
  const navigate = useNavigate();
  const [requisitions, setRequisitions] = useState([]);
  const [positionsByReq, setPositionsByReq] = useState({});
  const [expanded, setExpanded] = useState({});
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const loadRequisitions = async () => {
    setLoading(true);
    try {
      const res = await recruiterApiService.getRequisitions(0, 50);
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

  const handleSubmit = async () => {
    if (selected.length === 0) return;
    if (!window.confirm(`Submit ${selected.length} requisition(s) for approval?`)) return;
    try {
      await recruiterApiService.submitForApproval(selected);
      toast.success("Requisition(s) submitted for approval");
      setSelected([]);
      loadRequisitions();
    } catch (e) {
      toast.error(e.response?.data?.message || "Submit failed");
    }
  };

  const handleFulfil = async (id) => {
    if (!window.confirm("Mark this requisition as fulfilled?")) return;
    try {
      await recruiterApiService.markFulfilled(id);
      toast.success("Requisition marked as fulfilled");
      loadRequisitions();
    } catch (e) {
      toast.error(e.response?.data?.message || "Action failed");
    }
  };

  const filteredRequisitions = requisitions.filter((req) => {
    if (statusFilter && req.status !== statusFilter) return false;
    if (searchText) {
      const haystack = `${req.requisitionCode} ${req.title}`.toLowerCase();
      if (!haystack.includes(searchText.toLowerCase())) return false;
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

      <div className="row filters-row g-2 mb-3">
        <div className="col-md-6">
          <div className="search-boxpost">
            <i className="bi bi-search" />
            <input
              className="form-control"
              placeholder="Search requisitions by id, title"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-3">
          <select className="form-select" style={{ height: 42 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>

      <div className="bulk-actions-bar">
        <span className="fs-14 text-muted">Select requisitions in NEW/REJECTED status to submit for approval</span>
        {selected.length > 0 && (
          <button className="btn btn-blue-dark" onClick={handleSubmit}>
            <i className="bi bi-send me-1" /> Submit for Approval ({selected.length})
          </button>
        )}
      </div>

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
                  {selectableStatuses.includes(req.status) && (
                    <input
                      type="checkbox"
                      className="form-check-input mt-1"
                      checked={selected.includes(req.id)}
                      onClick={(e) => e.stopPropagation()}
                      onChange={() => toggleSelect(req.id)}
                    />
                  )}
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <span className="badge bg-light text-dark border">{req.requisitionCode}</span>
                      <span className={`status-pill ${STATUS_PILL[req.status] || "status-pill-secondary"}`}>
                        {req.status === "FULFILLED" ? "Fulfilled" : req.status.replace(/_/g, " ")}
                      </span>
                    </div>
                    <div className="req-code">{req.title}</div>
                    <div className="req-dates">
                      <span><i className="bi bi-calendar-event" />Start: {req.startDate}</span>
                      <span><i className="bi bi-calendar-check" />Expected Fulfilment: {req.expectedFulfilmentDate}</span>
                    </div>
                    {req.comments && <div className="text-muted fs-13 mt-1">Comments: {req.comments}</div>}
                  </div>
                </div>

                <div className="d-flex align-items-center gap-2">
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
                    <button className="btn btn-sm btn-outline-info" onClick={(e) => { e.stopPropagation(); handleFulfil(req.id); }}>
                      Mark Fulfilled
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
    </div>
  );
};

export default JobPostings;

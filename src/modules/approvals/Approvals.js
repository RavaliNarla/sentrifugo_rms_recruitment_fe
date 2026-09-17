import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import recruiterApiService from "../../core/recruiterApiService";
import { formatDate } from "../../shared/dateFormat";
import "../jobPosting/JobPostings.css";

const STATUS_PILL = {
  NEW: "status-pill-secondary",
  L1_PENDING: "status-pill-warning",
  L2_PENDING: "status-pill-warning",
  APPROVED: "status-pill-success",
  L1_REJECTED: "status-pill-danger",
  L2_REJECTED: "status-pill-danger",
  FULFILLED: "status-pill-info",
};

const Approvals = () => {
  const navigate = useNavigate();
  const privileges = useSelector((state) => state.user.privileges) || {};
  const isL2 = !!privileges.L2Approval;
  const isL1 = !!privileges.L1Approval;
  const level = isL2 ? "L2" : "L1";

  const [requisitions, setRequisitions] = useState([]);
  const [positionsByReq, setPositionsByReq] = useState({});
  const [expanded, setExpanded] = useState({});
  const [selected, setSelected] = useState([]);
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = isL2 ? await recruiterApiService.getL2Requisitions() : await recruiterApiService.getL1Requisitions();
      const content = res.data.data || [];
      setRequisitions(content);

      // SCL_20: position details were not shown under a requisition in the approver's view.
      const positionResults = await Promise.all(
        content.map((req) =>
          recruiterApiService.getPositionsByRequisition(req.id).then((r) => [req.id, r.data.data]).catch(() => [req.id, []])
        )
      );
      const map = {};
      positionResults.forEach(([id, positions]) => { map[id] = positions; });
      setPositionsByReq(map);
    } catch (e) {
      toast.error("Failed to load requisitions for approval");
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (requisitionId) => {
    setExpanded((prev) => ({ ...prev, [requisitionId]: !prev[requisitionId] }));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isL2]);

  const toggleSelect = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const actOnSelected = async (approve) => {
    if (selected.length === 0) return;
    try {
      await recruiterApiService.approveOrReject({ requisitionIds: selected, approve, comments });
      toast.success(approve ? "Requisition(s) approved" : "Requisition(s) rejected");
      setSelected([]);
      setComments("");
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Action failed");
    }
  };

  const pendingStatus = isL2 ? "L2_PENDING" : "L1_PENDING";

  return (
    <div className="job-postings-page">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="list-card-title-wrap">
          <i className="bi bi-check2-square" />
          <span className="list-card-title">Requisition Requests</span>
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
            <button className="btn btn-outline-danger" onClick={() => actOnSelected(false)}>Reject</button>
            <button className="btn btn-outline-success" onClick={() => actOnSelected(true)}>Approve</button>
          </div>
        )}
      </div>

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
                    disabled={req.status !== pendingStatus}
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
                    {req.comments && <div className="text-muted fs-13 mt-1">Last comments: {req.comments}</div>}
                  </div>
                </div>

                <div className="d-flex align-items-center gap-3">
                  <div className="req-meta d-none d-md-flex me-3">
                    <span><i className="bi bi-diagram-3" />Departments - {departmentCount}</span>
                    <span><i className="bi bi-briefcase" />Positions - {positions.length}</span>
                    <span><i className="bi bi-people" />Vacancies - {vacancyCount}</span>
                  </div>

                  <button
                    className="icon-btn-circle"
                    title="View Requisition"
                    onClick={(e) => { e.stopPropagation(); navigate("/job-postings/create-requisition", { state: { requisition: req, viewOnly: true } }); }}
                  >
                    <i className="bi bi-eye" />
                  </button>
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
                      {deptPositions.map((pos) => (
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
                            <div className="position-actions" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                className="icon-btn-circle"
                                title="View Position"
                                onClick={() => navigate(`/job-postings/${req.id}/add-position`, { state: { position: pos, viewOnly: true } })}
                              >
                                <i className="bi bi-eye" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })
      )}
      {!loading && requisitions.length === 0 && (
        <div className="text-center text-muted py-5">No requisitions in your approval queue.</div>
      )}
    </div>
  );
};

export default Approvals;

import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import recruiterApiService from "../../core/recruiterApiService";

const STATUS_BADGE = {
  NEW: "secondary",
  L1_PENDING: "warning",
  L2_PENDING: "warning",
  APPROVED: "success",
  L1_REJECTED: "danger",
  L2_REJECTED: "danger",
  FULFILLED: "info",
};

const JobPostings = () => {
  const navigate = useNavigate();
  const [requisitions, setRequisitions] = useState([]);
  const [positionsByReq, setPositionsByReq] = useState({});
  const [expanded, setExpanded] = useState({});
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadRequisitions = async () => {
    setLoading(true);
    try {
      const res = await recruiterApiService.getRequisitions(0, 50);
      setRequisitions(res.data.data.content || []);
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to load requisitions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequisitions();
  }, []);

  const toggleExpand = async (requisitionId) => {
    setExpanded((prev) => ({ ...prev, [requisitionId]: !prev[requisitionId] }));
    if (!positionsByReq[requisitionId]) {
      try {
        const res = await recruiterApiService.getPositionsByRequisition(requisitionId);
        setPositionsByReq((prev) => ({ ...prev, [requisitionId]: res.data.data }));
      } catch (e) {
        toast.error("Failed to load positions");
      }
    }
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

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="m-0">Job Postings</h4>
        <div>
          {selected.length > 0 && (
            <button className="btn btn-outline-primary me-2" onClick={handleSubmit}>
              Submit for Approval ({selected.length})
            </button>
          )}
          <button className="btn btn-primary" onClick={() => navigate("/job-postings/create-requisition")}>
            <i className="bi bi-plus-lg" /> Create New Requisition
          </button>
        </div>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        requisitions.map((req) => (
          <div className="card mb-3" key={req.id}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start">
                <div className="d-flex align-items-start gap-2">
                  {(req.status === "NEW" || req.status === "L1_REJECTED" || req.status === "L2_REJECTED") && (
                    <input
                      type="checkbox"
                      className="form-check-input mt-1"
                      checked={selected.includes(req.id)}
                      onChange={() => toggleSelect(req.id)}
                    />
                  )}
                  <div>
                    <span className="badge bg-light text-dark me-2">{req.requisitionCode}</span>
                    <span className={`badge bg-${STATUS_BADGE[req.status] || "secondary"} me-2`}>
                      {req.status === "FULFILLED" ? "Fulfilled" : req.status}
                    </span>
                    <span className="fw-bold">{req.title}</span>
                    <div className="text-muted small mt-1">
                      Start: {req.startDate} | Expected Fulfilment: {req.expectedFulfilmentDate}
                    </div>
                    {req.comments && <div className="text-muted small">Comments: {req.comments}</div>}
                  </div>
                </div>
                <div>
                  {(req.status === "NEW" || req.status === "L1_REJECTED" || req.status === "L2_REJECTED") && (
                    <button
                      className="btn btn-sm btn-outline-secondary me-2"
                      onClick={() => navigate(`/job-postings/${req.id}/add-position`)}
                    >
                      <i className="bi bi-plus-lg" /> Add Position
                    </button>
                  )}
                  {req.status === "APPROVED" && (
                    <button className="btn btn-sm btn-outline-info me-2" onClick={() => handleFulfil(req.id)}>
                      Mark Fulfilled
                    </button>
                  )}
                  <button className="btn btn-sm btn-outline-secondary" onClick={() => toggleExpand(req.id)}>
                    <i className={`bi bi-chevron-${expanded[req.id] ? "up" : "down"}`} />
                  </button>
                </div>
              </div>

              {expanded[req.id] && (
                <div className="mt-3 border-top pt-3">
                  {(positionsByReq[req.id] || []).map((pos) => (
                    <div key={pos.id} className="d-flex justify-content-between border-bottom py-2">
                      <div>
                        <b>{pos.positionTitleName}</b> - {pos.departmentName} - {pos.locationName}
                        <div className="text-muted small">
                          {pos.employmentType} | {pos.vacancies} vacancy(ies) | Exp: {pos.experienceYears ?? "-"} yrs | Edu: {pos.educationQualificationName || "-"}
                        </div>
                      </div>
                      {(req.status === "NEW" || req.status === "L1_REJECTED" || req.status === "L2_REJECTED") && (
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => navigate(`/job-postings/${req.id}/add-position`, { state: { position: pos } })}
                        >
                          <i className="bi bi-pencil" />
                        </button>
                      )}
                    </div>
                  ))}
                  {(positionsByReq[req.id] || []).length === 0 && (
                    <div className="text-muted">No positions added yet.</div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))
      )}
      {!loading && requisitions.length === 0 && (
        <div className="text-center text-muted py-5">No requisitions yet. <Link to="/job-postings/create-requisition">Create one</Link>.</div>
      )}
    </div>
  );
};

export default JobPostings;

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import recruiterApiService from "../../core/recruiterApiService";
import { formatDate } from "../../shared/dateFormat";

const STATUS_BADGE = {
  NEW: "secondary",
  L1_PENDING: "warning",
  L2_PENDING: "warning",
  APPROVED: "success",
  L1_REJECTED: "danger",
  L2_REJECTED: "danger",
  FULFILLED: "info",
};

const Approvals = () => {
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
    <div>
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
          return (
          <div className="card mb-2" key={req.id}>
            <div className="card-body d-flex align-items-start gap-2">
              {req.status === pendingStatus && (isL1 || isL2) && (
                <input
                  type="checkbox"
                  className="form-check-input mt-1"
                  checked={selected.includes(req.id)}
                  onChange={() => toggleSelect(req.id)}
                />
              )}
              <div className="flex-grow-1">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <span className="badge bg-light text-dark me-2">{req.requisitionCode}</span>
                    <span className={`badge bg-${STATUS_BADGE[req.status] || "secondary"} me-2`}>{req.status}</span>
                    <span className="fw-bold">{req.title}</span>
                    <div className="text-muted small mt-1">{req.description}</div>
                    <div className="text-muted small">Start: {formatDate(req.startDate)} | Expected Fulfilment: {formatDate(req.expectedFulfilmentDate)}</div>
                    {req.comments && <div className="text-muted small">Last comments: {req.comments}</div>}
                  </div>
                  <button type="button" className="icon-btn-circle" onClick={() => toggleExpand(req.id)}>
                    <i className={`bi bi-chevron-${expanded[req.id] ? "up" : "down"}`} />
                  </button>
                </div>

                {expanded[req.id] && (
                  <div className="mt-2 pt-2 border-top">
                    {positions.length === 0 && <div className="text-muted small">No positions added yet.</div>}
                    {positions.map((pos) => (
                      <div key={pos.id} className="small mb-1">
                        <span className="fw-bold">{pos.positionTitleName}</span>
                        {" — "}
                        <span>{pos.departmentName}</span>
                        {" · "}
                        <span>{pos.locationName}</span>
                        {" · "}
                        <span>Vacancies: {pos.vacancies}</span>
                        {" · "}
                        <span>Experience: {pos.experienceYears ?? "-"} yrs</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
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

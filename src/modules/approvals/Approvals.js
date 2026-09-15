import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
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

const Approvals = () => {
  const privileges = useSelector((state) => state.user.privileges) || {};
  const isL2 = !!privileges.L2Approval;
  const isL1 = !!privileges.L1Approval;
  const level = isL2 ? "L2" : "L1";

  const [requisitions, setRequisitions] = useState([]);
  const [selected, setSelected] = useState([]);
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = isL2 ? await recruiterApiService.getL2Requisitions() : await recruiterApiService.getL1Requisitions();
      setRequisitions(res.data.data || []);
    } catch (e) {
      toast.error("Failed to load requisitions for approval");
    } finally {
      setLoading(false);
    }
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
        <div>
          <h5 className="page-title m-0">Requisition Requests</h5>
          <span className="page-subtitle">Review and approve or reject requisition requests ({level} Approver)</span>
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
        requisitions.map((req) => (
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
              <div>
                <span className="badge bg-light text-dark me-2">{req.requisitionCode}</span>
                <span className={`badge bg-${STATUS_BADGE[req.status] || "secondary"} me-2`}>{req.status}</span>
                <span className="fw-bold">{req.title}</span>
                <div className="text-muted small mt-1">{req.description}</div>
                <div className="text-muted small">Start: {req.startDate} | Expected Fulfilment: {req.expectedFulfilmentDate}</div>
                {req.comments && <div className="text-muted small">Last comments: {req.comments}</div>}
              </div>
            </div>
          </div>
        ))
      )}
      {!loading && requisitions.length === 0 && (
        <div className="text-center text-muted py-5">No requisitions in your approval queue.</div>
      )}
    </div>
  );
};

export default Approvals;

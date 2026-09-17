import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import recruiterApiService from "../../core/recruiterApiService";
import PdfViewerModal from "../../shared/PdfViewerModal";
import { useFilePreview } from "../../shared/useFilePreview";

const STATUS_BADGE = {
  L1_PENDING: "warning",
  L2_PENDING: "warning",
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
  const actingRef = useRef(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await recruiterApiService.getPendingOfferApprovals();
      setOffers(res.data.data || []);
    } catch (e) {
      toast.error("Failed to load offer approvals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      <div className="d-flex justify-content-between align-items-center mb-3">
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

      {acting && (
        <div
          className="d-flex align-items-center justify-content-center"
          style={{ position: "fixed", inset: 0, background: "rgba(15,60,30,0.45)", zIndex: 2000 }}
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
                  onChange={() => toggleSelect(offer.candidateId)}
                />
              )}
              <div className="flex-grow-1">
                <span className={`badge bg-${STATUS_BADGE[offer.status] || "secondary"} me-2`}>{offer.status.replace(/_/g, " ")}</span>
                <span className="fw-bold">{offer.candidateName}</span>
                {offer.positionTitleName && <span className="text-muted"> — {offer.positionTitleName}</span>}
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

      <PdfViewerModal
        show={filePreview.show}
        onHide={filePreview.close}
        fileUrl={filePreview.fileUrl}
        fileExtension={filePreview.fileExtension}
        loading={filePreview.loading}
        title={filePreview.title}
      />
    </div>
  );
};

export default OfferApprovals;

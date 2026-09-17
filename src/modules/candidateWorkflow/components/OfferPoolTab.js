import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import recruiterApiService from "../../../core/recruiterApiService";
import masterApiService from "../../../core/masterApiService";
import Pagination from "../../../shared/Pagination";
import PdfViewerModal from "../../../shared/PdfViewerModal";
import { useFilePreview } from "../../../shared/useFilePreview";
import DateInput from "../../../shared/DateInput";

const OFFER_STATUS_PILL = {
  GENERATED: "status-pill-secondary",
  L1_PENDING: "status-pill-warning",
  L2_PENDING: "status-pill-warning",
  L1_REJECTED: "status-pill-danger",
  L2_REJECTED: "status-pill-danger",
  SENT: "status-pill-info",
  ACCEPTED: "status-pill-success",
  REJECTED: "status-pill-danger",
  EXPIRED: "status-pill-secondary",
};

// SCL_39: Accept Before Date must be a future date.
const tomorrowStr = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
};

// Offers in these states are still recruiter-editable (draft/rejected-and-redo); anything past that is locked (SCL_41).
const REGENERATABLE = ["GENERATED", "L1_REJECTED", "L2_REJECTED"];

const OfferPoolTab = ({ positionId }) => {
  const [candidates, setCandidates] = useState([]);
  const [offers, setOffers] = useState({});
  const [templates, setTemplates] = useState([]);
  const [templateId, setTemplateId] = useState("");
  const [acceptBeforeDate, setAcceptBeforeDate] = useState("");
  const [joiningDate, setJoiningDate] = useState("");
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [previewHtml, setPreviewHtml] = useState(null);
  const filePreview = useFilePreview();

  useEffect(() => {
    masterApiService.getOfferTemplates().then((res) => setTemplates(res.data.data || []));
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await recruiterApiService.searchCandidates({ positionId, statuses: ["MOVED_TO_OFFER"], page, size });
      const content = res.data.data.content || [];
      setCandidates(content);
      setTotalPages(res.data.data.totalPages || 0);

      const offerResults = await Promise.all(
        content.map((c) => recruiterApiService.getOfferByCandidate(c.id).then((r) => [c.id, r.data.data]).catch(() => [c.id, null]))
      );
      const offerMap = {};
      offerResults.forEach(([id, offer]) => { offerMap[id] = offer; });
      setOffers(offerMap);
    } catch (e) {
      toast.error("Failed to load offer pool");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    setSelected([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [positionId, page, size]);

  const canSelect = (c) => {
    const offer = offers[c.id];
    return !offer || REGENERATABLE.includes(offer.status);
  };

  const toggleSelect = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handlePreview = async () => {
    if (!templateId || selected.length === 0) {
      toast.error("Select an offer template and at least one candidate to preview");
      return;
    }
    try {
      const res = await recruiterApiService.previewOffer({
        candidateId: selected[0],
        templateId,
        acceptBeforeDate: acceptBeforeDate || null,
        joiningDate: joiningDate || null,
      });
      setPreviewHtml(res.data.data);
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to preview offer");
    }
  };

  const handleGenerate = async () => {
    if (!templateId || !acceptBeforeDate || !joiningDate) {
      toast.error("Select an offer template, accept-before date and joining date");
      return;
    }
    if (selected.length === 0) return;
    setGenerating(true);
    try {
      await recruiterApiService.generateOffers({ candidateIds: selected, templateId, acceptBeforeDate, joiningDate });
      toast.success("Offer(s) generated as draft. Submit for approval to send them.");
      setSelected([]);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to generate offers");
    } finally {
      setGenerating(false);
    }
  };

  // SCL_40: offers must go through L1/L2 approval before being emailed to the candidate.
  const handleSubmitForApproval = async () => {
    const ids = selected.filter((id) => offers[id]?.status === "GENERATED");
    if (ids.length === 0) {
      toast.error("Select candidate(s) with a generated (draft) offer to submit for approval");
      return;
    }
    setSubmitting(true);
    try {
      await recruiterApiService.submitOffersForApproval(ids);
      toast.success("Offer(s) submitted for approval");
      setSelected([]);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to submit for approval");
    } finally {
      setSubmitting(false);
    }
  };

  const hasGeneratedSelected = selected.some((id) => offers[id]?.status === "GENERATED");

  return (
    <div>
      <div className="row mb-3">
        <div className="col-md-3">
          <label className="form-label small">Offer Template</label>
          <select className="form-select" value={templateId} onChange={(e) => setTemplateId(e.target.value)}>
            <option value="">Select Template</option>
            {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          {/* SCL_36: preview the selected template before generating/sending. */}
          <button type="button" className="btn btn-link btn-sm p-0 mt-1" onClick={handlePreview}>
            <i className="bi bi-eye me-1" /> Preview
          </button>
        </div>
        <div className="col-md-3">
          <label className="form-label small">Accept Before Date</label>
          <DateInput value={acceptBeforeDate} min={tomorrowStr()} onChange={setAcceptBeforeDate} />
        </div>
        <div className="col-md-3">
          <label className="form-label small">Joining Date</label>
          <DateInput value={joiningDate} min={tomorrowStr()} onChange={setJoiningDate} />
        </div>
        <div className="col-md-3 d-flex align-items-end justify-content-end gap-2">
          {selected.length > 0 && (
            <button className="btn btn-primary" disabled={generating} onClick={handleGenerate}>
              {generating ? "Generating..." : `Generate (${selected.length})`}
            </button>
          )}
        </div>
      </div>

      {hasGeneratedSelected && (
        <div className="mb-2 d-flex justify-content-end">
          <button className="btn btn-blue-dark" disabled={submitting} onClick={handleSubmitForApproval}>
            {submitting ? "Submitting..." : "Submit for Approval"}
          </button>
        </div>
      )}

      {loading ? <div>Loading...</div> : (
        <table className="table table-hover align-middle">
          <thead>
            <tr className="text-muted fs-13">
              <th></th>
              <th>Candidate</th>
              <th>Email</th>
              <th>Agreed CTC</th>
              <th>Accept Before</th>
              <th>Joining Date</th>
              <th>Status</th>
              <th>Offer Letter</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((c) => {
              const offer = offers[c.id];
              return (
                <tr key={c.id}>
                  <td>
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={selected.includes(c.id)}
                      disabled={!canSelect(c)}
                      onChange={() => toggleSelect(c.id)}
                    />
                  </td>
                  <td>{c.name}</td>
                  <td>{c.email}</td>
                  <td>{c.agreedCtc ?? c.salary ?? "-"}</td>
                  <td>{offer?.acceptBeforeDate || "-"}</td>
                  <td>{offer?.joiningDate || "-"}</td>
                  <td>{offer ? <span className={`status-pill ${OFFER_STATUS_PILL[offer.status] || "status-pill-secondary"}`}>{offer.status.replace(/_/g, " ")}</span> : "-"}</td>
                  <td>
                    {offer?.offerFileUrl && (
                      <button
                        type="button"
                        className="icon-btn-circle"
                        onClick={() => filePreview.openFile(offer.offerFileUrl, "Offer Letter Preview")}
                      >
                        <i className="bi bi-file-earmark-pdf" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {candidates.length === 0 && (
              <tr><td colSpan={8} className="text-center text-muted py-4">No candidates in the offer pool.</td></tr>
            )}
          </tbody>
        </table>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={setPage} size={size} onSizeChange={(s) => { setSize(s); setPage(0); }} />

      <PdfViewerModal
        show={filePreview.show}
        onHide={filePreview.close}
        fileUrl={filePreview.fileUrl}
        fileExtension={filePreview.fileExtension}
        loading={filePreview.loading}
        title={filePreview.title}
      />

      {previewHtml !== null && (
        <div className="modal show d-block" style={{ background: "rgba(15,60,30,0.45)" }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Offer Letter Preview</h5>
                <button className="btn-close" onClick={() => setPreviewHtml(null)} />
              </div>
              <div className="modal-body">
                <iframe title="Offer Preview" srcDoc={previewHtml} style={{ width: "100%", height: "60vh", border: "1px solid var(--card-border)" }} />
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setPreviewHtml(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfferPoolTab;

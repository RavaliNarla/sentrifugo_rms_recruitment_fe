import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import recruiterApiService from "../../../core/recruiterApiService";
import masterApiService from "../../../core/masterApiService";
import Pagination from "../../../shared/Pagination";
import PdfViewerModal from "../../../shared/PdfViewerModal";
import { formatDate } from "../../../shared/dateFormat";
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

// Joining Date must be after Accept Before Date.
const dayAfter = (dateStr) => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
};

// SCL_41: selectable until candidate accepts or rejects (SENT can be regenerated/resent).
const LOCKED_OFFER_STATUSES = ["ACCEPTED", "REJECTED"];

const OfferPoolTab = ({ positionId, isActive }) => {
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
  const [errors, setErrors] = useState({});
  const [generatedInfo, setGeneratedInfo] = useState(null);
  const [searchText, setSearchText] = useState("");
  const filePreview = useFilePreview();

  useEffect(() => {
    masterApiService.getOfferTemplates().then((res) => setTemplates(res.data.data || []));
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await recruiterApiService.searchCandidates({ positionId, statuses: ["MOVED_TO_OFFER"], page, size, searchText });
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

  // Clear the selection and filter fields when navigating away to another tab - since this
  // tab now stays mounted (to avoid a reload flicker on revisit), they would otherwise persist.
  useEffect(() => {
    if (!isActive) {
      setSelected([]);
      setTemplateId("");
      setAcceptBeforeDate("");
      setJoiningDate("");
      setErrors({});
      setSearchText("");
    }
  }, [isActive]);

  // Only reload on a genuine searchText change, not on mount (compares actual values rather
  // than a "have I run before" flag, so it stays correct under StrictMode's double-invoke too).
  const prevSearchTextRef = useRef(searchText);
  useEffect(() => {
    if (prevSearchTextRef.current === searchText) return;
    prevSearchTextRef.current = searchText;
    const timeout = setTimeout(() => {
      setPage(0);
      load();
    }, 400);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  const canSelect = (c) => {
    const offer = offers[c.id];
    return !offer || !LOCKED_OFFER_STATUSES.includes(offer.status);
  };

  const toggleSelect = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  // SCL_36: template-only preview with placeholders when no candidate is selected.
  const handlePreview = async () => {
    if (!templateId) {
      setErrors((prev) => ({ ...prev, templateId: "Select an offer template" }));
      return;
    }
    try {
      const res = await recruiterApiService.previewOffer({
        candidateId: selected[0] || null,
        templateId,
        acceptBeforeDate: acceptBeforeDate || null,
        joiningDate: joiningDate || null,
      });
      setPreviewHtml(res.data.data);
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to preview offer");
    }
  };

  const validateGenerate = () => {
    const next = {};
    if (!templateId) next.templateId = "Select an offer template";
    if (!acceptBeforeDate) {
      next.acceptBeforeDate = "Accept Before Date is required";
    } else if (acceptBeforeDate <= new Date().toISOString().split("T")[0]) {
      next.acceptBeforeDate = "Accept Before Date must be a future date";
    }
    if (!joiningDate) {
      next.joiningDate = "Joining Date is required";
    } else if (acceptBeforeDate && joiningDate <= acceptBeforeDate) {
      next.joiningDate = "Joining Date must be after the Accept Before Date";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleGenerate = async () => {
    if (!validateGenerate()) return;
    if (selected.length === 0) return;
    setGenerating(true);
    try {
      const count = selected.length;
      await recruiterApiService.generateOffers({ candidateIds: selected, templateId, acceptBeforeDate, joiningDate });
      setGeneratedInfo(count);
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
          <select
            className={`form-select ${errors.templateId ? "is-invalid" : ""}`}
            value={templateId}
            onChange={(e) => { setTemplateId(e.target.value); setErrors((prev) => (prev.templateId ? { ...prev, templateId: undefined } : prev)); }}
          >
            <option value="">Select Template</option>
            {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <div className="text-danger fs-13 mt-1" style={{ minHeight: "5px" }}>{errors.templateId || ""}</div>
          {/* SCL_36: preview template with placeholders, or with selected candidate values. */}
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm mt-1"
            style={{ padding: "2px 10px", fontSize: "0.8125rem" }}
            onClick={handlePreview}
          >
            <i className="bi bi-eye me-1" /> Preview{selected.length === 0 ? " template" : ""}
          </button>
        </div>
        <div className="col-md-2">
          <label className="form-label small">Accept Before Date</label>
          <DateInput value={acceptBeforeDate} min={tomorrowStr()} onChange={(v) => { setAcceptBeforeDate(v); setErrors((prev) => (prev.acceptBeforeDate ? { ...prev, acceptBeforeDate: undefined } : prev)); }} />
          <div className="text-danger fs-13 mt-1" style={{ minHeight: "18px" }}>{errors.acceptBeforeDate || ""}</div>
        </div>
        <div className="col-md-2">
          <label className="form-label small">Joining Date</label>
          <DateInput
            value={joiningDate}
            min={acceptBeforeDate ? dayAfter(acceptBeforeDate) : tomorrowStr()}
            onChange={(v) => { setJoiningDate(v); setErrors((prev) => (prev.joiningDate ? { ...prev, joiningDate: undefined } : prev)); }}
          />
          <div className="text-danger fs-13 mt-1" style={{ minHeight: "18px" }}>{errors.joiningDate || ""}</div>
        </div>
        <div className="col-md-5 d-flex flex-wrap align-items-start gap-2" style={{ marginTop: "1.85rem" }}>
          <button className="btn btn-primary" disabled={generating || selected.length === 0} onClick={handleGenerate}>
            {generating ? "Generating..." : `Generate${selected.length > 0 ? ` (${selected.length})` : ""}`}
          </button>
          <button className="btn btn-primary" disabled={submitting || !hasGeneratedSelected} onClick={handleSubmitForApproval}>
            {submitting ? "Submitting..." : "Submit for Approval"}
          </button>
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div className="d-flex align-items-center flex-wrap gap-2">
          <div className="search-boxpost">
            <i className="bi bi-search" />
            <input className="form-control form-control-sm" placeholder="Search candidates..." value={searchText} onChange={(e) => setSearchText(e.target.value)} />
          </div>
          {selected.length > 0 && (
            <span className="badge rounded-pill text-bg-light border text-app-primary fs-13">{selected.length} Candidates Selected</span>
          )}
        </div>
      </div>

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
                  <td>{formatDate(offer?.acceptBeforeDate)}</td>
                  <td>{formatDate(offer?.joiningDate)}</td>
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
        <div className="modal show d-block" style={{ background: "rgba(0, 0, 0, 0.45)" }}>
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

      {generatedInfo !== null && (
        <div className="modal show d-block" style={{ background: "rgba(0, 0, 0, 0.45)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-check-circle-fill text-app-primary me-2" />
                  {generatedInfo} Offer{generatedInfo === 1 ? "" : "s"} Generated
                </h5>
                <button className="btn-close" onClick={() => setGeneratedInfo(null)} />
              </div>
              <div className="modal-body">
                <p className="mb-0 small">
                  The offer letter{generatedInfo === 1 ? " has" : "s have"} been generated and saved as a draft.
                  Please select the candidate{generatedInfo === 1 ? "" : "s"} again and click <strong>Submit for Approval</strong> to
                  send {generatedInfo === 1 ? "it" : "them"} for approval.
                </p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-primary" onClick={() => setGeneratedInfo(null)}>Got it</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfferPoolTab;

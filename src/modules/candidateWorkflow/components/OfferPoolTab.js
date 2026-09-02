import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import recruiterApiService from "../../../core/recruiterApiService";
import masterApiService from "../../../core/masterApiService";
import Pagination from "../../../shared/Pagination";

const OFFER_STATUS_BADGE = {
  GENERATED: "secondary",
  SENT: "info",
  ACCEPTED: "success",
  REJECTED: "danger",
  EXPIRED: "dark",
};

const OfferPoolTab = ({ positionId }) => {
  const [candidates, setCandidates] = useState([]);
  const [offers, setOffers] = useState({});
  const [templates, setTemplates] = useState([]);
  const [templateId, setTemplateId] = useState("");
  const [acceptBeforeDate, setAcceptBeforeDate] = useState("");
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

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

  const toggleSelect = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleGenerate = async () => {
    if (!templateId || !acceptBeforeDate) {
      toast.error("Select an offer template and accept-before date");
      return;
    }
    if (selected.length === 0) return;
    setGenerating(true);
    try {
      await recruiterApiService.generateOffers({ candidateIds: selected, templateId, acceptBeforeDate });
      toast.success("Offer(s) generated and emailed to candidate(s) successfully");
      setSelected([]);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to generate offers");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div>
      <div className="row mb-3">
        <div className="col-md-4">
          <label className="form-label small">Offer Template</label>
          <select className="form-select" value={templateId} onChange={(e) => setTemplateId(e.target.value)}>
            <option value="">Select Template</option>
            {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <div className="col-md-4">
          <label className="form-label small">Accept Before Date</label>
          <input type="date" className="form-control" value={acceptBeforeDate} onChange={(e) => setAcceptBeforeDate(e.target.value)} />
        </div>
        <div className="col-md-4 d-flex align-items-end">
          {selected.length > 0 && (
            <button className="btn btn-primary" disabled={generating} onClick={handleGenerate}>
              {generating ? "Generating..." : `Generate Offer${selected.length > 1 ? "s" : ""} (${selected.length})`}
            </button>
          )}
        </div>
      </div>

      {loading ? <div>Loading...</div> : (
        <table className="table table-hover">
          <thead className="table-light">
            <tr>
              <th></th>
              <th>Candidate</th>
              <th>Email</th>
              <th>Salary</th>
              <th>Accept Before</th>
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
                    <input type="checkbox" className="form-check-input" checked={selected.includes(c.id)} onChange={() => toggleSelect(c.id)} />
                  </td>
                  <td>{c.name}</td>
                  <td>{c.email}</td>
                  <td>{c.salary ?? "-"}</td>
                  <td>{offer?.acceptBeforeDate || "-"}</td>
                  <td>{offer ? <span className={`badge bg-${OFFER_STATUS_BADGE[offer.status] || "secondary"}`}>{offer.status}</span> : "-"}</td>
                  <td>
                    {offer?.offerFileUrl && (
                      <button className="btn btn-sm btn-outline-secondary" onClick={() => setPreviewUrl(recruiterApiService.fileUrl(offer.offerFileUrl))}>
                        <i className="bi bi-file-earmark-pdf" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {candidates.length === 0 && (
              <tr><td colSpan={7} className="text-center text-muted py-4">No candidates in the offer pool.</td></tr>
            )}
          </tbody>
        </table>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={setPage} size={size} onSizeChange={(s) => { setSize(s); setPage(0); }} />

      {previewUrl && (
        <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.7)" }} onClick={() => setPreviewUrl(null)}>
          <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content" style={{ height: "85vh" }}>
              <div className="modal-header">
                <h5 className="modal-title">Offer Letter Preview</h5>
                <button className="btn-close" onClick={() => setPreviewUrl(null)} />
              </div>
              <iframe src={previewUrl} title="Offer Letter" style={{ width: "100%", height: "100%", border: "none" }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfferPoolTab;

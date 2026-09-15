import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import recruiterApiService from "../../../core/recruiterApiService";
import masterApiService from "../../../core/masterApiService";
import Pagination from "../../../shared/Pagination";
import PdfViewerModal from "../../../shared/PdfViewerModal";
import { useFilePreview } from "../../../shared/useFilePreview";

const OFFER_STATUS_PILL = {
  GENERATED: "status-pill-secondary",
  SENT: "status-pill-info",
  ACCEPTED: "status-pill-success",
  REJECTED: "status-pill-danger",
  EXPIRED: "status-pill-secondary",
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
        <div className="col-md-4 d-flex align-items-end justify-content-end">
          {selected.length > 0 && (
            <button className="btn btn-primary" disabled={generating} onClick={handleGenerate}>
              {generating ? "Generating..." : `Generate Offer${selected.length > 1 ? "s" : ""} (${selected.length})`}
            </button>
          )}
        </div>
      </div>

      {selected.length > 0 && (
        <div className="mb-2">
          <span className="badge rounded-pill text-bg-light border text-app-primary fs-13">{selected.length} Candidates Selected</span>
        </div>
      )}

      {loading ? <div>Loading...</div> : (
        <table className="table table-hover align-middle">
          <thead>
            <tr className="text-muted fs-13">
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
                  <td>{offer ? <span className={`status-pill ${OFFER_STATUS_PILL[offer.status] || "status-pill-secondary"}`}>{offer.status}</span> : "-"}</td>
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
              <tr><td colSpan={7} className="text-center text-muted py-4">No candidates in the offer pool.</td></tr>
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
    </div>
  );
};

export default OfferPoolTab;

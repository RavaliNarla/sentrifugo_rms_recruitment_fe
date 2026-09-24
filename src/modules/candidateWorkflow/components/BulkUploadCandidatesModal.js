import React, { useRef, useState } from "react";
import { toast } from "react-toastify";
import recruiterApiService from "../../../core/recruiterApiService";

/**
 * BOB-style bulk import: download XLSX template → fill Name/Phone/Email → upload → Import.
 * Files (resume/photo/ID) are not part of bulk upload.
 */
const BulkUploadCandidatesModal = ({ positionId, onClose, onImported }) => {
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState([]);
  const fileInputRef = useRef(null);

  const downloadTemplate = async () => {
    try {
      const res = await recruiterApiService.downloadCandidateBulkTemplate();
      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "candidate-bulk-template.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to download template");
    }
  };

  const handleFileChange = (e) => {
    const chosen = e.target.files?.[0] || null;
    setErrors([]);
    if (!chosen) {
      setFile(null);
      return;
    }
    const name = chosen.name.toLowerCase();
    if (!name.endsWith(".xlsx") && !name.endsWith(".xls")) {
      toast.error("Please select an Excel file (.xlsx)");
      e.target.value = "";
      setFile(null);
      return;
    }
    setFile(chosen);
  };

  const handleImport = async () => {
    if (!file) {
      toast.error("Please upload an Excel file first");
      return;
    }
    setBusy(true);
    setErrors([]);
    try {
      const res = await recruiterApiService.bulkImportCandidates(positionId, file);
      const result = res.data?.data || {};
      const success = result.successCount || 0;
      const failure = result.failureCount || 0;
      const rowErrors = result.errors || [];
      setErrors(rowErrors);

      if (success > 0 && failure === 0) {
        toast.success(`${success} candidate(s) imported successfully`);
        onImported?.();
      } else if (success > 0) {
        toast.warning(`${success} imported, ${failure} failed. See details below.`);
        // Keep modal open so row errors stay visible; refresh list in background.
        onImported?.(false);
      } else {
        toast.error(res.data?.message || "Import failed for all rows");
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Bulk import failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal show d-block" style={{ background: "rgba(0, 0, 0, 0.45)" }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Bulk Upload Candidates</h5>
            <button type="button" className="btn-close" onClick={onClose} disabled={busy} />
          </div>
          <div className="modal-body">
            <div
              className="text-center p-4 mb-2"
              style={{
                background: "rgba(31, 138, 60, 0.06)",
                border: "1px dashed rgba(31, 138, 60, 0.35)",
                borderRadius: 12,
              }}
            >
              <i className="bi bi-cloud-arrow-up" style={{ fontSize: "2rem", color: "var(--brand-primary)" }} />
              <div className="fw-bold mt-2">Upload File</div>
              <div className="text-muted fs-13 mb-3">Support for XLSX formats (Name, Phone, Email)</div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                className="d-none"
                onChange={handleFileChange}
              />
              <button
                type="button"
                className="btn btn-primary"
                disabled={busy}
                onClick={() => fileInputRef.current?.click()}
              >
                Upload XLSX
              </button>
              {file && (
                <div className="mt-2 fs-13 text-muted">
                  Selected: <span className="fw-semibold text-dark">{file.name}</span>
                </div>
              )}
              <div className="mt-3">
                <button type="button" className="btn btn-link p-0 fs-13" onClick={downloadTemplate} disabled={busy}>
                  Download Template <strong>XLSX</strong>
                </button>
              </div>
            </div>
            <div className="text-muted fs-13">
              Fill Name, Phone (10 digits) and Email. Resumes / photos / ID proofs can be added later from Edit Candidate.
            </div>
            {errors.length > 0 && (
              <div className="alert alert-warning mt-3 mb-0 py-2 fs-13" style={{ maxHeight: 160, overflowY: "auto" }}>
                {errors.map((err, idx) => (
                  <div key={idx}>{err}</div>
                ))}
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={busy}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary" onClick={handleImport} disabled={busy || !file}>
              {busy ? "Importing..." : "Import"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkUploadCandidatesModal;

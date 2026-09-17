import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import recruiterApiService from "../../../core/recruiterApiService";

const EMPTY_FORM = { name: "", phone: "", email: "" };

const AddCandidateModal = ({ requisitionId, positionId, onClose, onSaved }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [resume, setResume] = useState(null);
  const [idProof, setIdProof] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [saving, setSaving] = useState(false);

  // Local preview URL for the selected photo file - revoked on change/unmount to avoid leaks.
  const photoPreviewUrl = useMemo(() => (photo ? URL.createObjectURL(photo) : null), [photo]);
  useEffect(() => () => { if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl); }, [photoPreviewUrl]);

  const handleSave = async () => {
    if (!form.name || !form.phone || !form.email) {
      toast.error("Name, Phone and Email are required");
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("candidate", JSON.stringify({ requisitionId, positionId, ...form }));
      if (resume) formData.append("resume", resume);
      if (idProof) formData.append("idProof", idProof);
      if (photo) formData.append("photo", photo);
      await recruiterApiService.addCandidate(formData);
      toast.success("Candidate added successfully");
      onSaved();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to add candidate");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal show d-block" style={{ background: "rgba(15,60,30,0.45)" }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Add Candidate</h5>
            <button className="btn-close" onClick={onClose} />
          </div>
          <div className="modal-body">
            <div className="row">
              <div className="col-md-8">
                <div className="mb-3">
                  <label className="form-label">Name <span className="text-danger">*</span></label>
                  <input className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Phone <span className="text-danger">*</span></label>
                  <input className="form-control" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Email <span className="text-danger">*</span></label>
                  <input type="email" className="form-control" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
              </div>

              <div className="col-md-4 d-flex flex-column align-items-center">
                <label className="form-label align-self-start">Photo (optional)</label>
                <div className="candidate-photo-preview mb-2">
                  {photoPreviewUrl ? (
                    <img src={photoPreviewUrl} alt="Candidate preview" />
                  ) : (
                    <i className="bi bi-person-fill" />
                  )}
                </div>
                <label className="btn btn-outline-brand btn-sm w-100 mb-0" style={{ cursor: "pointer" }}>
                  <i className="bi bi-camera-fill me-1" /> {photo ? "Change Photo" : "Upload Photo"}
                  <input type="file" accept=".png,.jpg,.jpeg" hidden onChange={(e) => setPhoto(e.target.files[0] || null)} />
                </label>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Resume (optional)</label>
                <input type="file" className="form-control" accept=".pdf,.doc,.docx" onChange={(e) => setResume(e.target.files[0])} />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">ID Proof (optional)</label>
                <input type="file" className="form-control" accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => setIdProof(e.target.files[0])} />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" disabled={saving} onClick={handleSave}>{saving ? "Adding..." : "Add"}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCandidateModal;

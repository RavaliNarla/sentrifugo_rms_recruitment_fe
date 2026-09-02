import React, { useState } from "react";
import { toast } from "react-toastify";
import recruiterApiService from "../../../core/recruiterApiService";

const EMPTY_FORM = { name: "", phone: "", email: "" };

const AddCandidateModal = ({ requisitionId, positionId, onClose, onSaved }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [resume, setResume] = useState(null);
  const [idProof, setIdProof] = useState(null);
  const [saving, setSaving] = useState(false);

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
    <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Add Candidate</h5>
            <button className="btn-close" onClick={onClose} />
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label">Name *</label>
              <input className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="mb-3">
              <label className="form-label">Phone *</label>
              <input className="form-control" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="mb-3">
              <label className="form-label">Email *</label>
              <input type="email" className="form-control" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="mb-3">
              <label className="form-label">Resume (optional)</label>
              <input type="file" className="form-control" accept=".pdf,.doc,.docx" onChange={(e) => setResume(e.target.files[0])} />
            </div>
            <div className="mb-3">
              <label className="form-label">ID Proof (optional)</label>
              <input type="file" className="form-control" accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => setIdProof(e.target.files[0])} />
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

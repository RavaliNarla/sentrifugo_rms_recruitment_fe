import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import recruiterApiService from "../../../core/recruiterApiService";

const EMPTY_FORM = { name: "", phone: "", email: "" };

// SCL_24: Email/Phone fields were allowing invalid text formats.
const EMAIL_REGEX = /^[\w.+-]+@[\w-]+\.[a-zA-Z]{2,}$/;
const PHONE_REGEX = /^[0-9]{10}$/;

const RESUME_EXTENSIONS = [".pdf", ".doc", ".docx"];
const ID_PROOF_EXTENSIONS = [".pdf", ".png", ".jpg", ".jpeg"];
const PHOTO_EXTENSIONS = [".png", ".jpg", ".jpeg"];

const getFileExtension = (fileName) => {
  const idx = fileName.lastIndexOf(".");
  return idx === -1 ? "" : fileName.slice(idx).toLowerCase();
};

const AddCandidateModal = ({ requisitionId, positionId, editingCandidate, onClose, onSaved }) => {
  const [form, setForm] = useState(
    editingCandidate
      ? { name: editingCandidate.name, phone: editingCandidate.phone, email: editingCandidate.email }
      : EMPTY_FORM
  );
  const [resume, setResume] = useState(null);
  const [idProof, setIdProof] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [saving, setSaving] = useState(false);

  // Local preview URL for the selected photo file - revoked on change/unmount to avoid leaks.
  const photoPreviewUrl = useMemo(() => (photo ? URL.createObjectURL(photo) : null), [photo]);
  useEffect(() => () => { if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl); }, [photoPreviewUrl]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file && !PHOTO_EXTENSIONS.includes(getFileExtension(file.name))) {
      toast.error("Photo must be an image file (.png, .jpg, .jpeg)");
      e.target.value = "";
      setPhoto(null);
      return;
    }
    setPhoto(file || null);
  };

  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    if (file && !RESUME_EXTENSIONS.includes(getFileExtension(file.name))) {
      toast.error("Resume must be a PDF or Word document (.pdf, .doc, .docx)");
      e.target.value = "";
      setResume(null);
      return;
    }
    setResume(file || null);
  };

  const handleIdProofChange = (e) => {
    const file = e.target.files[0];
    if (file && !ID_PROOF_EXTENSIONS.includes(getFileExtension(file.name))) {
      toast.error("ID Proof must be a PDF or image file (.pdf, .png, .jpg, .jpeg)");
      e.target.value = "";
      setIdProof(null);
      return;
    }
    setIdProof(file || null);
  };

  const handleSave = async () => {
    if (!form.name || !form.phone || !form.email) {
      toast.error("Name, Phone and Email are required");
      return;
    }
    if (!EMAIL_REGEX.test(form.email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (!PHONE_REGEX.test(form.phone)) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("candidate", JSON.stringify({ requisitionId, positionId, ...form }));
      if (resume) formData.append("resume", resume);
      if (idProof) formData.append("idProof", idProof);
      if (photo) formData.append("photo", photo);
      if (editingCandidate) {
        await recruiterApiService.updateCandidate(editingCandidate.id, formData);
        toast.success("Candidate updated successfully");
      } else {
        await recruiterApiService.addCandidate(formData);
        toast.success("Candidate added successfully");
      }
      onSaved();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to save candidate");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal show d-block" style={{ background: "rgba(15,60,30,0.45)" }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{editingCandidate ? "Edit Candidate" : "Add Candidate"}</h5>
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
                  <input
                    type="tel"
                    className="form-control"
                    maxLength={10}
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                  />
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
                  <input type="file" accept=".png,.jpg,.jpeg" hidden onChange={handlePhotoChange} />
                </label>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Resume (optional)</label>
                <input type="file" className="form-control" accept=".pdf,.doc,.docx" onChange={handleResumeChange} />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">ID Proof (optional)</label>
                <input type="file" className="form-control" accept=".pdf,.png,.jpg,.jpeg" onChange={handleIdProofChange} />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" disabled={saving} onClick={handleSave}>
              {saving ? "Saving..." : editingCandidate ? "Save Changes" : "Add"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCandidateModal;

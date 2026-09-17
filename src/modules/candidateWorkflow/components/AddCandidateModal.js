import React, { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import recruiterApiService from "../../../core/recruiterApiService";
import ConfirmModal from "../../../shared/ConfirmModal";

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

const docsFromCandidate = (c) => ({
  hasPhoto: !!c?.hasPhoto,
  photoUrl: c?.photoUrl || null,
  hasResume: !!c?.hasResume,
  resumeUrl: c?.resumeUrl || null,
  hasIdProof: !!c?.hasIdProof,
  idProofUrl: c?.idProofUrl || null,
});

const DOC_LABELS = {
  photo: "photo",
  resume: "resume",
  "id-proof": "ID proof",
};

const AddCandidateModal = ({
  requisitionId,
  positionId,
  editingCandidate,
  onClose,
  onSaved,
  onViewFile,
  onDocumentsChanged,
}) => {
  const [form, setForm] = useState(
    editingCandidate
      ? { name: editingCandidate.name, phone: editingCandidate.phone, email: editingCandidate.email }
      : EMPTY_FORM
  );
  const [resume, setResume] = useState(null);
  const [idProof, setIdProof] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [existingDocs, setExistingDocs] = useState(() => docsFromCandidate(editingCandidate));
  const [existingPhotoBlob, setExistingPhotoBlob] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [confirmDelete, setConfirmDelete] = useState({ show: false, type: null });
  const submittingRef = useRef(false);

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  };

  // Local preview URL for the selected photo file - revoked on change/unmount to avoid leaks.
  const photoPreviewUrl = useMemo(() => (photo ? URL.createObjectURL(photo) : null), [photo]);
  useEffect(() => () => { if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl); }, [photoPreviewUrl]);

  // Load existing uploaded photo into the avatar when editing (until a new file is chosen).
  useEffect(() => {
    let blobUrl;
    let cancelled = false;
    if (editingCandidate && existingDocs.hasPhoto && existingDocs.photoUrl && !photo) {
      recruiterApiService.fetchFileBlobUrl(existingDocs.photoUrl)
        .then((url) => {
          if (cancelled) {
            URL.revokeObjectURL(url);
            return;
          }
          blobUrl = url;
          setExistingPhotoBlob(url);
        })
        .catch(() => {
          if (!cancelled) setExistingPhotoBlob(null);
        });
    } else {
      setExistingPhotoBlob(null);
    }
    return () => {
      cancelled = true;
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [editingCandidate, existingDocs.hasPhoto, existingDocs.photoUrl, photo]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    setErrors((prev) => (prev.photo ? { ...prev, photo: undefined } : prev));
    if (file && !PHOTO_EXTENSIONS.includes(getFileExtension(file.name))) {
      setErrors((prev) => ({ ...prev, photo: "Photo must be an image file (.png, .jpg, .jpeg)" }));
      e.target.value = "";
      setPhoto(null);
      return;
    }
    setPhoto(file || null);
  };

  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    setErrors((prev) => (prev.resume ? { ...prev, resume: undefined } : prev));
    if (file && !RESUME_EXTENSIONS.includes(getFileExtension(file.name))) {
      setErrors((prev) => ({ ...prev, resume: "Resume must be a PDF or Word document (.pdf, .doc, .docx)" }));
      e.target.value = "";
      setResume(null);
      return;
    }
    setResume(file || null);
  };

  const handleIdProofChange = (e) => {
    const file = e.target.files[0];
    setErrors((prev) => (prev.idProof ? { ...prev, idProof: undefined } : prev));
    if (file && !ID_PROOF_EXTENSIONS.includes(getFileExtension(file.name))) {
      setErrors((prev) => ({ ...prev, idProof: "ID Proof must be a PDF or image file (.pdf, .png, .jpg, .jpeg)" }));
      e.target.value = "";
      setIdProof(null);
      return;
    }
    setIdProof(file || null);
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Name is required";
    if (!form.phone.trim()) {
      next.phone = "Phone is required";
    } else if (!PHONE_REGEX.test(form.phone)) {
      next.phone = "Please enter a valid 10-digit phone number";
    }
    if (!form.email.trim()) {
      next.email = "Email is required";
    } else if (!EMAIL_REGEX.test(form.email)) {
      next.email = "Please enter a valid email address";
    }
    setErrors((prev) => ({ ...prev, name: next.name, phone: next.phone, email: next.email }));
    return !next.name && !next.phone && !next.email;
  };

  const handleSave = async () => {
    if (submittingRef.current) return;
    if (!validate()) return;
    submittingRef.current = true;
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
      submittingRef.current = false;
      setSaving(false);
    }
  };

  const askDeleteDocument = (type) => {
    setConfirmDelete({ show: true, type });
  };

  const closeDeleteConfirm = () => setConfirmDelete({ show: false, type: null });

  const confirmDeleteDocument = async () => {
    const type = confirmDelete.type;
    closeDeleteConfirm();
    if (!editingCandidate?.id || !type) return;
    try {
      const res = await recruiterApiService.deleteCandidateDocument(editingCandidate.id, type);
      const updated = res.data?.data;
      setExistingDocs(docsFromCandidate(updated || {
        ...existingDocs,
        ...(type === "photo" ? { hasPhoto: false, photoUrl: null } : {}),
        ...(type === "resume" ? { hasResume: false, resumeUrl: null } : {}),
        ...(type === "id-proof" ? { hasIdProof: false, idProofUrl: null } : {}),
      }));
      if (type === "photo") setPhoto(null);
      if (type === "resume") setResume(null);
      if (type === "id-proof") setIdProof(null);
      toast.success(`${DOC_LABELS[type] || "Document"} deleted successfully`);
      onDocumentsChanged?.(updated);
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to delete document");
    }
  };

  const avatarSrc = photoPreviewUrl || existingPhotoBlob;
  const showExistingPhotoLink = editingCandidate && existingDocs.hasPhoto && existingDocs.photoUrl && !photo;
  const showExistingResumeLink = editingCandidate && existingDocs.hasResume && existingDocs.resumeUrl && !resume;
  const showExistingIdProofLink = editingCandidate && existingDocs.hasIdProof && existingDocs.idProofUrl && !idProof;

  const ExistingDocActions = ({ label, onView, onDelete }) => (
    <div className="d-flex align-items-center gap-2 mt-1">
      <button type="button" className="btn btn-link p-0 fs-13 text-decoration-underline" onClick={onView}>
        {label}
      </button>
      <button
        type="button"
        className="btn btn-link p-0 text-danger lh-1"
        title={`Delete ${label}`}
        aria-label={`Delete ${label}`}
        onClick={onDelete}
        style={{ fontSize: "0.85rem" }}
      >
        <i className="bi bi-trash-fill" />
      </button>
    </div>
  );

  return (
    <div className="modal show d-block" style={{ background: "rgba(15,60,30,0.45)" }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
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
                  <input
                    className={`form-control ${errors.name ? "is-invalid" : ""}`}
                    value={form.name}
                    onChange={(e) => setField("name", e.target.value)}
                  />
                  {errors.name && <div className="text-danger fs-13 mt-1">{errors.name}</div>}
                </div>
                <div className="mb-3">
                  <label className="form-label">Phone <span className="text-danger">*</span></label>
                  <input
                    type="tel"
                    className={`form-control ${errors.phone ? "is-invalid" : ""}`}
                    maxLength={10}
                    value={form.phone}
                    onChange={(e) => setField("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                  />
                  {errors.phone && <div className="text-danger fs-13 mt-1">{errors.phone}</div>}
                </div>
                <div className="mb-3">
                  <label className="form-label">Email <span className="text-danger">*</span></label>
                  <input
                    type="email"
                    className={`form-control ${errors.email ? "is-invalid" : ""}`}
                    value={form.email}
                    onChange={(e) => setField("email", e.target.value)}
                  />
                  {errors.email && <div className="text-danger fs-13 mt-1">{errors.email}</div>}
                </div>
              </div>

              <div className="col-md-4 d-flex flex-column align-items-center">
                <label className="form-label align-self-start">Photo (optional)</label>
                <div className="candidate-photo-preview mb-2">
                  {avatarSrc ? (
                    <img src={avatarSrc} alt="Candidate preview" />
                  ) : (
                    <i className="bi bi-person-fill" />
                  )}
                </div>
                <label className="btn btn-outline-brand btn-sm w-100 mb-0" style={{ cursor: "pointer" }}>
                  <i className="bi bi-camera-fill me-1" /> {photo || existingDocs.hasPhoto ? "Change Photo" : "Upload Photo"}
                  <input type="file" accept=".png,.jpg,.jpeg" hidden onChange={handlePhotoChange} />
                </label>
                {showExistingPhotoLink && (
                  <ExistingDocActions
                    label="View Uploaded Photo"
                    onView={() => onViewFile?.(existingDocs.photoUrl, "Photo Preview")}
                    onDelete={() => askDeleteDocument("photo")}
                  />
                )}
                {errors.photo && <div className="text-danger fs-13 mt-1">{errors.photo}</div>}
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Resume (optional)</label>
                <input
                  type="file"
                  className={`form-control ${errors.resume ? "is-invalid" : ""}`}
                  accept=".pdf,.doc,.docx"
                  onChange={handleResumeChange}
                />
                {showExistingResumeLink && (
                  <ExistingDocActions
                    label="View Uploaded Resume"
                    onView={() => onViewFile?.(existingDocs.resumeUrl, "Resume Preview")}
                    onDelete={() => askDeleteDocument("resume")}
                  />
                )}
                {errors.resume && <div className="text-danger fs-13 mt-1">{errors.resume}</div>}
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">ID Proof (optional)</label>
                <input
                  type="file"
                  className={`form-control ${errors.idProof ? "is-invalid" : ""}`}
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleIdProofChange}
                />
                {showExistingIdProofLink && (
                  <ExistingDocActions
                    label="View Uploaded ID Proof"
                    onView={() => onViewFile?.(existingDocs.idProofUrl, "ID Proof Preview")}
                    onDelete={() => askDeleteDocument("id-proof")}
                  />
                )}
                {errors.idProof && <div className="text-danger fs-13 mt-1">{errors.idProof}</div>}
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

      <ConfirmModal
        show={confirmDelete.show}
        elevated
        title="Delete Document"
        message={`Are you sure you want to delete this ${DOC_LABELS[confirmDelete.type] || "document"}? This cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="danger"
        cancelLabel="Cancel"
        onConfirm={confirmDeleteDocument}
        onCancel={closeDeleteConfirm}
      />
    </div>
  );
};

export default AddCandidateModal;

import React, { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import recruiterApiService from "../../../core/recruiterApiService";
import ConfirmModal from "../../../shared/ConfirmModal";
import DateInput from "../../../shared/DateInput";
import { istTodayStr } from "../../../shared/dateFormat";

const EMPTY_FORM = {
  firstName: "",
  middleName: "",
  lastName: "",
  genderHrmsId: "",
  genderName: "",
  dateOfBirth: "",
  phone: "",
  email: "",
};

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

const formFromCandidate = (c) => ({
  firstName: c?.firstName || "",
  middleName: c?.middleName || "",
  lastName: c?.lastName || "",
  genderHrmsId: c?.genderHrmsId || "",
  genderName: c?.genderName || "",
  dateOfBirth: c?.dateOfBirth || "",
  phone: c?.phone || "",
  email: c?.email || "",
});

const buildFullName = (first, middle, last) =>
  [first, middle, last].map((p) => (p || "").trim()).filter(Boolean).join(" ");

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
    editingCandidate ? formFromCandidate(editingCandidate) : EMPTY_FORM
  );
  const [genders, setGenders] = useState([]);
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

  useEffect(() => {
    recruiterApiService.getGenders()
      .then((res) => setGenders(res.data?.data || []))
      .catch(() => toast.error("Failed to load genders from HRMS"));
  }, []);

  const photoPreviewUrl = useMemo(() => (photo ? URL.createObjectURL(photo) : null), [photo]);
  useEffect(() => () => { if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl); }, [photoPreviewUrl]);

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
    if (file && file.size === 0) {
      setErrors((prev) => ({ ...prev, resume: "The selected file is empty (0 bytes). Please choose a resume with content." }));
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

  const handleGenderChange = (e) => {
    const id = e.target.value;
    const selected = genders.find((g) => g.id === id);
    setForm((prev) => ({
      ...prev,
      genderHrmsId: id,
      genderName: selected?.name || "",
    }));
    setErrors((prev) => (prev.genderHrmsId ? { ...prev, genderHrmsId: undefined } : prev));
  };

  const validate = () => {
    const next = {};
    if (!form.firstName.trim()) next.firstName = "First name is required";
    if (!form.lastName.trim()) next.lastName = "Last name is required";
    if (!form.genderHrmsId) next.genderHrmsId = "Gender is required";
    if (!form.dateOfBirth) next.dateOfBirth = "Date of birth is required";
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
    if (!resume && !existingDocs.hasResume) {
      next.resume = "Resume is required";
    }
    setErrors((prev) => ({
      ...prev,
      firstName: next.firstName,
      lastName: next.lastName,
      genderHrmsId: next.genderHrmsId,
      dateOfBirth: next.dateOfBirth,
      phone: next.phone,
      email: next.email,
      resume: next.resume,
    }));
    return !next.firstName && !next.lastName && !next.genderHrmsId && !next.dateOfBirth
      && !next.phone && !next.email && !next.resume;
  };

  const handleSave = async () => {
    if (submittingRef.current) return;
    if (!validate()) return;
    submittingRef.current = true;
    setSaving(true);
    try {
      const firstName = form.firstName.trim();
      const middleName = form.middleName.trim();
      const lastName = form.lastName.trim();
      const payload = {
        requisitionId,
        positionId,
        firstName,
        middleName: middleName || null,
        lastName,
        name: buildFullName(firstName, middleName, lastName),
        genderHrmsId: form.genderHrmsId,
        genderName: form.genderName,
        dateOfBirth: form.dateOfBirth || null,
        phone: form.phone,
        email: form.email,
      };
      const formData = new FormData();
      formData.append("candidate", JSON.stringify(payload));
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
      const message = e.response?.data?.message || "Failed to save candidate";
      const sentences = message.split(/(?<=\.)\s+/).filter(Boolean);
      const fieldErrors = {};
      const unmatched = [];
      sentences.forEach((sentence) => {
        const lower = sentence.toLowerCase();
        if (lower.includes("email")) fieldErrors.email = sentence;
        else if (lower.includes("phone")) fieldErrors.phone = sentence;
        else if (lower.includes("first name")) fieldErrors.firstName = sentence;
        else if (lower.includes("last name")) fieldErrors.lastName = sentence;
        else if (lower.includes("gender")) fieldErrors.genderHrmsId = sentence;
        else unmatched.push(sentence);
      });
      if (Object.keys(fieldErrors).length > 0) {
        setErrors((prev) => ({ ...prev, ...fieldErrors }));
        if (unmatched.length) toast.error(unmatched.join(" "));
      } else {
        toast.error(message);
      }
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
    <div className="modal show d-block" style={{ background: "rgba(0, 0, 0, 0.45)" }}>
      <div className="modal-dialog modal-dialog-centered modal-lg" style={{ maxWidth: 920 }}>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{editingCandidate ? "Edit Candidate" : "Add Candidate"}</h5>
            <button className="btn-close" onClick={onClose} />
          </div>
          <div className="modal-body">
            <div className="row">
              <div className="col-md-8">
                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label className="form-label">First Name <span className="text-danger">*</span></label>
                    <input
                      className={`form-control ${errors.firstName ? "is-invalid" : ""}`}
                      value={form.firstName}
                      onChange={(e) => setField("firstName", e.target.value)}
                      autoFocus
                    />
                    <div className="text-danger fs-13 mt-1" style={{ minHeight: "18px" }}>{errors.firstName || ""}</div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Middle Name</label>
                    <input
                      className="form-control"
                      value={form.middleName}
                      onChange={(e) => setField("middleName", e.target.value)}
                    />
                    <div className="fs-13 mt-1" style={{ minHeight: "18px" }} />
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Last Name <span className="text-danger">*</span></label>
                    <input
                      className={`form-control ${errors.lastName ? "is-invalid" : ""}`}
                      value={form.lastName}
                      onChange={(e) => setField("lastName", e.target.value)}
                    />
                    <div className="text-danger fs-13 mt-1" style={{ minHeight: "18px" }}>{errors.lastName || ""}</div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Gender <span className="text-danger">*</span></label>
                    <select
                      className={`form-select ${errors.genderHrmsId ? "is-invalid" : ""}`}
                      value={form.genderHrmsId}
                      onChange={handleGenderChange}
                    >
                      <option value="">Select</option>
                      {genders.map((g) => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))}
                    </select>
                    <div className="text-danger fs-13 mt-1" style={{ minHeight: "18px" }}>{errors.genderHrmsId || ""}</div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Date of Birth <span className="text-danger">*</span></label>
                    <DateInput
                      value={form.dateOfBirth}
                      max={istTodayStr()}
                      onChange={(v) => setField("dateOfBirth", v)}
                    />
                    <div className="text-danger fs-13 mt-1" style={{ minHeight: "18px" }}>{errors.dateOfBirth || ""}</div>
                  </div>
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
                  <div className="text-danger fs-13 mt-1" style={{ minHeight: "18px" }}>{errors.phone || ""}</div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Email <span className="text-danger">*</span></label>
                  <input
                    type="email"
                    className={`form-control ${errors.email ? "is-invalid" : ""}`}
                    value={form.email}
                    onChange={(e) => setField("email", e.target.value)}
                  />
                  <div className="text-danger fs-13 mt-1" style={{ minHeight: "18px" }}>{errors.email || ""}</div>
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
                <div className="text-danger fs-13 mt-1" style={{ minHeight: "18px" }}>{errors.photo || ""}</div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Resume <span className="text-danger">*</span></label>
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
                <div className="text-danger fs-13 mt-1" style={{ minHeight: "18px" }}>{errors.resume || ""}</div>
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
                <div className="text-danger fs-13 mt-1" style={{ minHeight: "18px" }}>{errors.idProof || ""}</div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" disabled={saving} onClick={handleSave}>
              {saving ? (editingCandidate ? "Updating..." : "Saving...") : editingCandidate ? "Update" : "Add"}
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

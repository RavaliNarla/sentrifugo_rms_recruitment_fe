import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import recruiterApiService from "../../core/recruiterApiService";
import masterApiService from "../../core/masterApiService";
import DateInput from "../../shared/DateInput";
import ConfirmModal from "../../shared/ConfirmModal";
import PdfViewerModal from "../../shared/PdfViewerModal";
import { useFilePreview } from "../../shared/useFilePreview";

const EMPTY_FORM = {
  departmentId: "",
  locationId: "",
  positionTitleId: "",
  jobDescription: "",
  educationQualificationId: "",
  specializationId: "",
  experienceYears: "",
  certificationId: "",
  medicalFitnessRequired: false,
  employmentType: "",
  contractualPeriod: "",
  vacancies: "",
  approvedById: "",
  approvedByOtherText: "",
  approvedOn: "",
};

const EXPERIENCE_YEARS = Array.from({ length: 31 }, (_, i) => i);
const todayStr = () => new Date().toISOString().split("T")[0];

const APPROVAL_DOC_EXTENSIONS = [".png", ".jpg", ".jpeg", ".docx", ".pdf"];

const getFileExtension = (fileName) => {
  const idx = fileName.lastIndexOf(".");
  return idx === -1 ? "" : fileName.slice(idx).toLowerCase();
};

const AddPosition = () => {
  const navigate = useNavigate();
  const { requisitionId } = useParams();
  const location = useLocation();
  const editingPosition = location.state?.position;
  const viewOnly = location.state?.viewOnly === true;
  const filePreview = useFilePreview();

  const [departments, setDepartments] = useState([]);
  const [locations, setLocations] = useState([]);
  const [positionTitles, setPositionTitles] = useState([]);
  const [educationQualifications, setEducationQualifications] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [approvedByRoles, setApprovedByRoles] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [approvalDoc, setApprovalDoc] = useState(null);
  const [saving, setSaving] = useState(false);
  const [autofillPrompt, setAutofillPrompt] = useState(null);
  const [errors, setErrors] = useState({});
  const submittingRef = useRef(false);

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  };

  useEffect(() => {
    Promise.all([
      masterApiService.getDepartments(),
      masterApiService.getLocations(),
      masterApiService.getEducationQualifications(),
      masterApiService.getApprovedByRoles(),
      masterApiService.getCertifications(),
    ]).then(([d, l, e, a, c]) => {
      setDepartments(d.data.data || []);
      setLocations(l.data.data || []);
      setEducationQualifications(e.data.data || []);
      setApprovedByRoles(a.data.data || []);
      setCertifications(c.data.data || []);
    }).catch(() => toast.error("Failed to load master data"));

    if (editingPosition) {
      setForm({
        departmentId: editingPosition.departmentId,
        locationId: editingPosition.locationId,
        positionTitleId: editingPosition.positionTitleId,
        jobDescription: editingPosition.jobDescription || editingPosition.rolesResponsibilities || "",
        educationQualificationId: editingPosition.educationQualificationId || "",
        specializationId: editingPosition.specializationId || "",
        experienceYears: editingPosition.experienceYears != null ? String(editingPosition.experienceYears) : "",
        certificationId: editingPosition.certificationId || "",
        medicalFitnessRequired: editingPosition.medicalFitnessRequired === true,
        employmentType: editingPosition.employmentType || "",
        contractualPeriod: editingPosition.contractualPeriod || "",
        vacancies: editingPosition.vacancies != null ? String(editingPosition.vacancies) : "",
        approvedById: editingPosition.approvedById || "",
        approvedByOtherText: editingPosition.approvedByOtherText || "",
        approvedOn: editingPosition.approvedOn || "",
      });
      if (editingPosition.departmentId) {
        loadPositionTitles(editingPosition.departmentId);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Education -> Specialization (optional, e.g. Computer Science and Engineering for B.Tech).
  useEffect(() => {
    if (!form.educationQualificationId) {
      setSpecializations([]);
      return;
    }
    masterApiService.getSpecializationsByEducation(form.educationQualificationId)
      .then((res) => setSpecializations(res.data.data || []))
      .catch(() => toast.error("Failed to load specializations"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.educationQualificationId]);

  const loadPositionTitles = (departmentId) => {
    if (!departmentId) {
      setPositionTitles([]);
      return;
    }
    masterApiService.getPositionTitlesByDepartment(departmentId)
      .then((res) => setPositionTitles(res.data.data || []))
      .catch(() => toast.error("Failed to load position titles"));
  };

  const handleDepartmentChange = (departmentId) => {
    setForm((prev) => ({ ...prev, departmentId, positionTitleId: "" }));
    loadPositionTitles(departmentId);
  };

  // SCL_07: Position Master can carry default Roles & Responsibilities + Minimum Experience;
  // ask before overwriting whatever the user may have already typed.
  const handlePositionTitleChange = (positionTitleId) => {
    setForm((prev) => ({ ...prev, positionTitleId }));
    const master = positionTitles.find((p) => p.id === positionTitleId);
    if (master && (master.jobDescription || master.minimumExperienceYears != null)) {
      setAutofillPrompt(master);
    }
  };

  const applyAutofill = () => {
    setForm((prev) => ({
      ...prev,
      // Master stores this as jobDescription; Add Position UI label is Roles & Responsibilities (SCL_16).
      jobDescription: autofillPrompt.jobDescription || prev.jobDescription,
      experienceYears: autofillPrompt.minimumExperienceYears != null ? String(autofillPrompt.minimumExperienceYears) : prev.experienceYears,
    }));
    setAutofillPrompt(null);
  };

  const selectedApprovedByRole = approvedByRoles.find((a) => a.id === form.approvedById);
  const isApprovedByOthers = selectedApprovedByRole?.name?.toLowerCase() === "others";

  const handleApprovalDocChange = (e) => {
    const file = e.target.files[0];
    setErrors((prev) => (prev.approvalDoc ? { ...prev, approvalDoc: undefined } : prev));
    if (file && !APPROVAL_DOC_EXTENSIONS.includes(getFileExtension(file.name))) {
      setErrors((prev) => ({ ...prev, approvalDoc: "Approval document must be a PNG, JPEG, DOCX or PDF file" }));
      e.target.value = "";
      setApprovalDoc(null);
      return;
    }
    setApprovalDoc(file || null);
  };

  const validate = () => {
    const next = {};
    if (!form.departmentId) next.departmentId = "Department is required";
    if (!form.positionTitleId) next.positionTitleId = "Position Title is required";
    if (!form.locationId) next.locationId = "Location is required";
    if (!form.jobDescription.trim()) next.jobDescription = "Roles & Responsibilities is required";
    if (!form.educationQualificationId) next.educationQualificationId = "Education Requirement is required";
    if (form.experienceYears === "") next.experienceYears = "Experience Required (years) is required";
    if (!form.employmentType) next.employmentType = "Employment Type is required";
    if (form.employmentType === "CONTRACT" && !form.contractualPeriod.trim()) {
      next.contractualPeriod = "Contractual Period is required for Contract employment";
    }
    if (!form.vacancies || Number(form.vacancies) < 1) {
      next.vacancies = "Number of Positions to be Hired is required";
    }
    if (!form.approvedById) next.approvedById = "Approved By is required";
    if (isApprovedByOthers && !form.approvedByOtherText.trim()) {
      next.approvedByOtherText = "Please enter the approver's name for 'Others'";
    }
    if (!form.approvedOn) {
      next.approvedOn = "Approved On is required";
    } else if (form.approvedOn > todayStr()) {
      next.approvedOn = "Approved On cannot be a future date";
    }
    if (!approvalDoc && !editingPosition?.approvalDocUrl) {
      next.approvalDoc = "Upload Approval Email/Document is required";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async () => {
    if (viewOnly) return;
    if (submittingRef.current) return;
    if (!validate()) return;

    submittingRef.current = true;
    setSaving(true);
    try {
      const positionPayload = {
        requisitionId,
        departmentId: form.departmentId,
        locationId: form.locationId,
        positionTitleId: form.positionTitleId,
        jobDescription: form.jobDescription,
        rolesResponsibilities: form.jobDescription || null,
        educationQualificationId: form.educationQualificationId || null,
        specializationId: form.specializationId || null,
        experienceYears: Number(form.experienceYears),
        certificationId: form.certificationId || null,
        medicalFitnessRequired: form.medicalFitnessRequired,
        employmentType: form.employmentType,
        contractualPeriod: form.employmentType === "CONTRACT" ? (form.contractualPeriod || null) : null,
        vacancies: Number(form.vacancies),
        approvedById: form.approvedById || null,
        approvedByOtherText: isApprovedByOthers ? form.approvedByOtherText : null,
        approvedOn: form.approvedOn || null,
      };

      const formData = new FormData();
      formData.append("position", JSON.stringify(positionPayload));
      if (approvalDoc) {
        formData.append("approvalDoc", approvalDoc);
      }

      if (editingPosition) {
        await recruiterApiService.updatePosition(editingPosition.id, formData);
        toast.success("Position updated successfully");
      } else {
        await recruiterApiService.createPosition(formData);
        toast.success("Position added successfully");
      }
      navigate("/job-postings");
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to save position");
    } finally {
      submittingRef.current = false;
      setSaving(false);
    }
  };

  return (
    <div className="app-card">
      <div className="list-card-title-wrap mb-1">
        <i className={`bi ${viewOnly ? "bi-eye-fill" : "bi-briefcase-fill"}`} />
        <span className="list-card-title" style={{ fontSize: "1.1rem" }}>
          {viewOnly ? "View Position" : editingPosition ? "Edit Position" : "Add New Position"}
        </span>
      </div>
      <div className="page-subtitle mb-4">
        {viewOnly ? "Position details for this requisition." : "Fill in the role details below."}
      </div>
      <hr className="mb-4" style={{ borderColor: "var(--card-border)" }} />

      <fieldset disabled={viewOnly} style={{ border: 0, padding: 0, margin: 0 }}>
      <div className="row">
        <div className="col-md-6 mb-3">
          <label className="form-label">Department <span className="text-danger">*</span></label>
          <select className={`form-select ${errors.departmentId ? "is-invalid" : ""}`} value={form.departmentId} onChange={(e) => { handleDepartmentChange(e.target.value); setErrors((prev) => (prev.departmentId ? { ...prev, departmentId: undefined } : prev)); }}>
            <option value="">Select</option>
            {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          {errors.departmentId && <div className="text-danger fs-13 mt-1">{errors.departmentId}</div>}
        </div>
        <div className="col-md-6 mb-3">
          <label className="form-label">Position Title <span className="text-danger">*</span></label>
          <select
            className={`form-select ${errors.positionTitleId ? "is-invalid" : ""}`}
            value={form.positionTitleId}
            onChange={(e) => { handlePositionTitleChange(e.target.value); setErrors((prev) => (prev.positionTitleId ? { ...prev, positionTitleId: undefined } : prev)); }}
            disabled={!form.departmentId}
          >
            <option value="">{form.departmentId ? "Select" : "Select a Department first"}</option>
            {positionTitles.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          {errors.positionTitleId && <div className="text-danger fs-13 mt-1">{errors.positionTitleId}</div>}
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label">Location <span className="text-danger">*</span></label>
        <select className={`form-select ${errors.locationId ? "is-invalid" : ""}`} value={form.locationId} onChange={(e) => setField("locationId", e.target.value)}>
          <option value="">Select</option>
          {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
        {errors.locationId && <div className="text-danger fs-13 mt-1">{errors.locationId}</div>}
      </div>

      <div className="mb-3">
        <label className="form-label">Roles &amp; Responsibilities <span className="text-danger">*</span></label>
        <textarea
          className={`form-control ${errors.jobDescription ? "is-invalid" : ""}`}
          rows={4}
          value={form.jobDescription}
          onChange={(e) => setField("jobDescription", e.target.value)}
        />
        {errors.jobDescription && <div className="text-danger fs-13 mt-1">{errors.jobDescription}</div>}
      </div>

      <div className="row">
        <div className="col-md-6 mb-3">
          <label className="form-label">Education Requirement <span className="text-danger">*</span></label>
          <select className={`form-select ${errors.educationQualificationId ? "is-invalid" : ""}`} value={form.educationQualificationId} onChange={(e) => { setForm({ ...form, educationQualificationId: e.target.value, specializationId: "" }); setErrors((prev) => (prev.educationQualificationId ? { ...prev, educationQualificationId: undefined } : prev)); }}>
            <option value="">Select</option>
            {educationQualifications.map((e2) => <option key={e2.id} value={e2.id}>{e2.name}</option>)}
          </select>
          {errors.educationQualificationId && <div className="text-danger fs-13 mt-1">{errors.educationQualificationId}</div>}
        </div>
        <div className="col-md-6 mb-3">
          <label className="form-label">Specialization (optional)</label>
          <select
            className="form-select"
            value={form.specializationId}
            disabled={!form.educationQualificationId}
            onChange={(e) => setForm({ ...form, specializationId: e.target.value })}
          >
            <option value="">{form.educationQualificationId ? "Select" : "Select Education Requirement first"}</option>
            {specializations.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6 mb-3">
          <label className="form-label">Experience Required (years) <span className="text-danger">*</span></label>
          <select className={`form-select ${errors.experienceYears ? "is-invalid" : ""}`} value={form.experienceYears} onChange={(e) => setField("experienceYears", e.target.value)}>
            <option value="">Select</option>
            {EXPERIENCE_YEARS.map((y) => <option key={y} value={y}>{y} {y === 1 ? "year" : "years"}</option>)}
          </select>
          {errors.experienceYears && <div className="text-danger fs-13 mt-1">{errors.experienceYears}</div>}
        </div>
        <div className="col-md-6 mb-3">
          <label className="form-label">Certifications (optional)</label>
          <select
            className="form-select"
            value={form.certificationId}
            onChange={(e) => setForm({ ...form, certificationId: e.target.value })}
          >
            <option value="">Select</option>
            {certifications.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      <div className="row align-items-end">
        <div className="col-md-4 mb-3">
          <label className="form-label">Employment Type <span className="text-danger">*</span></label>
          <select
            className={`form-select ${errors.employmentType ? "is-invalid" : ""}`}
            value={form.employmentType}
            onChange={(e) => {
              const employmentType = e.target.value;
              setForm((prev) => ({
                ...prev,
                employmentType,
                contractualPeriod: employmentType === "CONTRACT" ? prev.contractualPeriod : "",
              }));
              setErrors((prev) => (prev.employmentType ? { ...prev, employmentType: undefined } : prev));
            }}
          >
            <option value="">Select</option>
            <option value="REGULAR">Regular</option>
            <option value="CONTRACT">Contract</option>
          </select>
          {errors.employmentType && <div className="text-danger fs-13 mt-1">{errors.employmentType}</div>}
        </div>
        {form.employmentType === "CONTRACT" && (
          <div className="col-md-4 mb-3">
            <label className="form-label">Contractual Period <span className="text-danger">*</span></label>
            <input
              className={`form-control ${errors.contractualPeriod ? "is-invalid" : ""}`}
              placeholder="e.g. 6 months"
              value={form.contractualPeriod}
              onChange={(e) => setField("contractualPeriod", e.target.value)}
            />
            {errors.contractualPeriod && <div className="text-danger fs-13 mt-1">{errors.contractualPeriod}</div>}
          </div>
        )}
        <div className="col-md-4 mb-3">
          <label className="form-label">Number of Positions to be Hired <span className="text-danger">*</span></label>
          <input
            type="number"
            min={1}
            className={`form-control ${errors.vacancies ? "is-invalid" : ""}`}
            placeholder="Enter number"
            value={form.vacancies}
            onChange={(e) => setField("vacancies", e.target.value)}
          />
          {errors.vacancies && <div className="text-danger fs-13 mt-1">{errors.vacancies}</div>}
        </div>
      </div>

      <div className="form-check mb-3">
        <input
          type="checkbox"
          className="form-check-input"
          id="medicalFitnessRequired"
          checked={form.medicalFitnessRequired}
          onChange={(e) => setForm({ ...form, medicalFitnessRequired: e.target.checked })}
        />
        <label className="form-check-label" htmlFor="medicalFitnessRequired">Medical Fitness Required</label>
      </div>

      <hr className="my-3" />
      <h6>Approval</h6>
      <div className="row">
        <div className="col-md-6 mb-3">
          <label className="form-label">Approved By <span className="text-danger">*</span></label>
          <select className={`form-select ${errors.approvedById ? "is-invalid" : ""}`} value={form.approvedById} onChange={(e) => setField("approvedById", e.target.value)}>
            <option value="">Select</option>
            {approvedByRoles.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
          {errors.approvedById && <div className="text-danger fs-13 mt-1">{errors.approvedById}</div>}
        </div>
        <div className="col-md-6 mb-3">
          <label className="form-label">Approved On <span className="text-danger">*</span></label>
          <DateInput value={form.approvedOn} max={todayStr()} onChange={(v) => setField("approvedOn", v)} />
          {errors.approvedOn && <div className="text-danger fs-13 mt-1">{errors.approvedOn}</div>}
        </div>
      </div>
      {isApprovedByOthers && (
        <div className="mb-3">
          <label className="form-label">Approver's Name <span className="text-danger">*</span></label>
          <input
            className={`form-control ${errors.approvedByOtherText ? "is-invalid" : ""}`}
            placeholder="Enter approver's name"
            value={form.approvedByOtherText}
            onChange={(e) => setField("approvedByOtherText", e.target.value)}
          />
          {errors.approvedByOtherText && <div className="text-danger fs-13 mt-1">{errors.approvedByOtherText}</div>}
        </div>
      )}
      </fieldset>

      <div className="mb-3">
        <label className="form-label d-block">Upload Approval Email/Document <span className="text-danger">*</span></label>
        {!viewOnly && (
          <>
            <input
              type="file"
              className={`form-control ${errors.approvalDoc ? "is-invalid" : ""}`}
              accept=".pdf,.docx,.png,.jpg,.jpeg"
              onChange={handleApprovalDocChange}
            />
            {errors.approvalDoc && <div className="text-danger fs-13 mt-1">{errors.approvalDoc}</div>}
            <small className="text-muted d-block">Scanned copy, email attachment, or screenshot of management approval.</small>
          </>
        )}
        {editingPosition?.approvalDocUrl && (
          <button
            type="button"
            className="btn btn-link p-0 mt-1"
            onClick={() => filePreview.openFile(editingPosition.approvalDocUrl, "Approval Document")}
          >
            <i className="bi bi-file-earmark-text me-1" /> View {viewOnly ? "" : "currently "}uploaded document
          </button>
        )}
      </div>

      <div className="d-flex justify-content-end gap-2 mt-3">
        <button className="btn btn-outline-secondary" onClick={() => navigate("/job-postings")}>
          {viewOnly ? "Back" : "Cancel"}
        </button>
        {!viewOnly && (
          <button className="btn btn-primary" disabled={saving} onClick={handleSave}>
            {saving ? (editingPosition ? "Updating..." : "Saving...") : editingPosition ? "Update Position" : "Save Position"}
          </button>
        )}
      </div>

      {autofillPrompt && (
        <ConfirmModal
          title="Apply Position Master Defaults?"
          message="This position title has default Roles & Responsibilities / Experience set up in the Position Master. Apply them here? You can still edit them afterwards."
          confirmLabel="Use Defaults"
          cancelLabel="Keep My Entries"
          onConfirm={applyAutofill}
          onCancel={() => setAutofillPrompt(null)}
        />
      )}

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

export default AddPosition;

import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import recruiterApiService from "../../core/recruiterApiService";
import masterApiService from "../../core/masterApiService";

const EMPTY_FORM = {
  departmentId: "",
  locationId: "",
  positionTitleId: "",
  jobDescription: "",
  educationQualificationId: "",
  experienceYears: "0",
  employmentType: "REGULAR",
  vacancies: 1,
  approvedById: "",
  approvedOn: "",
};

const EXPERIENCE_YEARS = Array.from({ length: 31 }, (_, i) => i);

const AddPosition = () => {
  const navigate = useNavigate();
  const { requisitionId } = useParams();
  const location = useLocation();
  const editingPosition = location.state?.position;
  const viewOnly = location.state?.viewOnly === true;

  const [departments, setDepartments] = useState([]);
  const [locations, setLocations] = useState([]);
  const [positionTitles, setPositionTitles] = useState([]);
  const [educationQualifications, setEducationQualifications] = useState([]);
  const [approvedByRoles, setApprovedByRoles] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [approvalDoc, setApprovalDoc] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      masterApiService.getDepartments(),
      masterApiService.getLocations(),
      masterApiService.getPositionTitles(),
      masterApiService.getEducationQualifications(),
      masterApiService.getApprovedByRoles(),
    ]).then(([d, l, p, e, a]) => {
      setDepartments(d.data.data || []);
      setLocations(l.data.data || []);
      setPositionTitles(p.data.data || []);
      setEducationQualifications(e.data.data || []);
      setApprovedByRoles(a.data.data || []);
    }).catch(() => toast.error("Failed to load master data"));

    if (editingPosition) {
      setForm({
        departmentId: editingPosition.departmentId,
        locationId: editingPosition.locationId,
        positionTitleId: editingPosition.positionTitleId,
        jobDescription: editingPosition.jobDescription || "",
        educationQualificationId: editingPosition.educationQualificationId || "",
        experienceYears: String(editingPosition.experienceYears ?? "0"),
        employmentType: editingPosition.employmentType || "REGULAR",
        vacancies: editingPosition.vacancies || 1,
        approvedById: editingPosition.approvedById || "",
        approvedOn: editingPosition.approvedOn || "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    if (viewOnly) return;
    if (!form.departmentId || !form.locationId || !form.positionTitleId || !form.jobDescription) {
      toast.error("Department, Location, Position Title and Job Description are required");
      return;
    }
    setSaving(true);
    try {
      const positionPayload = {
        requisitionId,
        departmentId: form.departmentId,
        locationId: form.locationId,
        positionTitleId: form.positionTitleId,
        jobDescription: form.jobDescription,
        educationQualificationId: form.educationQualificationId || null,
        experienceYears: Number(form.experienceYears),
        employmentType: form.employmentType,
        vacancies: Number(form.vacancies) || 1,
        approvedById: form.approvedById || null,
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
      setSaving(false);
    }
  };

  return (
    <div className="card p-4" style={{ maxWidth: 800 }}>
      <h4 className="mb-4">
        {viewOnly ? "View Position" : editingPosition ? "Edit Position" : "Add New Position"}
      </h4>

      <fieldset disabled={viewOnly} style={{ border: 0, padding: 0, margin: 0 }}>
      <div className="row">
        <div className="col-md-6 mb-3">
          <label className="form-label">Department *</label>
          <select className="form-select" value={form.departmentId} onChange={(e) => setForm({ ...form, departmentId: e.target.value })}>
            <option value="">Select</option>
            {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div className="col-md-6 mb-3">
          <label className="form-label">Location *</label>
          <select className="form-select" value={form.locationId} onChange={(e) => setForm({ ...form, locationId: e.target.value })}>
            <option value="">Select</option>
            {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label">Position Title *</label>
        <select className="form-select" value={form.positionTitleId} onChange={(e) => setForm({ ...form, positionTitleId: e.target.value })}>
          <option value="">Select</option>
          {positionTitles.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label">Job Description *</label>
        <textarea
          className="form-control"
          rows={4}
          value={form.jobDescription}
          onChange={(e) => setForm({ ...form, jobDescription: e.target.value })}
        />
      </div>

      <div className="row">
        <div className="col-md-6 mb-3">
          <label className="form-label">Education Requirement</label>
          <select className="form-select" value={form.educationQualificationId} onChange={(e) => setForm({ ...form, educationQualificationId: e.target.value })}>
            <option value="">Select</option>
            {educationQualifications.map((e2) => <option key={e2.id} value={e2.id}>{e2.name}</option>)}
          </select>
        </div>
        <div className="col-md-6 mb-3">
          <label className="form-label">Experience Required (years)</label>
          <select className="form-select" value={form.experienceYears} onChange={(e) => setForm({ ...form, experienceYears: e.target.value })}>
            {EXPERIENCE_YEARS.map((y) => <option key={y} value={y}>{y} {y === 1 ? "year" : "years"}</option>)}
          </select>
        </div>
      </div>

      <div className="row">
        <div className="col-md-4 mb-3">
          <label className="form-label">Employment Type</label>
          <select className="form-select" value={form.employmentType} onChange={(e) => setForm({ ...form, employmentType: e.target.value })}>
            <option value="REGULAR">Regular</option>
            <option value="CONTRACT">Contract</option>
          </select>
        </div>
        <div className="col-md-4 mb-3">
          <label className="form-label">Number of Positions to be Hired</label>
          <input
            type="number"
            min={1}
            className="form-control"
            value={form.vacancies}
            onChange={(e) => setForm({ ...form, vacancies: e.target.value })}
          />
        </div>
      </div>

      <hr className="my-3" />
      <h6>Approval</h6>
      <div className="row">
        <div className="col-md-6 mb-3">
          <label className="form-label">Approved By</label>
          <select className="form-select" value={form.approvedById} onChange={(e) => setForm({ ...form, approvedById: e.target.value })}>
            <option value="">Select</option>
            {approvedByRoles.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
        <div className="col-md-6 mb-3">
          <label className="form-label">Approved On</label>
          <input
            type="date"
            className="form-control"
            max={new Date().toISOString().split("T")[0]}
            value={form.approvedOn || ""}
            onChange={(e) => setForm({ ...form, approvedOn: e.target.value })}
          />
        </div>
      </div>
      {!viewOnly && (
        <div className="mb-3">
          <label className="form-label">Upload Approval Email/Document</label>
          <input
            type="file"
            className="form-control"
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
            onChange={(e) => setApprovalDoc(e.target.files[0])}
          />
          <small className="text-muted">Scanned copy, email attachment, or screenshot of management approval.</small>
        </div>
      )}
      </fieldset>

      <div className="d-flex justify-content-end gap-2 mt-3">
        <button className="btn btn-outline-secondary" onClick={() => navigate("/job-postings")}>
          {viewOnly ? "Back" : "Cancel"}
        </button>
        {!viewOnly && (
          <button className="btn btn-primary" disabled={saving} onClick={handleSave}>
            {saving ? "Saving..." : "Save Position"}
          </button>
        )}
      </div>
    </div>
  );
};

export default AddPosition;

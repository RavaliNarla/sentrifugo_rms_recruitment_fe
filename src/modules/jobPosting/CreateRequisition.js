import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import recruiterApiService from "../../core/recruiterApiService";
import masterApiService from "../../core/masterApiService";
import DateInput from "../../shared/DateInput";

// SCL_02: Start Date / Expected Fulfilment Date must be future dates - "future" means after today.
const tomorrowStr = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
};

const emptyForm = () => ({
  title: "",
  description: "",
  startDate: "",
  expectedFulfilmentDate: "",
  departmentId: "",
  locationId: "",
});

const CreateRequisition = () => {
  const navigate = useNavigate();
  const routeLocation = useLocation();
  const editingRequisition = routeLocation.state?.requisition;
  const viewOnly = routeLocation.state?.viewOnly === true;
  const returnTo = routeLocation.state?.returnTo || "/job-postings";

  const [form, setForm] = useState(
    editingRequisition
      ? {
          title: editingRequisition.title,
          description: editingRequisition.description,
          startDate: editingRequisition.startDate,
          expectedFulfilmentDate: editingRequisition.expectedFulfilmentDate,
          departmentId: editingRequisition.departmentId || "",
          locationId: editingRequisition.locationId || "",
        }
      : emptyForm()
  );
  const [departments, setDepartments] = useState([]);
  const [locations, setLocations] = useState([]);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const submittingRef = useRef(false);
  const scopeLocked = Boolean(editingRequisition);

  useEffect(() => {
    masterApiService.getDepartments()
      .then((res) => setDepartments(res.data.data || []))
      .catch(() => toast.error("Failed to load departments"));
    masterApiService.getLocations()
      .then((res) => setLocations(res.data.data || []))
      .catch(() => toast.error("Failed to load locations"));
  }, []);

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  };

  const validate = () => {
    const next = {};
    if (!form.title.trim()) next.title = "Requisition Title is required";
    if (!form.description.trim()) next.description = "Description is required";
    if (!form.startDate) {
      next.startDate = "Start Date is required";
    } else if (form.startDate < tomorrowStr()) {
      next.startDate = "Start Date must be a future date";
    }
    if (!form.expectedFulfilmentDate) {
      next.expectedFulfilmentDate = "Expected Fulfilment Date is required";
    } else if (form.expectedFulfilmentDate < tomorrowStr()) {
      next.expectedFulfilmentDate = "Expected Fulfilment Date must be a future date";
    } else if (form.startDate && form.expectedFulfilmentDate < form.startDate) {
      next.expectedFulfilmentDate = "Expected Fulfilment Date cannot be before the Start Date";
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
      const payload = {
        title: form.title,
        description: form.description,
        startDate: form.startDate,
        expectedFulfilmentDate: form.expectedFulfilmentDate,
        departmentId: form.departmentId || null,
        locationId: form.locationId || null,
      };
      if (editingRequisition) {
        await recruiterApiService.updateRequisition(editingRequisition.id, payload);
        toast.success("Requisition updated successfully");
        navigate("/job-postings");
      } else {
        const res = await recruiterApiService.createRequisition(payload);
        toast.success("Requisition added successfully");
        navigate(`/job-postings/${res.data.data.id}/add-position`);
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to save requisition");
    } finally {
      submittingRef.current = false;
      setSaving(false);
    }
  };

  const deptLabel = (d) => (d.code ? `${d.name} (${d.code})` : d.name);
  const locLabel = (l) => (l.code ? `${l.name} (${l.code})` : l.name);

  return (
    <div className="app-card">
      <div className="list-card-title-wrap mb-1">
        <i className={`bi ${viewOnly ? "bi-eye-fill" : "bi-file-earmark-plus-fill"}`} />
        <span className="list-card-title" style={{ fontSize: "1.1rem" }}>
          {viewOnly ? "View Requisition" : editingRequisition ? "Edit Requisition" : "Create New Requisition"}
        </span>
      </div>
      <div className="page-subtitle mb-4">
        {viewOnly
          ? "Requisition details."
          : editingRequisition
          ? "Update the requisition details below."
          : "Fill in the details below to raise a new hiring requisition."}
      </div>
      <hr className="mb-4" style={{ borderColor: "var(--card-border)" }} />

      <fieldset disabled={viewOnly} style={{ border: 0, padding: 0, margin: 0 }}>
      <div className="row">
        <div className="col-md-6 mb-3">
          <label className="form-label">Requisition Title <span className="text-danger">*</span></label>
          <input
            className={`form-control ${errors.title ? "is-invalid" : ""}`}
            placeholder="Enter Requisition Title"
            value={form.title}
            onChange={(e) => setField("title", e.target.value)}
          />
          <div className="text-danger fs-13 mt-1" style={{ minHeight: "18px" }}>{errors.title || ""}</div>
        </div>
        <div className="col-md-3 mb-3">
          <label className="form-label">Start Date <span className="text-danger">*</span></label>
          <DateInput
            value={form.startDate}
            min={tomorrowStr()}
            disabled={viewOnly}
            onChange={(v) => setField("startDate", v)}
          />
          <div className="text-danger fs-13 mt-1" style={{ minHeight: "18px" }}>{errors.startDate || ""}</div>
        </div>
        <div className="col-md-3 mb-3">
          <label className="form-label">Expected Fulfilment Date <span className="text-danger">*</span></label>
          <DateInput
            value={form.expectedFulfilmentDate}
            min={form.startDate || tomorrowStr()}
            disabled={viewOnly}
            onChange={(v) => setField("expectedFulfilmentDate", v)}
          />
          <div className="text-danger fs-13 mt-1" style={{ minHeight: "18px" }}>{errors.expectedFulfilmentDate || ""}</div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6 mb-3">
          <label className="form-label">Department</label>
          <select
            className="form-select"
            value={form.departmentId}
            disabled={viewOnly || scopeLocked}
            onChange={(e) => setField("departmentId", e.target.value)}
          >
            <option value="">Any / Not Fixed</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{deptLabel(d)}</option>
            ))}
          </select>
        </div>
        <div className="col-md-6 mb-3">
          <label className="form-label">Location</label>
          <select
            className="form-select"
            value={form.locationId}
            disabled={viewOnly || scopeLocked}
            onChange={(e) => setField("locationId", e.target.value)}
          >
            <option value="">Any / Not Fixed</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>{locLabel(l)}</option>
            ))}
          </select>
        </div>
      </div>
      {!scopeLocked && (
        <small className="text-muted d-block mb-3" style={{ marginTop: "-0.5rem" }}>
          If Department or Location is selected, positions under this requisition use those values (and the requisition code includes their 3-letter codes).
        </small>
      )}
      {scopeLocked && (
        <small className="text-muted d-block mb-3" style={{ marginTop: "-0.5rem" }}>
          Department and Location were set when this requisition was created.
        </small>
      )}

      <div className="mb-3">
        <label className="form-label">Description <span className="text-danger">*</span></label>
        <textarea
          className={`form-control ${errors.description ? "is-invalid" : ""}`}
          rows={4}
          placeholder="Enter Requisition Description"
          value={form.description}
          onChange={(e) => setField("description", e.target.value)}
        />
        <div className="text-danger fs-13 mt-1" style={{ minHeight: "18px" }}>{errors.description || ""}</div>
      </div>
      </fieldset>

      <div className="d-flex justify-content-end gap-2 mt-3">
        <button className="btn btn-outline-secondary" onClick={() => navigate(returnTo)}>
          {viewOnly ? "Back" : "Cancel"}
        </button>
        {!viewOnly && (
          <button className="btn btn-primary" disabled={saving} onClick={handleSave}>
            {saving ? "Saving..." : editingRequisition ? "Save Changes" : "Save & Add Position"}
          </button>
        )}
      </div>
    </div>
  );
};

export default CreateRequisition;

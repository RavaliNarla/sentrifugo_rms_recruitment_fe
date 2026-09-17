import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import recruiterApiService from "../../core/recruiterApiService";
import DateInput from "../../shared/DateInput";

// SCL_02: Start Date / Expected Fulfilment Date must be future dates - "future" means after today.
const tomorrowStr = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
};

const CreateRequisition = () => {
  const navigate = useNavigate();
  const routeLocation = useLocation();
  const editingRequisition = routeLocation.state?.requisition;
  const viewOnly = routeLocation.state?.viewOnly === true;

  const [form, setForm] = useState(
    editingRequisition
      ? {
          title: editingRequisition.title,
          description: editingRequisition.description,
          startDate: editingRequisition.startDate,
          expectedFulfilmentDate: editingRequisition.expectedFulfilmentDate,
        }
      : { title: "", description: "", startDate: "", expectedFulfilmentDate: "" }
  );
  const [errors, setErrors] = useState({});

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
    if (!validate()) return;
    try {
      if (editingRequisition) {
        await recruiterApiService.updateRequisition(editingRequisition.id, form);
        toast.success("Requisition updated successfully");
        navigate("/job-postings");
      } else {
        const res = await recruiterApiService.createRequisition(form);
        toast.success("Requisition created successfully");
        navigate(`/job-postings/${res.data.data.id}/add-position`);
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to save requisition");
    }
  };

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
        <div className="col-md-8 mb-3">
          <label className="form-label">Requisition Title <span className="text-danger">*</span></label>
          <input
            className={`form-control ${errors.title ? "is-invalid" : ""}`}
            placeholder="Enter Requisition Title"
            value={form.title}
            onChange={(e) => setField("title", e.target.value)}
          />
          {errors.title ? (
            <div className="text-danger fs-13 mt-1">{errors.title}</div>
          ) : (
            <small className="text-muted">Use a clear, searchable title.</small>
          )}
        </div>
        <div className="col-md-4 mb-3">
          <label className="form-label">Start Date <span className="text-danger">*</span></label>
          <DateInput
            value={form.startDate}
            min={tomorrowStr()}
            onChange={(v) => setField("startDate", v)}
          />
          {errors.startDate && <div className="text-danger fs-13 mt-1">{errors.startDate}</div>}
        </div>
      </div>

      <div className="row">
        <div className="col-md-8 mb-3">
          <label className="form-label">Description <span className="text-danger">*</span></label>
          <textarea
            className={`form-control ${errors.description ? "is-invalid" : ""}`}
            rows={5}
            placeholder="Enter Requisition Description"
            value={form.description}
            onChange={(e) => setField("description", e.target.value)}
          />
          {errors.description && <div className="text-danger fs-13 mt-1">{errors.description}</div>}
        </div>
        <div className="col-md-4 mb-3">
          <label className="form-label">Expected Fulfilment Date <span className="text-danger">*</span></label>
          <DateInput
            value={form.expectedFulfilmentDate}
            min={form.startDate || tomorrowStr()}
            onChange={(v) => setField("expectedFulfilmentDate", v)}
          />
          {errors.expectedFulfilmentDate ? (
            <div className="text-danger fs-13 mt-1">{errors.expectedFulfilmentDate}</div>
          ) : (
            <small className="text-muted">Target date by which this requirement should be filled.</small>
          )}
        </div>
      </div>
      </fieldset>

      <div className="d-flex justify-content-end gap-2 mt-3">
        <button className="btn btn-outline-secondary" onClick={() => navigate("/job-postings")}>
          {viewOnly ? "Back" : "Cancel"}
        </button>
        {!viewOnly && (
          <button className="btn btn-primary" onClick={handleSave}>{editingRequisition ? "Save Changes" : "Save & Add Position"}</button>
        )}
      </div>
    </div>
  );
};

export default CreateRequisition;

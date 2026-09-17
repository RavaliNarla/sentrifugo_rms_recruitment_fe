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

  const handleSave = async () => {
    if (!form.title || !form.description || !form.startDate || !form.expectedFulfilmentDate) {
      toast.error("All fields are required");
      return;
    }
    if (form.startDate < tomorrowStr()) {
      toast.error("Start Date must be a future date");
      return;
    }
    if (form.expectedFulfilmentDate < tomorrowStr()) {
      toast.error("Expected Fulfilment Date must be a future date");
      return;
    }
    if (form.expectedFulfilmentDate < form.startDate) {
      toast.error("Expected Fulfilment Date cannot be before the Start Date");
      return;
    }
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
        <i className="bi bi-file-earmark-plus-fill" />
        <span className="list-card-title" style={{ fontSize: "1.1rem" }}>{editingRequisition ? "Edit Requisition" : "Create New Requisition"}</span>
      </div>
      <div className="page-subtitle mb-4">
        {editingRequisition ? "Update the requisition details below." : "Fill in the details below to raise a new hiring requisition."}
      </div>
      <hr className="mb-4" style={{ borderColor: "var(--card-border)" }} />

      <div className="row">
        <div className="col-md-8 mb-3">
          <label className="form-label">Requisition Title <span className="text-danger">*</span></label>
          <input
            className="form-control"
            placeholder="Enter Requisition Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <small className="text-muted">Use a clear, searchable title.</small>
        </div>
        <div className="col-md-4 mb-3">
          <label className="form-label">Start Date <span className="text-danger">*</span></label>
          <DateInput
            value={form.startDate}
            min={tomorrowStr()}
            onChange={(v) => setForm({ ...form, startDate: v })}
          />
        </div>
      </div>

      <div className="row">
        <div className="col-md-8 mb-3">
          <label className="form-label">Description <span className="text-danger">*</span></label>
          <textarea
            className="form-control"
            rows={5}
            placeholder="Enter Requisition Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <div className="col-md-4 mb-3">
          <label className="form-label">Expected Fulfilment Date <span className="text-danger">*</span></label>
          <DateInput
            value={form.expectedFulfilmentDate}
            min={form.startDate || tomorrowStr()}
            onChange={(v) => setForm({ ...form, expectedFulfilmentDate: v })}
          />
          <small className="text-muted">Target date by which this requirement should be filled.</small>
        </div>
      </div>

      <div className="d-flex justify-content-end gap-2 mt-3">
        <button className="btn btn-outline-secondary" onClick={() => navigate("/job-postings")}>Cancel</button>
        <button className="btn btn-primary" onClick={handleSave}>{editingRequisition ? "Save Changes" : "Save & Add Position"}</button>
      </div>
    </div>
  );
};

export default CreateRequisition;

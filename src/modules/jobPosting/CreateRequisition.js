import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import recruiterApiService from "../../core/recruiterApiService";

const CreateRequisition = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    startDate: "",
    expectedFulfilmentDate: "",
  });

  const handleSave = async () => {
    if (!form.title || !form.description || !form.startDate || !form.expectedFulfilmentDate) {
      toast.error("All fields are required");
      return;
    }
    try {
      const res = await recruiterApiService.createRequisition(form);
      toast.success("Requisition created successfully");
      navigate(`/job-postings/${res.data.data.id}/add-position`);
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to create requisition");
    }
  };

  return (
    <div className="card p-4" style={{ maxWidth: 700 }}>
      <h4 className="mb-4">Create New Requisition</h4>

      <div className="mb-3">
        <label className="form-label">Requisition Title *</label>
        <input
          className="form-control"
          placeholder="Enter Requisition Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <small className="text-muted">Use a clear, searchable title.</small>
      </div>

      <div className="mb-3">
        <label className="form-label">Description *</label>
        <textarea
          className="form-control"
          rows={4}
          placeholder="Enter Requisition Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </div>

      <div className="row">
        <div className="col-md-6 mb-3">
          <label className="form-label">Start Date *</label>
          <input
            type="date"
            className="form-control"
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
          />
        </div>
        <div className="col-md-6 mb-3">
          <label className="form-label">Expected Fulfilment Date *</label>
          <input
            type="date"
            className="form-control"
            value={form.expectedFulfilmentDate}
            onChange={(e) => setForm({ ...form, expectedFulfilmentDate: e.target.value })}
          />
          <small className="text-muted">Target date by which this requirement should be filled.</small>
        </div>
      </div>

      <div className="d-flex justify-content-end gap-2 mt-3">
        <button className="btn btn-outline-secondary" onClick={() => navigate("/job-postings")}>Cancel</button>
        <button className="btn btn-primary" onClick={handleSave}>Save & Add Position</button>
      </div>
    </div>
  );
};

export default CreateRequisition;

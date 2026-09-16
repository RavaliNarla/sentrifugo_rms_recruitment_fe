import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import masterApiService from "../../core/masterApiService";

const EXPERIENCE_YEARS = Array.from({ length: 31 }, (_, i) => i);

const EMPTY_FORM = {
  name: "",
  departmentId: "",
  jobDescription: "",
  minimumExperienceYears: "0",
};

const PositionTitlesPage = () => {
  const [items, setItems] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewOnly, setViewOnly] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await masterApiService.getPositionTitles();
      setItems(res.data.data || []);
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    masterApiService.getDepartments()
      .then((d) => setDepartments(d.data.data || []))
      .catch(() => toast.error("Failed to load master data"));
  }, []);

  const openAdd = () => {
    setEditing(null);
    setViewOnly(false);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setViewOnly(false);
    setForm({
      name: item.name || "",
      departmentId: item.departmentId || "",
      jobDescription: item.jobDescription || "",
      minimumExperienceYears: String(item.minimumExperienceYears ?? "0"),
    });
    setShowModal(true);
  };

  const openView = (item) => {
    openEdit(item);
    setViewOnly(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.departmentId) {
      toast.error("Position Title and Department are required");
      return;
    }
    const payload = {
      name: form.name,
      departmentId: form.departmentId,
      jobDescription: form.jobDescription || null,
      minimumExperienceYears: Number(form.minimumExperienceYears),
    };
    try {
      if (editing) {
        await masterApiService.updatePositionTitle(editing.id, payload);
        toast.success("Position title updated successfully");
      } else {
        await masterApiService.addPositionTitle(payload);
        toast.success("Position title added successfully");
      }
      setShowModal(false);
      loadData();
    } catch (e) {
      toast.error(e.response?.data?.message || "Save failed");
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.name}"?`)) return;
    try {
      await masterApiService.deletePositionTitle(item.id);
      toast.success("Position title deleted successfully");
      loadData();
    } catch (e) {
      toast.error(e.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="app-card">
      <div className="list-card-header">
        <div className="list-card-title-wrap">
          <i className="bi bi-collection-fill" />
          <span className="list-card-title">Position Title records</span>
          <span className="list-card-count">({items.length} record{items.length === 1 ? "" : "s"})</span>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <i className="bi bi-plus-lg" /> Add
        </button>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <table className="table table-hover align-middle">
          <thead>
            <tr className="text-muted fs-13">
              <th>#</th>
              <th>Department</th>
              <th>Position Title</th>
              <th>Job Description</th>
              <th style={{ width: 140 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={item.id}>
                <td>{idx + 1}</td>
                <td>{item.departmentName || "-"}</td>
                <td>{item.name}</td>
                <td>
                  <div style={{ maxWidth: 320, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {item.jobDescription || "-"}
                  </div>
                </td>
                <td>
                  <button className="icon-btn-circle me-2" title="View" onClick={() => openView(item)}>
                    <i className="bi bi-eye" />
                  </button>
                  <button className="icon-btn-circle me-2" title="Edit" onClick={() => openEdit(item)}>
                    <i className="bi bi-pencil" />
                  </button>
                  <button className="icon-btn-circle danger" title="Delete" onClick={() => handleDelete(item)}>
                    <i className="bi bi-trash" />
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-muted py-4">
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {showModal && (
        <div className="modal show d-block" style={{ background: "rgba(15,60,30,0.45)" }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {viewOnly ? "View" : editing ? "Edit" : "Add"} Position Title
                </h5>
                <button className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <fieldset disabled={viewOnly} style={{ border: 0, padding: 0, margin: 0 }}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Department *</label>
                      <select
                        className="form-select"
                        value={form.departmentId}
                        onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
                      >
                        <option value="">Select</option>
                        {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Position Title *</label>
                      <input
                        className="form-control"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Minimum Experience (years)</label>
                    <select
                      className="form-select"
                      value={form.minimumExperienceYears}
                      onChange={(e) => setForm({ ...form, minimumExperienceYears: e.target.value })}
                    >
                      {EXPERIENCE_YEARS.map((y) => <option key={y} value={y}>{y} {y === 1 ? "year" : "years"}</option>)}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Job Description</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={form.jobDescription}
                      onChange={(e) => setForm({ ...form, jobDescription: e.target.value })}
                    />
                  </div>
                </div>
              </fieldset>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  {viewOnly ? "Close" : "Cancel"}
                </button>
                {!viewOnly && (
                  <button className="btn btn-primary" onClick={handleSave}>Save</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PositionTitlesPage;

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import masterApiService from "../../core/masterApiService";

const EMPTY_FORM = { name: "", educationQualificationId: "" };

/**
 * Specializations (e.g. "Computer Science and Engineering", "Mechanical Engineering"
 * for a B.Tech education level) - optional field on Add Position, always optional here too.
 */
const SpecializationsPage = () => {
  const [items, setItems] = useState([]);
  const [educationQualifications, setEducationQualifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await masterApiService.getSpecializations();
      setItems(res.data.data || []);
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    masterApiService.getEducationQualifications()
      .then((res) => setEducationQualifications(res.data.data || []))
      .catch(() => toast.error("Failed to load education qualifications"));
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({ name: item.name, educationQualificationId: item.educationQualificationId || "" });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    const payload = { name: form.name, educationQualificationId: form.educationQualificationId || null };
    try {
      if (editing) {
        await masterApiService.updateSpecialization(editing.id, payload);
        toast.success("Specialization updated successfully");
      } else {
        await masterApiService.addSpecialization(payload);
        toast.success("Specialization added successfully");
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
      await masterApiService.deleteSpecialization(item.id);
      toast.success("Specialization deleted successfully");
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
          <span className="list-card-title">Specialization records</span>
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
              <th>Name</th>
              <th>Education Level</th>
              <th style={{ width: 120 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={item.id}>
                <td>{idx + 1}</td>
                <td>{item.name}</td>
                <td>{item.educationQualificationName || <span className="text-muted">General / Any</span>}</td>
                <td>
                  <button className="icon-btn-circle me-2" onClick={() => openEdit(item)}>
                    <i className="bi bi-pencil" />
                  </button>
                  <button className="icon-btn-circle danger" onClick={() => handleDelete(item)}>
                    <i className="bi bi-trash" />
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center text-muted py-4">No records found</td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {showModal && (
        <div className="modal show d-block" style={{ background: "rgba(15,60,30,0.45)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editing ? "Edit" : "Add"} Specialization</h5>
                <button className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Name <span className="text-danger">*</span></label>
                  <input
                    className="form-control"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    autoFocus
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Education Level (optional)</label>
                  <select
                    className="form-select"
                    value={form.educationQualificationId}
                    onChange={(e) => setForm({ ...form, educationQualificationId: e.target.value })}
                  >
                    <option value="">General / Any</option>
                    {educationQualifications.map((e2) => <option key={e2.id} value={e2.id}>{e2.name}</option>)}
                  </select>
                  <small className="text-muted">Leave as "General / Any" if this specialization isn't tied to one specific education level.</small>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSave}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpecializationsPage;

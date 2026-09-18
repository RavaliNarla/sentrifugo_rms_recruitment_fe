import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import masterApiService from "../../core/masterApiService";
import ConfirmModal from "../../shared/ConfirmModal";

const EMPTY_FORM = { name: "", stateId: "", address: "" };

const LocationsPage = () => {
  const [locations, setLocations] = useState([]);
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const submittingRef = useRef(false);
  const [confirmState, setConfirmState] = useState({ show: false, message: "", onConfirm: null });

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  };

  const askConfirm = (message, action) => setConfirmState({ show: true, message, onConfirm: action });
  const closeConfirm = () => setConfirmState({ show: false, message: "", onConfirm: null });

  const loadData = async () => {
    setLoading(true);
    try {
      const [locRes, stateRes] = await Promise.all([
        masterApiService.getLocations(),
        masterApiService.getStates(),
      ]);
      setLocations(locRes.data.data || []);
      setStates(stateRes.data.data || []);
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setShowModal(true);
  };

  const openEdit = (loc) => {
    setEditing(loc);
    setForm({ name: loc.name, stateId: loc.stateId, address: loc.address || "" });
    setErrors({});
    setShowModal(true);
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Location Name is required";
    if (!form.stateId) next.stateId = "State is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async () => {
    if (submittingRef.current) return;
    if (!validate()) return;
    submittingRef.current = true;
    setSaving(true);
    try {
      if (editing) {
        await masterApiService.updateLocation(editing.id, form);
        toast.success("Location updated successfully");
      } else {
        await masterApiService.addLocation(form);
        toast.success("Location added successfully");
      }
      setShowModal(false);
      loadData();
    } catch (e) {
      toast.error(e.response?.data?.message || "Save failed");
    } finally {
      submittingRef.current = false;
      setSaving(false);
    }
  };

  const handleDelete = (loc) => {
    askConfirm(`Are you sure you want to delete the location "${loc.name}"?`, async () => {
      closeConfirm();
      try {
        await masterApiService.deleteLocation(loc.id);
        toast.success("Location deleted successfully");
        loadData();
      } catch (e) {
        toast.error(e.response?.data?.message || "Delete failed");
      }
    });
  };

  return (
    <div className="app-card">
      <div className="list-card-header">
        <div className="list-card-title-wrap">
          <i className="bi bi-geo-alt-fill" />
          <span className="list-card-title">Location records</span>
          <span className="list-card-count">({locations.length} record{locations.length === 1 ? "" : "s"})</span>
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
              <th>Location Name</th>
              <th>State</th>
              <th>Address</th>
              <th style={{ width: 120 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {locations.map((loc, idx) => (
              <tr key={loc.id}>
                <td>{idx + 1}</td>
                <td>{loc.name}</td>
                <td>{loc.stateName}</td>
                <td>{loc.address}</td>
                <td>
                  <button className="icon-btn-circle me-2" onClick={() => openEdit(loc)}>
                    <i className="bi bi-pencil" />
                  </button>
                  <button className="icon-btn-circle danger" onClick={() => handleDelete(loc)}>
                    <i className="bi bi-trash" />
                  </button>
                </td>
              </tr>
            ))}
            {locations.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-muted py-4">No locations found</td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {showModal && (
        <div className="modal show d-block" style={{ background: "rgba(0, 0, 0, 0.45)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editing ? "Edit" : "Add"} Location</h5>
                <button className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Location Name <span className="text-danger">*</span></label>
                  <input
                    className={`form-control ${errors.name ? "is-invalid" : ""}`}
                    value={form.name}
                    onChange={(e) => setField("name", e.target.value)}
                  />
                  <div className="text-danger fs-13 mt-1" style={{ minHeight: "18px" }}>{errors.name || ""}</div>
                </div>
                <div className="mb-3">
                  <label className="form-label">State <span className="text-danger">*</span></label>
                  <select
                    className={`form-select ${errors.stateId ? "is-invalid" : ""}`}
                    value={form.stateId}
                    onChange={(e) => setField("stateId", e.target.value)}
                  >
                    <option value="">Select State</option>
                    {states.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  <div className="text-danger fs-13 mt-1" style={{ minHeight: "18px" }}>{errors.stateId || ""}</div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Address</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn btn-primary" disabled={saving} onClick={handleSave}>
                  {saving ? "Saving..." : editing ? "Update" : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        show={confirmState.show}
        message={confirmState.message}
        onConfirm={confirmState.onConfirm}
        onCancel={closeConfirm}
      />
    </div>
  );
};

export default LocationsPage;

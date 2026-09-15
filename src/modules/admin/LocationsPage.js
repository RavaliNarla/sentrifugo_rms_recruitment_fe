import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import masterApiService from "../../core/masterApiService";

const EMPTY_FORM = { name: "", stateId: "", address: "" };

const LocationsPage = () => {
  const [locations, setLocations] = useState([]);
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

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
    setShowModal(true);
  };

  const openEdit = (loc) => {
    setEditing(loc);
    setForm({ name: loc.name, stateId: loc.stateId, address: loc.address || "" });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.stateId) {
      toast.error("Location name and state are required");
      return;
    }
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
    }
  };

  const handleDelete = async (loc) => {
    if (!window.confirm(`Delete "${loc.name}"?`)) return;
    try {
      await masterApiService.deleteLocation(loc.id);
      toast.success("Location deleted successfully");
      loadData();
    } catch (e) {
      toast.error(e.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="app-card">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="page-title m-0">Locations</h5>
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
        <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editing ? "Edit" : "Add"} Location</h5>
                <button className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Location Name</label>
                  <input
                    className="form-control"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">State</label>
                  <select
                    className="form-select"
                    value={form.stateId}
                    onChange={(e) => setForm({ ...form, stateId: e.target.value })}
                  >
                    <option value="">Select State</option>
                    {states.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
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
                <button className="btn btn-primary" onClick={handleSave}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationsPage;

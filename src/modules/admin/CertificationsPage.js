import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import masterApiService from "../../core/masterApiService";
import ConfirmModal from "../../shared/ConfirmModal";

const EMPTY_FORM = { name: "" };

/**
 * Certification master (e.g. "NCCBM Certified Quality Controller") - optional,
 * single-select field on Add Position, replacing the old free-text input.
 */
const CertificationsPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [confirmState, setConfirmState] = useState({ show: false, message: "", onConfirm: null });

  const askConfirm = (message, action) => setConfirmState({ show: true, message, onConfirm: action });
  const closeConfirm = () => setConfirmState({ show: false, message: "", onConfirm: null });

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await masterApiService.getCertifications();
      setItems(res.data.data || []);
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

  const openEdit = (item) => {
    setEditing(item);
    setForm({ name: item.name });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    try {
      if (editing) {
        await masterApiService.updateCertification(editing.id, form);
        toast.success("Certification updated successfully");
      } else {
        await masterApiService.addCertification(form);
        toast.success("Certification added successfully");
      }
      setShowModal(false);
      loadData();
    } catch (e) {
      toast.error(e.response?.data?.message || "Save failed");
    }
  };

  const handleDelete = (item) => {
    askConfirm(`Are you sure you want to delete the certification "${item.name}"?`, async () => {
      closeConfirm();
      try {
        await masterApiService.deleteCertification(item.id);
        toast.success("Certification deleted successfully");
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
          <i className="bi bi-collection-fill" />
          <span className="list-card-title">Certification records</span>
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
              <th style={{ width: 120 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={item.id}>
                <td>{idx + 1}</td>
                <td>{item.name}</td>
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
                <td colSpan={3} className="text-center text-muted py-4">No records found</td>
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
                <h5 className="modal-title">{editing ? "Edit" : "Add"} Certification</h5>
                <button className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <div className="modal-body">
                <label className="form-label">Name <span className="text-danger">*</span></label>
                <input
                  className="form-control"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  autoFocus
                />
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSave}>{editing ? "Update" : "Save"}</button>
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

export default CertificationsPage;

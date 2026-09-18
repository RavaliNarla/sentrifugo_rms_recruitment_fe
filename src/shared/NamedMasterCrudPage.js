import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import ConfirmModal from "./ConfirmModal";

/**
 * Generic list + add/edit/delete screen for simple "id + name" master data
 * (Departments, Position Titles, Education Qualifications).
 */
const NamedMasterCrudPage = ({ title, getAll, add, update, remove }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");
  const [saving, setSaving] = useState(false);
  const submittingRef = useRef(false);
  const [confirmState, setConfirmState] = useState({ show: false, message: "", onConfirm: null });

  const askConfirm = (message, action) => setConfirmState({ show: true, message, onConfirm: action });
  const closeConfirm = () => setConfirmState({ show: false, message: "", onConfirm: null });

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getAll();
      setItems(res.data.data || []);
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openAdd = () => {
    setEditing(null);
    setName("");
    setNameError("");
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setName(item.name);
    setNameError("");
    setShowModal(true);
  };

  const handleSave = async () => {
    if (submittingRef.current) return;
    if (!name.trim()) {
      setNameError("Name is required");
      return;
    }
    submittingRef.current = true;
    setSaving(true);
    try {
      if (editing) {
        await update(editing.id, { name });
        toast.success(`${title} updated successfully`);
      } else {
        await add({ name });
        toast.success(`${title} added successfully`);
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

  const handleDelete = (item) => {
    askConfirm(`Are you sure you want to delete the ${title.toLowerCase()} "${item.name}"?`, async () => {
      closeConfirm();
      try {
        await remove(item.id);
        toast.success(`${title} deleted successfully`);
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
          <span className="list-card-title">{title} records</span>
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
                <td colSpan={3} className="text-center text-muted py-4">
                  No records found
                </td>
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
                <h5 className="modal-title">{editing ? "Edit" : "Add"} {title}</h5>
                <button className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <div className="modal-body">
                <label className="form-label">Name</label>
                <input
                  className={`form-control ${nameError ? "is-invalid" : ""}`}
                  value={name}
                  onChange={(e) => { setName(e.target.value); setNameError(""); }}
                  autoFocus
                />
                <div className="text-danger fs-13 mt-1" style={{ minHeight: "18px" }}>{nameError || ""}</div>
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

export default NamedMasterCrudPage;

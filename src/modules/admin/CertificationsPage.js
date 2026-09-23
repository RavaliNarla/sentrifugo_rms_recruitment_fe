import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import masterApiService from "../../core/masterApiService";
import ConfirmModal from "../../shared/ConfirmModal";
import Pagination from "../../shared/Pagination";

const EMPTY_FORM = { name: "" };

/**
 * Certification master (e.g. "NCCBM Certified Quality Controller") - optional,
 * single-select field on Add Position, replacing the old free-text input.
 */
const CertificationsPage = () => {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [nameError, setNameError] = useState("");
  const [saving, setSaving] = useState(false);
  const [searchText, setSearchText] = useState("");
  const submittingRef = useRef(false);
  const [confirmState, setConfirmState] = useState({ show: false, message: "", onConfirm: null });

  const askConfirm = (message, action) => setConfirmState({ show: true, message, onConfirm: action });
  const closeConfirm = () => setConfirmState({ show: false, message: "", onConfirm: null });

  // Guards against overlapping fetches (e.g. React StrictMode's dev-only double-invoke on mount).
  const loadInFlightRef = useRef(false);
  const loadData = async (search, pageArg, sizeArg) => {
    if (loadInFlightRef.current) return;
    loadInFlightRef.current = true;
    setLoading(true);
    try {
      const res = await masterApiService.searchCertifications(search, pageArg ?? page, sizeArg ?? size);
      const data = res.data.data || {};
      setItems(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
      loadInFlightRef.current = false;
    }
  };

  useEffect(() => {
    loadData(searchText, page, size);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size]);

  // Search is performed server-side - only reload (and jump back to page 1) on a genuine
  // searchText change, not on mount.
  const prevSearchTextRef = useRef(searchText);
  useEffect(() => {
    if (prevSearchTextRef.current === searchText) return;
    prevSearchTextRef.current = searchText;
    const timeout = setTimeout(() => {
      setPage(0);
      loadData(searchText, 0, size);
    }, 400);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setNameError("");
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({ name: item.name });
    setNameError("");
    setShowModal(true);
  };

  const handleSave = async () => {
    if (submittingRef.current) return;
    if (!form.name.trim()) {
      setNameError("Name is required");
      return;
    }
    submittingRef.current = true;
    setSaving(true);
    try {
      if (editing) {
        await masterApiService.updateCertification(editing.id, form);
        toast.success("Certification updated successfully");
      } else {
        await masterApiService.addCertification(form);
        toast.success("Certification added successfully");
      }
      setShowModal(false);
      loadData(searchText, page, size);
    } catch (e) {
      toast.error(e.response?.data?.message || "Save failed");
    } finally {
      submittingRef.current = false;
      setSaving(false);
    }
  };

  const handleDelete = (item) => {
    askConfirm(`Are you sure you want to delete the certification "${item.name}"?`, async () => {
      closeConfirm();
      try {
        await masterApiService.deleteCertification(item.id);
        toast.success("Certification deleted successfully");
        loadData(searchText, page, size);
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
          <span className="list-card-count">({totalElements} record{totalElements === 1 ? "" : "s"})</span>
        </div>
        <div className="d-flex align-items-center gap-2">
          <div className="input-group input-group-sm" style={{ width: 220 }}>
            <span className="input-group-text bg-white"><i className="bi bi-search" /></span>
            <input
              className="form-control"
              placeholder="Search certifications..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" onClick={openAdd}>
            <i className="bi bi-plus-lg" /> Add
          </button>
        </div>
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
                <td>{page * size + idx + 1}</td>
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

      <Pagination page={page} totalPages={totalPages} onChange={setPage} size={size} onSizeChange={(s) => { setSize(s); setPage(0); }} />

      {showModal && (
        <div className="modal show d-block" style={{ background: "rgba(0, 0, 0, 0.45)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editing ? "Edit" : "Add"} Certification</h5>
                <button className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <div className="modal-body">
                <label className="form-label">Name <span className="text-danger">*</span></label>
                <input
                  className={`form-control ${nameError ? "is-invalid" : ""}`}
                  value={form.name}
                  onChange={(e) => { setForm({ ...form, name: e.target.value }); setNameError(""); }}
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

export default CertificationsPage;

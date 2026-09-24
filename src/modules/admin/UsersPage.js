import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import masterApiService from "../../core/masterApiService";
import ConfirmModal from "../../shared/ConfirmModal";
import Pagination from "../../shared/Pagination";

const ROLES = ["Admin", "Recruiter", "Committee_Member"];
const EMPTY_FORM = { name: "", role: "", email: "" };

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [searchText, setSearchText] = useState("");
  const submittingRef = useRef(false);
  const [confirmState, setConfirmState] = useState({ show: false, message: "", onConfirm: null });

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  };

  const askConfirm = (message, action) => setConfirmState({ show: true, message, onConfirm: action });
  const closeConfirm = () => setConfirmState({ show: false, message: "", onConfirm: null });

  // Guards against overlapping fetches (e.g. React StrictMode's dev-only double-invoke on mount).
  const loadInFlightRef = useRef(false);
  const loadUsers = async (search, pageArg, sizeArg) => {
    if (loadInFlightRef.current) return;
    loadInFlightRef.current = true;
    setLoading(true);
    try {
      const res = await masterApiService.getUsers(search, pageArg ?? page, sizeArg ?? size);
      const data = res.data.data || {};
      setUsers(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
      loadInFlightRef.current = false;
    }
  };

  useEffect(() => {
    loadUsers(searchText, page, size);
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
      loadUsers(searchText, 0, size);
    }, 400);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setShowModal(true);
  };

  const openEdit = (user) => {
    setEditing(user);
    setForm({ name: user.name, role: user.role, email: user.email });
    setErrors({});
    setShowModal(true);
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Full Name is required";
    if (!form.role) next.role = "Role is required";
    if (!form.email.trim()) {
      next.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      next.email = "Please enter a valid email address";
    }
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
        await masterApiService.updateUser(editing.id, form);
        toast.success("User updated successfully");
      } else {
        await masterApiService.addUser(form);
        toast.success("User added successfully. Their email must match their Azure AD account to log in.");
      }
      setShowModal(false);
      loadUsers(searchText, page, size);
    } catch (e) {
      toast.error(e.response?.data?.message || "Save failed");
    } finally {
      submittingRef.current = false;
      setSaving(false);
    }
  };

  const handleDelete = (user) => {
    askConfirm(`Are you sure you want to delete the user "${user.name}"?`, async () => {
      closeConfirm();
      try {
        await masterApiService.deleteUser(user.id);
        toast.success("User deleted successfully");
        loadUsers(searchText, page, size);
      } catch (e) {
        toast.error(e.response?.data?.message || "Delete failed");
      }
    });
  };

  return (
    <div className="app-card">
      <div className="list-card-header">
        <div className="list-card-title-wrap">
          <i className="bi bi-person-badge-fill" />
          <span className="list-card-title">User records</span>
          <span className="list-card-count">({totalElements} record{totalElements === 1 ? "" : "s"})</span>
        </div>
        <div className="d-flex align-items-center gap-2">
          <div className="search-boxpost" style={{ width: 280 }}>
            <i className="bi bi-search" />
            <input
              className="form-control form-control-sm"
              placeholder="Search users..."
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
              <th>Role</th>
              <th>Email</th>
              <th style={{ width: 120 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, idx) => (
              <tr key={user.id}>
                <td>{page * size + idx + 1}</td>
                <td>{user.name}</td>
                <td>
                  <span className="status-pill status-pill-secondary">{user.role}</span>
                </td>
                <td>{user.email}</td>
                <td>
                  <button className="icon-btn-circle me-2" onClick={() => openEdit(user)}>
                    <i className="bi bi-pencil" />
                  </button>
                  <button className="icon-btn-circle danger" onClick={() => handleDelete(user)}>
                    <i className="bi bi-trash" />
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-muted py-4">No users found</td>
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
                <h5 className="modal-title">{editing ? "Edit" : "Add"} User</h5>
                <button className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Full Name <span className="text-danger">*</span></label>
                  <input
                    className={`form-control ${errors.name ? "is-invalid" : ""}`}
                    value={form.name}
                    onChange={(e) => setField("name", e.target.value)}
                  />
                  <div className="text-danger fs-13 mt-1" style={{ minHeight: "18px" }}>{errors.name || ""}</div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Role <span className="text-danger">*</span></label>
                  <select
                    className={`form-select ${errors.role ? "is-invalid" : ""}`}
                    value={form.role}
                    onChange={(e) => setField("role", e.target.value)}
                  >
                    <option value="">Select Role</option>
                    {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <div className="text-danger fs-13 mt-1" style={{ minHeight: "18px" }}>{errors.role || ""}</div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Email (must match their Azure AD account) <span className="text-danger">*</span></label>
                  <input
                    className={`form-control ${errors.email ? "is-invalid" : ""}`}
                    type="email"
                    value={form.email}
                    disabled={!!editing}
                    onChange={(e) => setField("email", e.target.value)}
                  />
                  <div className="text-danger fs-13 mt-1" style={{ minHeight: "18px" }}>{errors.email || ""}</div>
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

export default UsersPage;

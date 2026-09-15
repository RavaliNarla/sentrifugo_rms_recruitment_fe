import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import masterApiService from "../../core/masterApiService";

const ROLES = ["Admin", "Recruiter", "Committee_Member"];
const EMPTY_FORM = { name: "", role: "", email: "" };

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await masterApiService.getUsers();
      setUsers(res.data.data || []);
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (user) => {
    setEditing(user);
    setForm({ name: user.name, role: user.role, email: user.email });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.role || !form.email) {
      toast.error("All fields are required");
      return;
    }
    try {
      if (editing) {
        await masterApiService.updateUser(editing.id, form);
        toast.success("User updated successfully");
      } else {
        await masterApiService.addUser(form);
        toast.success("User added successfully. Their email must match their Azure AD account to log in.");
      }
      setShowModal(false);
      loadUsers();
    } catch (e) {
      toast.error(e.response?.data?.message || "Save failed");
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete user "${user.name}"?`)) return;
    try {
      await masterApiService.deleteUser(user.id);
      toast.success("User deleted successfully");
      loadUsers();
    } catch (e) {
      toast.error(e.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="app-card">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="page-title m-0">Users</h5>
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
              <th>Role</th>
              <th>Email</th>
              <th style={{ width: 120 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, idx) => (
              <tr key={user.id}>
                <td>{idx + 1}</td>
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

      {showModal && (
        <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editing ? "Edit" : "Add"} User</h5>
                <button className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Full Name</label>
                  <input
                    className="form-control"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Role</label>
                  <select
                    className="form-select"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                  >
                    <option value="">Select Role</option>
                    {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Email (must match their Azure AD account)</label>
                  <input
                    className="form-control"
                    type="email"
                    value={form.email}
                    disabled={!!editing}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
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

export default UsersPage;

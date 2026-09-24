import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import recruiterApiService from "../../core/recruiterApiService";
import masterApiService from "../../core/masterApiService";
import ConfirmModal from "../../shared/ConfirmModal";
import Pagination from "../../shared/Pagination";

const ManagePanelsTab = () => {
  const [panels, setPanels] = useState([]);
  const [members, setMembers] = useState([]);
  const [name, setName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [errors, setErrors] = useState({});
  const [confirmState, setConfirmState] = useState({ show: false, message: "", onConfirm: null });

  const askConfirm = (message, action) => setConfirmState({ show: true, message, onConfirm: action });
  const closeConfirm = () => setConfirmState({ show: false, message: "", onConfirm: null });

  useEffect(() => {
    masterApiService.getPanelMembers().then((res) => setMembers(res.data.data || [])).catch(() => toast.error("Failed to load panel members"));
  }, []);

  // Guards against overlapping fetches (e.g. React StrictMode's dev-only double-invoke on mount).
  const loadInFlightRef = useRef(false);
  const load = async (pageArg) => {
    if (loadInFlightRef.current) return;
    loadInFlightRef.current = true;
    setLoading(true);
    try {
      const res = await recruiterApiService.searchPanels({ search: search || undefined, page: pageArg ?? page, size });
      setPanels(res.data.data.content || []);
      setTotalPages(res.data.data.totalPages || 0);
    } catch (e) {
      toast.error("Failed to load panels");
    } finally {
      setLoading(false);
      loadInFlightRef.current = false;
    }
  };

  useEffect(() => {
    load(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size]);

  // Search is performed server-side - only reload (and jump back to page 1) on a genuine
  // search change, not on mount.
  const prevSearchRef = useRef(search);
  useEffect(() => {
    if (prevSearchRef.current === search) return;
    prevSearchRef.current = search;
    const timeout = setTimeout(() => {
      setPage(0);
      load(0);
    }, 400);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const resetForm = () => {
    setEditing(null);
    setName("");
    setSelectedMembers([]);
    setErrors({});
  };

  const validate = () => {
    const next = {};
    if (!name.trim()) next.name = "Panel Name is required";
    if (selectedMembers.length === 0) next.members = "Select at least one panel member";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  // The duplicate-member-set check is backend-only (panels is now a paginated page, not the
  // full list, so it can't be checked reliably client-side) - shown inline like other member errors.
  const handleSave = async () => {
    if (!validate()) return;
    try {
      if (editing) {
        await recruiterApiService.updatePanel(editing.id, { name, memberIds: selectedMembers });
        toast.success("Panel updated successfully");
      } else {
        await recruiterApiService.createPanel({ name, memberIds: selectedMembers });
        toast.success("Panel created successfully");
      }
      resetForm();
      load();
    } catch (e) {
      const message = e.response?.data?.message || "Failed to save panel";
      if (message.toLowerCase().includes("exact members")) {
        setErrors((prev) => ({ ...prev, members: message }));
      } else if (message.toLowerCase().includes("panel with this name")) {
        setErrors((prev) => ({ ...prev, name: message }));
      } else {
        toast.error(message);
      }
    }
  };

  const handleEdit = (panel) => {
    setEditing(panel);
    setName(panel.name);
    setSelectedMembers(panel.memberIds);
    setErrors({});
  };

  const handleDelete = (panel) => {
    askConfirm(`Are you sure you want to delete the panel "${panel.name}"?`, async () => {
      closeConfirm();
      try {
        await recruiterApiService.deletePanel(panel.id);
        toast.success("Panel deleted successfully");
        load();
      } catch (e) {
        toast.error(e.response?.data?.message || "Failed to delete panel");
      }
    });
  };

  const toggleMember = (id) => {
    setSelectedMembers((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    setErrors((prev) => (prev.members ? { ...prev, members: undefined } : prev));
  };

  return (
    <div className="row g-3" style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "24px" }}>
      <div className="panel-form-card">
        <div className="card-title">{editing ? "Update Panel" : "Create New Panel"}</div>
        <div className="card-subtitle mb-3">Create and manage interview panels</div>

        <div className="mb-3">
          <label className="form-label fs-14">Panel Name <span className="text-danger">*</span></label>
          <input
            className={`form-control ${errors.name ? "is-invalid" : ""}`}
            value={name}
            onChange={(e) => { setName(e.target.value); setErrors((prev) => (prev.name ? { ...prev, name: undefined } : prev)); }}
            placeholder="Enter Panel Name"
          />
          <div className="text-danger fs-13 mt-1" style={{ minHeight: "18px" }}>{errors.name || ""}</div>
        </div>
        <div className="mb-3">
          <label className="form-label fs-14">Panel Members <span className="text-danger">*</span></label>
          <div className="member-checklist">
            {members.map((m) => (
              <div key={m.id} className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={selectedMembers.includes(m.id)}
                  onChange={() => toggleMember(m.id)}
                />
                <label className="form-check-label fs-14">{m.name} <small className="text-muted">({m.role})</small></label>
              </div>
            ))}
          </div>
          <div className="text-danger fs-13 mt-1" style={{ minHeight: "18px" }}>{errors.members || ""}</div>
        </div>
        <div className="d-flex justify-content-end gap-2">
          {editing && <button className="btn btn-outline-secondary" onClick={resetForm}>Cancel</button>}
          <button className="btn btn-primary" onClick={handleSave}>{editing ? "Update Panel" : "Save Panel"}</button>
        </div>
      </div>

      <div className="panel-table-card">
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <span className="table-title">Panels History</span>
          <input
            className="table-search-input"
            placeholder="Search by panel name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {loading ? <div>Loading...</div> : (
          <table className="table table-navy mb-0">
            <thead>
              <tr>
                <th style={{ width: 60 }}>S.No</th>
                <th>Panel Name</th>
                <th>Panel Members</th>
                <th style={{ width: 100 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {panels.map((p, idx) => (
                <tr key={p.id}>
                  <td>{page * size + idx + 1}</td>
                  <td>{p.name}</td>
                  <td>{(p.memberNames || []).join(", ")}</td>
                  <td>
                    <button className="table-icon-btn" onClick={() => handleEdit(p)} title="Edit"><i className="bi bi-pencil" /></button>
                    <button className="table-icon-btn delete" onClick={() => handleDelete(p)} title="Delete"><i className="bi bi-trash" /></button>
                  </td>
                </tr>
              ))}
              {panels.length === 0 && <tr><td colSpan={4} className="text-center text-muted py-4">No panels created yet</td></tr>}
            </tbody>
          </table>
        )}

        <Pagination page={page} totalPages={totalPages} onChange={setPage} size={size} onSizeChange={(s) => { setSize(s); setPage(0); }} />
      </div>

      <ConfirmModal
        show={confirmState.show}
        message={confirmState.message}
        onConfirm={confirmState.onConfirm}
        onCancel={closeConfirm}
      />
    </div>
  );
};

export default ManagePanelsTab;

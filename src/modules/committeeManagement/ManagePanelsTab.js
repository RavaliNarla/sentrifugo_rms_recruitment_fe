import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import recruiterApiService from "../../core/recruiterApiService";
import masterApiService from "../../core/masterApiService";

const ManagePanelsTab = () => {
  const [panels, setPanels] = useState([]);
  const [members, setMembers] = useState([]);
  const [name, setName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [panelRes, memberRes] = await Promise.all([
        recruiterApiService.getPanels(),
        masterApiService.getPanelMembers(),
      ]);
      setPanels(panelRes.data.data || []);
      setMembers(memberRes.data.data || []);
    } catch (e) {
      toast.error("Failed to load panels");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setEditing(null);
    setName("");
    setSelectedMembers([]);
  };

  const handleSave = async () => {
    if (!name || selectedMembers.length === 0) {
      toast.error("Panel name and at least one member are required");
      return;
    }
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
      toast.error(e.response?.data?.message || "Failed to save panel");
    }
  };

  const handleEdit = (panel) => {
    setEditing(panel);
    setName(panel.name);
    setSelectedMembers(panel.memberIds);
  };

  const handleDelete = async (panel) => {
    if (!window.confirm(`Delete panel "${panel.name}"?`)) return;
    try {
      await recruiterApiService.deletePanel(panel.id);
      toast.success("Panel deleted successfully");
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to delete panel");
    }
  };

  const toggleMember = (id) => {
    setSelectedMembers((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const filteredPanels = panels.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="row g-3" style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "24px" }}>
      <div className="panel-form-card">
        <div className="card-title">{editing ? "Update Panel" : "Create New Panel"}</div>
        <div className="card-subtitle mb-3">Create and manage interview panels</div>

        <div className="mb-3">
          <label className="form-label fs-14">Panel Name *</label>
          <input className="form-control" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter Panel Name" />
        </div>
        <div className="mb-3">
          <label className="form-label fs-14">Panel Members *</label>
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
              {filteredPanels.map((p, idx) => (
                <tr key={p.id}>
                  <td>{idx + 1}</td>
                  <td>{p.name}</td>
                  <td>{(p.memberNames || []).join(", ")}</td>
                  <td>
                    <button className="table-icon-btn" onClick={() => handleEdit(p)} title="Edit"><i className="bi bi-pencil" /></button>
                    <button className="table-icon-btn delete" onClick={() => handleDelete(p)} title="Delete"><i className="bi bi-trash" /></button>
                  </td>
                </tr>
              ))}
              {filteredPanels.length === 0 && <tr><td colSpan={4} className="text-center text-muted py-4">No panels created yet</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ManagePanelsTab;

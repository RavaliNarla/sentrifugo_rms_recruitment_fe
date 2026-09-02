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

  return (
    <div className="row">
      <div className="col-md-5">
        <h6>{editing ? "Edit Panel" : "Create New Panel"}</h6>
        <div className="mb-3">
          <label className="form-label">Panel Name *</label>
          <input className="form-control" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter Panel Name" />
        </div>
        <div className="mb-3">
          <label className="form-label">Panel Members *</label>
          <div className="border rounded p-2" style={{ maxHeight: 220, overflowY: "auto" }}>
            {members.map((m) => (
              <div key={m.id} className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={selectedMembers.includes(m.id)}
                  onChange={() => toggleMember(m.id)}
                />
                <label className="form-check-label">{m.name} <small className="text-muted">({m.role})</small></label>
              </div>
            ))}
          </div>
        </div>
        <div className="d-flex gap-2">
          {editing && <button className="btn btn-outline-secondary" onClick={resetForm}>Cancel</button>}
          <button className="btn btn-primary" onClick={handleSave}>{editing ? "Update Panel" : "Save Panel"}</button>
        </div>
      </div>

      <div className="col-md-7">
        <h6>Panels</h6>
        {loading ? <div>Loading...</div> : (
          <table className="table table-hover">
            <thead className="table-light">
              <tr><th>Panel Name</th><th>Members</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {panels.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{(p.memberNames || []).join(", ")}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => handleEdit(p)}><i className="bi bi-pencil" /></button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(p)}><i className="bi bi-trash" /></button>
                  </td>
                </tr>
              ))}
              {panels.length === 0 && <tr><td colSpan={3} className="text-center text-muted py-4">No panels created yet</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ManagePanelsTab;

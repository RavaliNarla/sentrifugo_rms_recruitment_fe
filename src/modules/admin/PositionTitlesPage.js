import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import masterApiService from "../../core/masterApiService";
import ConfirmModal from "../../shared/ConfirmModal";
import Pagination from "../../shared/Pagination";

const EXPERIENCE_YEARS = Array.from({ length: 31 }, (_, i) => i);

const EMPTY_FORM = {
  name: "",
  departmentId: "",
  jobDescription: "",
  minimumExperienceYears: "0",
};

const PositionTitlesPage = () => {
  const [items, setItems] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewOnly, setViewOnly] = useState(false);
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
  const loadData = async (search, pageArg, sizeArg) => {
    if (loadInFlightRef.current) return;
    loadInFlightRef.current = true;
    setLoading(true);
    try {
      const res = await masterApiService.getPositionTitles(search, pageArg ?? page, sizeArg ?? size);
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
    masterApiService.getDepartments()
      .then((d) => setDepartments(d.data.data || []))
      .catch(() => toast.error("Failed to load master data"));
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
    setViewOnly(false);
    setForm(EMPTY_FORM);
    setErrors({});
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setViewOnly(false);
    setForm({
      name: item.name || "",
      departmentId: item.departmentId || "",
      jobDescription: item.jobDescription || "",
      minimumExperienceYears: String(item.minimumExperienceYears ?? "0"),
    });
    setErrors({});
    setShowModal(true);
  };

  const openView = (item) => {
    openEdit(item);
    setViewOnly(true);
  };

  const validate = () => {
    const next = {};
    if (!form.departmentId) next.departmentId = "Department is required";
    if (!form.name.trim()) next.name = "Position Title is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async () => {
    if (submittingRef.current) return;
    if (!validate()) return;
    const payload = {
      name: form.name,
      departmentId: form.departmentId,
      jobDescription: form.jobDescription || null,
      minimumExperienceYears: Number(form.minimumExperienceYears),
    };
    submittingRef.current = true;
    setSaving(true);
    try {
      if (editing) {
        await masterApiService.updatePositionTitle(editing.id, payload);
        toast.success("Position title updated successfully");
      } else {
        await masterApiService.addPositionTitle(payload);
        toast.success("Position title added successfully");
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
    askConfirm(`Are you sure you want to delete the position title "${item.name}"?`, async () => {
      closeConfirm();
      try {
        await masterApiService.deletePositionTitle(item.id);
        toast.success("Position title deleted successfully");
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
          <span className="list-card-title">Position Title records</span>
          <span className="list-card-count">({totalElements} record{totalElements === 1 ? "" : "s"})</span>
        </div>
        <div className="d-flex align-items-center gap-2">
          <div className="input-group input-group-sm" style={{ width: 220 }}>
            <span className="input-group-text bg-white"><i className="bi bi-search" /></span>
            <input
              className="form-control"
              placeholder="Search position titles..."
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
              <th>Department</th>
              <th>Position Title</th>
              <th>Roles & Responsibilities</th>
              <th style={{ width: 140 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={item.id}>
                <td>{page * size + idx + 1}</td>
                <td>{item.departmentName || "-"}</td>
                <td>{item.name}</td>
                <td>
                  <div style={{ maxWidth: 320, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {item.jobDescription || "-"}
                  </div>
                </td>
                <td>
                  <button className="icon-btn-circle me-2" title="View" onClick={() => openView(item)}>
                    <i className="bi bi-eye" />
                  </button>
                  <button className="icon-btn-circle me-2" title="Edit" onClick={() => openEdit(item)}>
                    <i className="bi bi-pencil" />
                  </button>
                  <button className="icon-btn-circle danger" title="Delete" onClick={() => handleDelete(item)}>
                    <i className="bi bi-trash" />
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-muted py-4">
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={setPage} size={size} onSizeChange={(s) => { setSize(s); setPage(0); }} />

      {showModal && (
        <div className="modal show d-block" style={{ background: "rgba(0, 0, 0, 0.45)" }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {viewOnly ? "View" : editing ? "Edit" : "Add"} Position Title
                </h5>
                <button className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <fieldset disabled={viewOnly} style={{ border: 0, padding: 0, margin: 0 }}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Department <span className="text-danger">*</span></label>
                      <select
                        className={`form-select ${errors.departmentId ? "is-invalid" : ""}`}
                        value={form.departmentId}
                        onChange={(e) => setField("departmentId", e.target.value)}
                      >
                        <option value="">Select</option>
                        {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                      <div className="text-danger fs-13 mt-1" style={{ minHeight: "18px" }}>{errors.departmentId || ""}</div>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Position Title <span className="text-danger">*</span></label>
                      <input
                        className={`form-control ${errors.name ? "is-invalid" : ""}`}
                        value={form.name}
                        onChange={(e) => setField("name", e.target.value)}
                        autoFocus
                      />
                      <div className="text-danger fs-13 mt-1" style={{ minHeight: "18px" }}>{errors.name || ""}</div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Minimum Experience (years)</label>
                    <select
                      className="form-select"
                      value={form.minimumExperienceYears}
                      onChange={(e) => setForm({ ...form, minimumExperienceYears: e.target.value })}
                    >
                      {EXPERIENCE_YEARS.map((y) => <option key={y} value={y}>{y} {y === 1 ? "year" : "years"}</option>)}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Roles &amp; Responsibilities</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={form.jobDescription}
                      onChange={(e) => setForm({ ...form, jobDescription: e.target.value })}
                    />
                  </div>
                </div>
              </fieldset>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  {viewOnly ? "Close" : "Cancel"}
                </button>
                {!viewOnly && (
                  <button className="btn btn-primary" disabled={saving} onClick={handleSave}>
                    {saving ? "Saving..." : editing ? "Update" : "Save"}
                  </button>
                )}
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

export default PositionTitlesPage;

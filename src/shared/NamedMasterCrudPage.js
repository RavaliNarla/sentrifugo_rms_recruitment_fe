import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import ConfirmModal from "./ConfirmModal";
import Pagination from "./Pagination";

/**
 * Generic list + add/edit/delete screen for simple "id + name" master data
 * (Departments, Education Qualifications) - paginated + searched server-side.
 */
// withDescription: also capture an optional Description (Departments).
// withCode: show code column/field (Departments). When hrmsSynced, code is read-only.
const NamedMasterCrudPage = ({
  title,
  getAll,
  add,
  update,
  remove,
  withDescription = false,
  withCode = false,
  /** When true: hide Add/Delete; name+code read-only (HRMS-synced masters). */
  hrmsSynced = false,
}) => {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewOnly, setViewOnly] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [nameError, setNameError] = useState("");
  const [codeError, setCodeError] = useState("");
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
      const res = await getAll(search, pageArg ?? page, sizeArg ?? size);
      const data = res.data.data || {};
      setItems(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (e) {
      toast.error(e.response?.data?.message || `Failed to load ${title.toLowerCase()}s`);
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
    setViewOnly(false);
    setEditing(null);
    setName("");
    setCode("");
    setDescription("");
    setNameError("");
    setCodeError("");
    setShowModal(true);
  };

  const openEdit = (item) => {
    setViewOnly(false);
    setEditing(item);
    setName(item.name);
    setCode(item.code || "");
    setDescription(item.description || "");
    setNameError("");
    setCodeError("");
    setShowModal(true);
  };

  // View reuses the Edit popup with every field disabled and only a Close button.
  const openView = (item) => {
    openEdit(item);
    setViewOnly(true);
  };

  const handleSave = async () => {
    if (submittingRef.current) return;
    let hasError = false;
    if (!hrmsSynced && !name.trim()) {
      setNameError("Name is required");
      hasError = true;
    }
    if (withCode && !hrmsSynced) {
      const normalized = (code || "").trim();
      if (!normalized) {
        setCodeError("Code is required");
        hasError = true;
      }
    }
    if (hasError) return;
    submittingRef.current = true;
    setSaving(true);
    try {
      const payload = hrmsSynced
        ? { name: editing?.name || name, code: editing?.code || code, description }
        : { name };
      if (!hrmsSynced && withDescription) payload.description = description;
      if (!hrmsSynced && withCode) payload.code = code.trim();
      if (hrmsSynced) payload.description = description;
      if (editing) {
        await update(editing.id, payload);
        toast.success(`${title} updated successfully`);
      } else {
        await add(payload);
        toast.success(`${title} added successfully`);
      }
      setShowModal(false);
      loadData(searchText, page, size);
    } catch (e) {
      toast.error(e.response?.data?.message || `Failed to save ${title.toLowerCase()}`);
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
        loadData(searchText, page, size);
      } catch (e) {
        toast.error(e.response?.data?.message || `Failed to delete ${title.toLowerCase()}`);
      }
    });
  };

  return (
    <div className="app-card">
      <div className="list-card-header">
        <div className="list-card-title-wrap">
          <i className="bi bi-collection-fill" />
          <span className="list-card-title">{title} records</span>
          <span className="list-card-count">({totalElements} record{totalElements === 1 ? "" : "s"})</span>
        </div>
        <div className="d-flex align-items-center gap-2">
          <div className="search-boxpost" style={{ width: 280 }}>
            <i className="bi bi-search" />
            <input
              className="form-control form-control-sm"
              placeholder={`Search ${title.toLowerCase()}...`}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
          {!hrmsSynced && (
            <button className="btn btn-primary" onClick={openAdd}>
              <i className="bi bi-plus-lg" /> Add
            </button>
          )}
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
              {withCode && <th>Code</th>}
              {withDescription && <th>Description</th>}
              <th style={{ width: 160 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={item.id}>
                <td>{page * size + idx + 1}</td>
                <td>{item.name}</td>
                {withCode && <td><code>{item.code || "-"}</code></td>}
                {withDescription && <td className="text-muted">{item.description || "-"}</td>}
                <td>
                  <button className="icon-btn-circle me-2" title="View" onClick={() => openView(item)}>
                    <i className="bi bi-eye" />
                  </button>
                  <button className="icon-btn-circle me-2" title="Edit" onClick={() => openEdit(item)}>
                    <i className="bi bi-pencil" />
                  </button>
                  {!hrmsSynced && (
                    <button className="icon-btn-circle danger" title="Delete" onClick={() => handleDelete(item)}>
                      <i className="bi bi-trash" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={(withDescription ? 1 : 0) + (withCode ? 1 : 0) + 3} className="text-center text-muted py-4">
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
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{viewOnly ? "View" : editing ? "Edit" : "Add"} {title}</h5>
                <button className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <fieldset disabled={viewOnly} style={{ border: 0, padding: 0, margin: 0 }}>
              <div className="modal-body">
                <label className="form-label">Name <span className="text-danger">*</span></label>
                <input
                  className={`form-control ${nameError ? "is-invalid" : ""}`}
                  value={name}
                  disabled={hrmsSynced}
                  onChange={(e) => { setName(e.target.value); setNameError(""); }}
                  autoFocus={!hrmsSynced}
                />
                {hrmsSynced && <small className="text-muted">Name is synced from HRMS.</small>}
                <div className="text-danger fs-13 mt-1" style={{ minHeight: "18px" }}>{nameError || ""}</div>
                {withCode && (
                  <div className="mt-2">
                    <label className="form-label">Code <span className="text-danger">*</span></label>
                    <input
                      className={`form-control ${codeError ? "is-invalid" : ""}`}
                      value={code}
                      maxLength={64}
                      disabled={hrmsSynced}
                      placeholder="e.g. HR"
                      onChange={(e) => {
                        setCode(e.target.value);
                        setCodeError("");
                      }}
                    />
                    <small className="text-muted">
                      {hrmsSynced
                        ? "Code is synced from HRMS and used in requisition codes."
                        : "Used in requisition codes."}
                    </small>
                    <div className="text-danger fs-13 mt-1" style={{ minHeight: "18px" }}>{codeError || ""}</div>
                  </div>
                )}
                {withDescription && (
                  <div className="mt-2">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      maxLength={1000}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      autoFocus={hrmsSynced}
                    />
                  </div>
                )}
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

export default NamedMasterCrudPage;

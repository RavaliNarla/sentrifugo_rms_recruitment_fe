import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import masterApiService from "../../core/masterApiService";
import Pagination from "../../shared/Pagination";

const EMPTY_FORM = { name: "", code: "", address: "" };

const LocationsPage = () => {
  const [locations, setLocations] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [searchText, setSearchText] = useState("");

  // Guards against overlapping fetches (e.g. React StrictMode's dev-only double-invoke on mount).
  const loadInFlightRef = useRef(false);
  const loadData = async (search, pageArg, sizeArg) => {
    if (loadInFlightRef.current) return;
    loadInFlightRef.current = true;
    setLoading(true);
    try {
      const res = await masterApiService.searchLocations(search, pageArg ?? page, sizeArg ?? size);
      const data = res.data.data || {};
      setLocations(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to load locations");
    } finally {
      setLoading(false);
      loadInFlightRef.current = false;
    }
  };

  useEffect(() => {
    loadData(searchText, page, size);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size]);

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

  const openView = (loc) => {
    setForm({ name: loc.name, code: loc.code || "", address: loc.address || "" });
    setShowModal(true);
  };

  return (
    <div className="app-card">
      <div className="list-card-header">
        <div className="list-card-title-wrap">
          <i className="bi bi-geo-alt-fill" />
          <span className="list-card-title">Location records</span>
          <span className="list-card-count">({totalElements} record{totalElements === 1 ? "" : "s"})</span>
        </div>
        <div className="d-flex align-items-center gap-2">
          <div className="search-boxpost" style={{ width: 280 }}>
            <i className="bi bi-search" />
            <input
              className="form-control form-control-sm"
              placeholder="Search locations..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <table className="table table-hover align-middle">
          <thead>
            <tr className="text-muted fs-13">
              <th>#</th>
              <th>Location Name</th>
              <th>Code</th>
              <th>Address</th>
              <th style={{ width: 100 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {locations.map((loc, idx) => (
              <tr key={loc.id}>
                <td>{page * size + idx + 1}</td>
                <td>{loc.name}</td>
                <td><code>{loc.code || "-"}</code></td>
                <td>{loc.address || "-"}</td>
                <td>
                  <button className="icon-btn-circle me-2" title="View" onClick={() => openView(loc)}>
                    <i className="bi bi-eye" />
                  </button>
                </td>
              </tr>
            ))}
            {locations.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-muted py-4">No locations found</td>
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
                <h5 className="modal-title">View Location</h5>
                <button className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <fieldset disabled style={{ border: 0, padding: 0, margin: 0 }}>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Location Name</label>
                  <input className="form-control" value={form.name} readOnly />
                  <small className="text-muted">Name is synced from HRMS business units.</small>
                </div>
                <div className="mb-3">
                  <label className="form-label">Code</label>
                  <input className="form-control" value={form.code} readOnly />
                  <small className="text-muted">Code is synced from HRMS (emp code prefix) and used in requisition codes.</small>
                </div>
                <div className="mb-3">
                  <label className="form-label">Address</label>
                  <textarea className="form-control" rows={3} value={form.address} readOnly />
                  <small className="text-muted">Address is synced from HRMS.</small>
                </div>
              </div>
              </fieldset>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default LocationsPage;

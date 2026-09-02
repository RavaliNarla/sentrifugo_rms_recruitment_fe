import React from "react";

const Pagination = ({ page, totalPages, onChange, size, onSizeChange }) => {
  if (totalPages <= 0) return null;
  return (
    <div className="d-flex justify-content-between align-items-center mt-3">
      <div className="d-flex align-items-center gap-2">
        <span className="text-muted small">Page size</span>
        <select className="form-select form-select-sm" style={{ width: 80 }} value={size} onChange={(e) => onSizeChange(Number(e.target.value))}>
          {[5, 10, 20, 50].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div className="d-flex gap-2 align-items-center">
        <button className="btn btn-sm btn-outline-secondary" disabled={page <= 0} onClick={() => onChange(page - 1)}>Prev</button>
        <span className="small">Page {page + 1} of {Math.max(totalPages, 1)}</span>
        <button className="btn btn-sm btn-outline-secondary" disabled={page >= totalPages - 1} onClick={() => onChange(page + 1)}>Next</button>
      </div>
    </div>
  );
};

export default Pagination;

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import recruiterApiService from "../../../core/recruiterApiService";
import Pagination from "../../../shared/Pagination";

const EMPTY_DETAILS = { currentCtc: "", expectedCtc: "", fixedPay: "", variablePay: "", bonus: "", compensationComments: "", agreedCtc: "" };

/** Compensation Management (Section 15 of the requirements doc, renamed from "Compensation Pool"). */
const CompensationPoolTab = ({ positionId }) => {
  const [rows, setRows] = useState([]);
  const [details, setDetails] = useState({});
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await recruiterApiService.searchCompensationPool({ positionId, page, size });
      const content = res.data.data.content || [];
      setRows(content);
      const map = {};
      content.forEach((c) => {
        map[c.id] = {
          currentCtc: c.currentCtc ?? "",
          expectedCtc: c.expectedCtc ?? "",
          fixedPay: c.fixedPay ?? "",
          variablePay: c.variablePay ?? "",
          bonus: c.bonus ?? "",
          compensationComments: c.compensationComments ?? "",
          agreedCtc: c.agreedCtc ?? "",
        };
      });
      setDetails(map);
      setTotalPages(res.data.data.totalPages || 0);
    } catch (e) {
      toast.error("Failed to load compensation pool");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    setSelected([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [positionId, page, size]);

  const updateField = (id, field, value) => {
    setDetails((prev) => ({ ...prev, [id]: { ...(prev[id] || EMPTY_DETAILS), [field]: value } }));
  };

  const handleSaveDetails = async (id) => {
    setSavingId(id);
    try {
      const d = details[id] || EMPTY_DETAILS;
      await recruiterApiService.updateCompensationDetails(id, {
        currentCtc: d.currentCtc || null,
        expectedCtc: d.expectedCtc || null,
        fixedPay: d.fixedPay || null,
        variablePay: d.variablePay || null,
        bonus: d.bonus || null,
        compensationComments: d.compensationComments || null,
        agreedCtc: d.agreedCtc || null,
      });
      toast.success("Compensation details saved");
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to save compensation details");
    } finally {
      setSavingId(null);
    }
  };

  const toggleSelect = (id) => {
    if (!details[id]?.agreedCtc) {
      toast.error("Enter and save Agreed CTC before selecting this candidate");
      return;
    }
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleMoveToOffer = async () => {
    try {
      await recruiterApiService.moveToOffer(selected);
      toast.success("Candidate(s) moved to Offer Pool");
      setSelected([]);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to move candidates");
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        {selected.length > 0 ? (
          <span className="badge rounded-pill text-bg-light border text-app-primary fs-13">{selected.length} Candidates Selected</span>
        ) : <span />}
        {selected.length > 0 && (
          <button className="btn btn-blue-dark" onClick={handleMoveToOffer}>
            Move to Offer Pool ({selected.length})
          </button>
        )}
      </div>

      {loading ? <div>Loading...</div> : (
        <table className="table table-hover align-middle">
          <thead>
            <tr className="text-muted fs-13">
              <th></th>
              <th>Candidate</th>
              <th>Score</th>
              <th>Current CTC</th>
              <th>Expected CTC</th>
              <th>Fixed Pay</th>
              <th>Variable Pay</th>
              <th>Bonus</th>
              <th>Comments</th>
              <th>Agreed CTC</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => {
              const d = details[c.id] || EMPTY_DETAILS;
              return (
                <tr key={c.id}>
                  <td>
                    <input type="checkbox" className="form-check-input" checked={selected.includes(c.id)} onChange={() => toggleSelect(c.id)} />
                  </td>
                  <td>{c.name}</td>
                  <td>{c.finalScore ?? "-"}</td>
                  <td><input type="number" className="form-control form-control-sm" style={{ width: 110 }} value={d.currentCtc} onChange={(e) => updateField(c.id, "currentCtc", e.target.value)} /></td>
                  <td><input type="number" className="form-control form-control-sm" style={{ width: 110 }} value={d.expectedCtc} onChange={(e) => updateField(c.id, "expectedCtc", e.target.value)} /></td>
                  <td><input type="number" className="form-control form-control-sm" style={{ width: 100 }} value={d.fixedPay} onChange={(e) => updateField(c.id, "fixedPay", e.target.value)} /></td>
                  <td><input type="number" className="form-control form-control-sm" style={{ width: 100 }} value={d.variablePay} onChange={(e) => updateField(c.id, "variablePay", e.target.value)} /></td>
                  <td><input type="number" className="form-control form-control-sm" style={{ width: 90 }} value={d.bonus} onChange={(e) => updateField(c.id, "bonus", e.target.value)} /></td>
                  <td><input className="form-control form-control-sm" style={{ width: 140 }} value={d.compensationComments} onChange={(e) => updateField(c.id, "compensationComments", e.target.value)} /></td>
                  <td><input type="number" className="form-control form-control-sm" style={{ width: 110 }} value={d.agreedCtc} onChange={(e) => updateField(c.id, "agreedCtc", e.target.value)} /></td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary" disabled={savingId === c.id} onClick={() => handleSaveDetails(c.id)}>
                      {savingId === c.id ? "Saving..." : "Save"}
                    </button>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr><td colSpan={10} className="text-center text-muted py-4">No candidates in Compensation Management.</td></tr>
            )}
          </tbody>
        </table>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={setPage} size={size} onSizeChange={(s) => { setSize(s); setPage(0); }} />
    </div>
  );
};

export default CompensationPoolTab;

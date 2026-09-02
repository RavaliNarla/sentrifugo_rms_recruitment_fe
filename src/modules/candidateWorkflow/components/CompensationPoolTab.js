import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import recruiterApiService from "../../../core/recruiterApiService";
import Pagination from "../../../shared/Pagination";

const CompensationPoolTab = ({ positionId }) => {
  const [rows, setRows] = useState([]);
  const [salaryInputs, setSalaryInputs] = useState({});
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await recruiterApiService.searchCompensationPool({ positionId, page, size });
      const content = res.data.data.content || [];
      setRows(content);
      const inputs = {};
      content.forEach((c) => { inputs[c.id] = c.salary ?? ""; });
      setSalaryInputs(inputs);
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

  const toggleSelect = (id) => {
    if (!salaryInputs[id]) {
      toast.error("Enter a salary before selecting this candidate");
      return;
    }
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleSalaryBlur = async (id) => {
    const value = salaryInputs[id];
    if (!value) return;
    try {
      await recruiterApiService.updateSalary(id, value);
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to update salary");
    }
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
      <div className="d-flex justify-content-end mb-3">
        {selected.length > 0 && (
          <button className="btn btn-outline-primary" onClick={handleMoveToOffer}>
            Move to Offer Pool ({selected.length})
          </button>
        )}
      </div>

      {loading ? <div>Loading...</div> : (
        <table className="table table-hover">
          <thead className="table-light">
            <tr>
              <th></th>
              <th>Candidate</th>
              <th>Score</th>
              <th>Salary</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id}>
                <td>
                  <input type="checkbox" className="form-check-input" checked={selected.includes(c.id)} onChange={() => toggleSelect(c.id)} />
                </td>
                <td>{c.name}</td>
                <td>{c.finalScore ?? "-"}</td>
                <td>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    style={{ width: 160 }}
                    value={salaryInputs[c.id] ?? ""}
                    onChange={(e) => setSalaryInputs({ ...salaryInputs, [c.id]: e.target.value })}
                    onBlur={() => handleSalaryBlur(c.id)}
                    placeholder="Enter salary"
                  />
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={4} className="text-center text-muted py-4">No candidates in the compensation pool.</td></tr>
            )}
          </tbody>
        </table>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={setPage} size={size} onSizeChange={(s) => { setSize(s); setPage(0); }} />
    </div>
  );
};

export default CompensationPoolTab;

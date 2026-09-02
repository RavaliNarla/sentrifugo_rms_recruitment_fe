import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import recruiterApiService from "../../core/recruiterApiService";

const AssignToPositionsTab = () => {
  const [requisitions, setRequisitions] = useState([]);
  const [positions, setPositions] = useState([]);
  const [requisitionId, setRequisitionId] = useState("");
  const [positionId, setPositionId] = useState("");
  const [allPanels, setAllPanels] = useState([]);
  const [assignedPanels, setAssignedPanels] = useState([]);
  const [selectedPanelId, setSelectedPanelId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    recruiterApiService.getApprovedRequisitions().then((res) => setRequisitions(res.data.data || []));
    recruiterApiService.getPanels().then((res) => setAllPanels(res.data.data || []));
  }, []);

  useEffect(() => {
    if (!requisitionId) { setPositions([]); setPositionId(""); return; }
    recruiterApiService.getActivePositionsByRequisition(requisitionId).then((res) => {
      setPositions(res.data.data || []);
      setPositionId("");
    });
  }, [requisitionId]);

  const loadAssigned = async () => {
    if (!positionId) { setAssignedPanels([]); return; }
    const res = await recruiterApiService.getPanelsByPosition(positionId);
    setAssignedPanels(res.data.data || []);
  };

  useEffect(() => {
    loadAssigned();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [positionId]);

  const assignedPanelIds = assignedPanels.map((p) => p.panelId);
  const availablePanels = allPanels.filter((p) => !assignedPanelIds.includes(p.id));

  const handleAssign = async () => {
    if (!selectedPanelId || !startDate || !endDate) {
      toast.error("Select a panel and both dates");
      return;
    }
    try {
      await recruiterApiService.assignPanelToPosition({ positionId, panelId: selectedPanelId, startDate, endDate });
      toast.success("Panel assigned to position successfully");
      setSelectedPanelId("");
      setStartDate("");
      setEndDate("");
      loadAssigned();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to assign panel");
    }
  };

  const handleRemove = async (id) => {
    if (!window.confirm("Remove this panel assignment?")) return;
    try {
      await recruiterApiService.removePanelFromPosition(id);
      toast.success("Panel assignment removed");
      loadAssigned();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to remove assignment");
    }
  };

  return (
    <div>
      <div className="row mb-4">
        <div className="col-md-6">
          <label className="form-label">Requisition</label>
          <select className="form-select" value={requisitionId} onChange={(e) => setRequisitionId(e.target.value)}>
            <option value="">Select Requisition</option>
            {requisitions.map((r) => <option key={r.id} value={r.id}>{r.requisitionCode} - {r.title}</option>)}
          </select>
        </div>
        <div className="col-md-6">
          <label className="form-label">Position</label>
          <select className="form-select" value={positionId} onChange={(e) => setPositionId(e.target.value)} disabled={!requisitionId}>
            <option value="">Select Position</option>
            {positions.map((p) => <option key={p.id} value={p.id}>{p.positionTitleName} - {p.locationName}</option>)}
          </select>
        </div>
      </div>

      {positionId && (
        <div className="row">
          <div className="col-md-5">
            <h6>Available Panels</h6>
            <div className="border rounded p-2" style={{ minHeight: 120 }}>
              {availablePanels.map((p) => (
                <div key={p.id} className="d-flex justify-content-between align-items-center py-1">
                  <span>{p.name}</span>
                  <button className="btn btn-sm btn-outline-primary" onClick={() => setSelectedPanelId(p.id)}>Select</button>
                </div>
              ))}
              {availablePanels.length === 0 && <div className="text-muted small">No more panels available</div>}
            </div>
          </div>

          <div className="col-md-7">
            <h6>Assign Selected Panel</h6>
            <div className="row g-2 align-items-end mb-3">
              <div className="col-md-4">
                <label className="form-label small">Panel</label>
                <select className="form-select form-select-sm" value={selectedPanelId} onChange={(e) => setSelectedPanelId(e.target.value)}>
                  <option value="">Select</option>
                  {availablePanels.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label small">Start Date</label>
                <input type="date" className="form-control form-control-sm" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="col-md-3">
                <label className="form-label small">End Date</label>
                <input type="date" className="form-control form-control-sm" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
              <div className="col-md-2">
                <button className="btn btn-sm btn-primary w-100" onClick={handleAssign}>Assign</button>
              </div>
            </div>

            <h6>Assigned Panels</h6>
            <table className="table table-sm">
              <thead className="table-light">
                <tr><th>Panel</th><th>Start</th><th>End</th><th></th></tr>
              </thead>
              <tbody>
                {assignedPanels.map((p) => (
                  <tr key={p.id}>
                    <td>{p.panelName}</td>
                    <td>{p.startDate}</td>
                    <td>{p.endDate}</td>
                    <td>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleRemove(p.id)}><i className="bi bi-trash" /></button>
                    </td>
                  </tr>
                ))}
                {assignedPanels.length === 0 && <tr><td colSpan={4} className="text-center text-muted py-3">No panels assigned yet</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignToPositionsTab;

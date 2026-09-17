import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import recruiterApiService from "../../core/recruiterApiService";
import DateInput from "../../shared/DateInput";
import ConfirmModal from "../../shared/ConfirmModal";
import { formatDate } from "../../shared/dateFormat";

const todayStr = () => new Date().toISOString().split("T")[0];

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
  const [confirmState, setConfirmState] = useState({ show: false, message: "", onConfirm: null });

  const askConfirm = (message, action) => setConfirmState({ show: true, message, onConfirm: action });
  const closeConfirm = () => setConfirmState({ show: false, message: "", onConfirm: null });

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
    // SCL_26: no past dates, and end date must be greater than (or equal to) the start date.
    if (startDate < todayStr()) {
      toast.error("Start Date cannot be in the past");
      return;
    }
    if (endDate < startDate) {
      toast.error("End Date must be on or after the Start Date");
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

  const handleRemove = (id) => {
    askConfirm("Are you sure you want to remove this panel assignment?", async () => {
      closeConfirm();
      try {
        await recruiterApiService.removePanelFromPosition(id);
        toast.success("Panel assignment removed");
        loadAssigned();
      } catch (e) {
        toast.error(e.response?.data?.message || "Failed to remove assignment");
      }
    });
  };

  return (
    <div className="panel-form-card">
      <div className="row mb-4">
        <div className="col-md-6">
          <label className="form-label fs-14">Requisition</label>
          <select className="form-select" value={requisitionId} onChange={(e) => setRequisitionId(e.target.value)}>
            <option value="">Select Requisition</option>
            {requisitions.map((r) => <option key={r.id} value={r.id}>{r.requisitionCode} - {r.title}</option>)}
          </select>
        </div>
        <div className="col-md-6">
          <label className="form-label fs-14">Position</label>
          <select className="form-select" value={positionId} onChange={(e) => setPositionId(e.target.value)} disabled={!requisitionId}>
            <option value="">Select Position</option>
            {positions.map((p) => <option key={p.id} value={p.id}>{p.positionTitleName} - {p.locationName}</option>)}
          </select>
        </div>
      </div>

      {positionId && (
        <div className="row">
          <div className="col-md-5">
            <div className="card-title mb-2">Available Panels</div>
            <div className="member-checklist">
              {availablePanels.map((p) => (
                <div key={p.id} className="d-flex justify-content-between align-items-center py-1">
                  <span className="fs-14">{p.name}</span>
                  <button className="btn btn-sm btn-outline-primary" onClick={() => setSelectedPanelId(p.id)}>Select</button>
                </div>
              ))}
              {availablePanels.length === 0 && <div className="text-muted fs-14">No more panels available</div>}
            </div>
          </div>

          <div className="col-md-7">
            <div className="card-title mb-2">Assign Selected Panel</div>
            <div className="row g-2 align-items-end mb-4">
              <div className="col-md-4">
                <label className="form-label fs-14">Panel</label>
                <select className="form-select form-select-sm" value={selectedPanelId} onChange={(e) => setSelectedPanelId(e.target.value)}>
                  <option value="">Select</option>
                  {availablePanels.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label fs-14">Start Date</label>
                <DateInput value={startDate} min={todayStr()} onChange={setStartDate} />
              </div>
              <div className="col-md-3">
                <label className="form-label fs-14">End Date</label>
                <DateInput value={endDate} min={startDate || todayStr()} onChange={setEndDate} />
              </div>
              <div className="col-md-2">
                <button className="btn btn-sm btn-primary w-100" onClick={handleAssign}>Assign</button>
              </div>
            </div>

            <div className="card-title mb-2">Assigned Panels</div>
            <table className="table table-navy mb-0">
              <thead>
                <tr><th>Panel</th><th>Start</th><th>End</th><th style={{ width: 60 }}></th></tr>
              </thead>
              <tbody>
                {assignedPanels.map((p) => (
                  <tr key={p.id}>
                    <td>{p.panelName}</td>
                    <td>{formatDate(p.startDate)}</td>
                    <td>{formatDate(p.endDate)}</td>
                    <td>
                      <button className="table-icon-btn delete" onClick={() => handleRemove(p.id)}><i className="bi bi-trash" /></button>
                    </td>
                  </tr>
                ))}
                {assignedPanels.length === 0 && <tr><td colSpan={4} className="text-center text-muted py-3">No panels assigned yet</td></tr>}
              </tbody>
            </table>
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

export default AssignToPositionsTab;

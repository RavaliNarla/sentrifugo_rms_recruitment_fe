import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import recruiterApiService from "../../../core/recruiterApiService";

const computeCapacity = (window) => {
  if (!window.interviewDate || !window.startTime || !window.endTime || !window.durationMinutes) return 0;
  const start = toMinutes(window.startTime);
  const end = toMinutes(window.endTime);
  const duration = Number(window.durationMinutes);
  if (duration <= 0 || end <= start) return 0;
  return Math.floor((end - start) / duration);
};

const toMinutes = (time) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

const EMPTY_WINDOW = { panelId: "", interviewDate: "", startTime: "", endTime: "", durationMinutes: 30 };

const ScheduleInterviewModal = ({ positionId, candidates, onClose, onScheduled }) => {
  const [panels, setPanels] = useState([]);
  const [windows, setWindows] = useState([{ ...EMPTY_WINDOW }]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    recruiterApiService.getActivePanelsByPosition(positionId)
      .then((res) => setPanels(res.data.data || []))
      .catch(() => toast.error("Failed to load assigned panels"));
  }, [positionId]);

  const updateWindow = (idx, field, value) => {
    setWindows((prev) => prev.map((w, i) => (i === idx ? { ...w, [field]: value } : w)));
  };

  const addWindow = () => setWindows((prev) => [...prev, { ...EMPTY_WINDOW }]);
  const removeWindow = (idx) => setWindows((prev) => prev.filter((_, i) => i !== idx));

  const totalCapacity = windows.reduce((sum, w) => sum + computeCapacity(w), 0);

  const selectedPanel = (panelId) => panels.find((p) => p.panelId === panelId);

  const handleSchedule = async () => {
    if (windows.some((w) => !w.panelId || !w.interviewDate || !w.startTime || !w.endTime)) {
      toast.error("Fill in all panel window fields");
      return;
    }
    if (windows.some((w) => !w.durationMinutes || Number(w.durationMinutes) <= 0)) {
      toast.error("Duration must be greater than 0 minutes");
      return;
    }
    if (windows.some((w) => toMinutes(w.endTime) <= toMinutes(w.startTime))) {
      toast.error("End time must be after start time for each panel window");
      return;
    }
    if (totalCapacity < candidates.length) {
      toast.error(`Not enough slots (${totalCapacity}) for ${candidates.length} candidate(s). Add more panel time.`);
      return;
    }
    setSaving(true);
    try {
      await recruiterApiService.scheduleInterviews({
        candidateIds: candidates.map((c) => c.id),
        panelWindows: windows.map((w) => ({
          panelId: w.panelId,
          interviewDate: w.interviewDate,
          startTime: w.startTime,
          endTime: w.endTime,
          durationMinutes: Number(w.durationMinutes),
        })),
      });
      toast.success(`Scheduled ${candidates.length} candidate(s) for interview`);
      onScheduled();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to schedule interviews");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Schedule Interview for {candidates.length} candidate(s)</h5>
            <button className="btn-close" onClick={onClose} />
          </div>
          <div className="modal-body">
            {panels.length === 0 && (
              <div className="alert alert-warning">
                No panels are assigned to this position yet. Assign one from Committee Management first.
              </div>
            )}

            {windows.map((w, idx) => {
              const panel = selectedPanel(w.panelId);
              return (
                <div key={idx} className="border rounded p-3 mb-2">
                  <div className="row g-2 align-items-end">
                    <div className="col-md-3">
                      <label className="form-label small">Panel</label>
                      <select className="form-select form-select-sm" value={w.panelId} onChange={(e) => updateWindow(idx, "panelId", e.target.value)}>
                        <option value="">Select Panel</option>
                        {panels.map((p) => <option key={p.id} value={p.panelId}>{p.panelName}</option>)}
                      </select>
                      {panel && <small className="text-muted">{panel.startDate} to {panel.endDate}</small>}
                    </div>
                    <div className="col-md-2">
                      <label className="form-label small">Date</label>
                      <input
                        type="date"
                        className="form-control form-control-sm"
                        min={panel?.startDate}
                        max={panel?.endDate}
                        value={w.interviewDate}
                        onChange={(e) => updateWindow(idx, "interviewDate", e.target.value)}
                      />
                    </div>
                    <div className="col-md-2">
                      <label className="form-label small">Start Time</label>
                      <input type="time" className="form-control form-control-sm" value={w.startTime} onChange={(e) => updateWindow(idx, "startTime", e.target.value)} />
                    </div>
                    <div className="col-md-2">
                      <label className="form-label small">End Time</label>
                      <input type="time" className="form-control form-control-sm" value={w.endTime} onChange={(e) => updateWindow(idx, "endTime", e.target.value)} />
                    </div>
                    <div className="col-md-2">
                      <label className="form-label small">Duration (mins)</label>
                      <select className="form-select form-select-sm" value={w.durationMinutes} onChange={(e) => updateWindow(idx, "durationMinutes", e.target.value)}>
                        {[10, 15, 30, 45, 60].map((d) => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div className="col-md-1">
                      <button className="btn btn-sm btn-outline-danger" onClick={() => removeWindow(idx)} disabled={windows.length === 1}>
                        <i className="bi bi-trash" />
                      </button>
                    </div>
                  </div>
                  <small className="text-muted">Capacity: {computeCapacity(w)} slot(s)</small>
                </div>
              );
            })}

            <button className="btn btn-sm btn-outline-primary" onClick={addWindow}>
              <i className="bi bi-plus-lg" /> Add Panel
            </button>

            <div className="mt-3">
              <b>Total capacity: {totalCapacity}</b> / {candidates.length} candidate(s) selected
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" disabled={saving || panels.length === 0} onClick={handleSchedule}>
              {saving ? "Scheduling..." : "Apply to All"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleInterviewModal;

import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import recruiterApiService from "../../../core/recruiterApiService";

const toMinutes = (time) => {
  if (!time) return 0;
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

const slotCount = (startTime, endTime, durationMinutes) => {
  const duration = Number(durationMinutes);
  if (!startTime || !endTime || !duration || duration <= 0) return 0;
  const start = toMinutes(startTime);
  const end = toMinutes(endTime);
  if (end <= start) return 0;
  return Math.floor((end - start) / duration);
};

/** Build a short preview of assigned times for the selected candidates. */
const previewSlots = (startTime, endTime, durationMinutes, count) => {
  const duration = Number(durationMinutes);
  const start = toMinutes(startTime);
  const end = toMinutes(endTime);
  if (!duration || end <= start) return [];
  const slots = [];
  for (let cursor = start; cursor + duration <= end && slots.length < count; cursor += duration) {
    const sH = String(Math.floor(cursor / 60)).padStart(2, "0");
    const sM = String(cursor % 60).padStart(2, "0");
    const e = cursor + duration;
    const eH = String(Math.floor(e / 60)).padStart(2, "0");
    const eM = String(e % 60).padStart(2, "0");
    slots.push(`${sH}:${sM} – ${eH}:${eM}`);
  }
  return slots;
};

/**
 * Simple one-day schedule: one panel, one date, one time window.
 * Default end 17:00, duration 30 minutes. Capacity is derived from the window.
 */
const ScheduleInterviewModal = ({ candidates, round = 1, onClose, onScheduled }) => {
  const [panels, setPanels] = useState([]);
  const [panelId, setPanelId] = useState("");
  const [interviewDate, setInterviewDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const interviewRound = Number(round) > 0 ? Number(round) : 1;

  const setField = (field, value, setter) => {
    setter(value);
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  };

  useEffect(() => {
    recruiterApiService.getPanels()
      .then((res) => setPanels(res.data.data || []))
      .catch(() => toast.error("Failed to load panels"));
  }, []);

  const capacity = useMemo(
    () => slotCount(startTime, endTime, durationMinutes),
    [startTime, endTime, durationMinutes]
  );

  const previews = useMemo(
    () => previewSlots(startTime, endTime, durationMinutes, candidates.length),
    [startTime, endTime, durationMinutes, candidates.length]
  );

  const selectedPanel = panels.find((p) => p.id === panelId);
  const enoughSlots = capacity >= candidates.length;

  const validate = () => {
    const next = {};
    if (!panelId) next.panelId = "Select a panel";
    if (!interviewDate) {
      next.interviewDate = "Select an interview date";
    } else if (interviewDate < new Date().toISOString().slice(0, 10)) {
      next.interviewDate = "Interview date cannot be in the past";
    }
    if (!startTime) next.startTime = "Start time is required";
    if (!endTime) {
      next.endTime = "End time is required";
    } else if (startTime && toMinutes(endTime) <= toMinutes(startTime)) {
      next.endTime = "End time must be after start time";
    }
    if (!durationMinutes || Number(durationMinutes) <= 0) {
      next.durationMinutes = "Duration must be greater than 0 minutes";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSchedule = async () => {
    if (!validate()) return;
    // The Schedule button is already disabled when slots don't fit (enoughSlots),
    // and the capacity box above already shows "not enough room" inline.
    setSaving(true);
    try {
      await recruiterApiService.scheduleInterviews({
        candidateIds: candidates.map((c) => c.id),
        panelId,
        interviewDate,
        startTime: startTime.length === 5 ? `${startTime}:00` : startTime,
        endTime: endTime.length === 5 ? `${endTime}:00` : endTime,
        durationMinutes: Number(durationMinutes),
        round: interviewRound,
      });
      toast.success(`Scheduled ${candidates.length} candidate(s) for Round ${interviewRound}. Each will receive an email.`);
      onScheduled();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to schedule interviews");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal show d-block" style={{ background: "rgba(0, 0, 0, 0.45)" }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <div>
              <h5 className="modal-title mb-0">Schedule Interviews</h5>
              <div className="text-muted small">
                {candidates.length} candidate(s) · Round {interviewRound} · one day at a time
              </div>
            </div>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>
          <div className="modal-body">
            {panels.length === 0 && (
              <div className="alert alert-warning py-2">
                No panels yet. Create one under Committee Management → Manage Panels.
              </div>
            )}

            <div className="mb-3">
              <span className="badge text-bg-light border text-app-primary">
                Round {interviewRound}{interviewRound > 1 ? " (next round)" : ""}
              </span>
            </div>

            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Panel <span className="text-danger">*</span></label>
                <select
                  className={`form-select ${errors.panelId ? "is-invalid" : ""}`}
                  value={panelId}
                  onChange={(e) => setField("panelId", e.target.value, setPanelId)}
                >
                  <option value="">Select panel</option>
                  {panels.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}{(p.memberNames || []).length ? ` (${p.memberNames.length} members)` : ""}
                    </option>
                  ))}
                </select>
                <div className="text-danger fs-13 mt-1" style={{ minHeight: "18px" }}>{errors.panelId || ""}</div>
                {!errors.panelId && selectedPanel?.memberNames?.length > 0 && (
                  <div className="text-muted small mt-n2">Members: {selectedPanel.memberNames.join(", ")}</div>
                )}
              </div>
              <div className="col-md-6">
                <label className="form-label">Interview date <span className="text-danger">*</span></label>
                <input
                  type="date"
                  className={`form-control ${errors.interviewDate ? "is-invalid" : ""}`}
                  min={new Date().toISOString().slice(0, 10)}
                  value={interviewDate}
                  onChange={(e) => {
                    const v = e.target.value;
                    setInterviewDate(v);
                    const todayStr = new Date().toISOString().slice(0, 10);
                    setErrors((prev) => ({
                      ...prev,
                      interviewDate: v && v < todayStr ? "Interview date cannot be in the past" : undefined,
                    }));
                  }}
                />
                <div className="text-danger fs-13 mt-1" style={{ minHeight: "18px" }}>{errors.interviewDate || ""}</div>
              </div>
              <div className="col-md-4">
                <label className="form-label">Start time <span className="text-danger">*</span></label>
                <input
                  type="time"
                  className={`form-control ${errors.startTime ? "is-invalid" : ""}`}
                  value={startTime}
                  onChange={(e) => setField("startTime", e.target.value, setStartTime)}
                />
                <div className="text-danger fs-13 mt-1" style={{ minHeight: "18px" }}>{errors.startTime || ""}</div>
              </div>
              <div className="col-md-4">
                <label className="form-label">End time <span className="text-danger">*</span></label>
                <input
                  type="time"
                  className={`form-control ${errors.endTime ? "is-invalid" : ""}`}
                  value={endTime}
                  onChange={(e) => setField("endTime", e.target.value, setEndTime)}
                />
                {errors.endTime ? (
                  <div className="text-danger fs-13 mt-1" style={{ minHeight: "18px" }}>{errors.endTime}</div>
                ) : (
                  <div className="text-muted small mt-1" style={{ minHeight: "18px" }}>Default 5:00 PM</div>
                )}
              </div>
              <div className="col-md-4">
                <label className="form-label">Each interview (mins)</label>
                <select
                  className={`form-select ${errors.durationMinutes ? "is-invalid" : ""}`}
                  value={durationMinutes}
                  onChange={(e) => setField("durationMinutes", Number(e.target.value), setDurationMinutes)}
                >
                  {[15, 20, 30, 45, 60].map((d) => <option key={d} value={d}>{d} minutes</option>)}
                </select>
                <div className="text-danger fs-13 mt-1" style={{ minHeight: "18px" }}>{errors.durationMinutes || ""}</div>
              </div>
            </div>

            <div className={`mt-3 p-3 rounded ${enoughSlots ? "bg-light" : "alert alert-warning mb-0"}`}>
              <div className="fw-semibold mb-1">
                {capacity} interview slot(s) fit · {candidates.length} candidate(s) selected
                {!enoughSlots && " — not enough room"}
              </div>
              {enoughSlots && previews.length > 0 && (
                <div className="small text-muted">
                  Planned times: {previews.join(", ")}
                  {capacity > candidates.length ? ` (+${capacity - candidates.length} spare)` : ""}
                </div>
              )}
            </div>

            <div className="mt-3">
              <div className="small text-muted mb-1">Candidates</div>
              <ul className="mb-0 ps-3">
                {candidates.map((c) => <li key={c.id}>{c.name}</li>)}
              </ul>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={saving || panels.length === 0 || !enoughSlots}
              onClick={handleSchedule}
            >
              {saving ? "Scheduling..." : "Schedule"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleInterviewModal;

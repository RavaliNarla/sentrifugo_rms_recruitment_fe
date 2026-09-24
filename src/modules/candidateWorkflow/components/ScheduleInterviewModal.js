import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import recruiterApiService from "../../../core/recruiterApiService";

const toMinutes = (time) => {
  if (!time || typeof time !== "string") return NaN;
  const parts = time.split(":").map(Number);
  if (parts.length < 2 || Number.isNaN(parts[0]) || Number.isNaN(parts[1])) return NaN;
  return parts[0] * 60 + parts[1];
};

const fromMinutes = (mins) => {
  if (mins == null || Number.isNaN(mins) || mins < 0 || mins >= 24 * 60) return "";
  const h = String(Math.floor(mins / 60)).padStart(2, "0");
  const m = String(mins % 60).padStart(2, "0");
  return `${h}:${m}`;
};

const formatRange = (start, end) => {
  if (!start || !end) return "—";
  return `${start.slice(0, 5)} – ${end.slice(0, 5)}`;
};

const rangesOverlap = (aStart, aEnd, bStart, bEnd) =>
  aStart < bEnd && bStart < aEnd;

/** Normalize break list: valid start < end only. */
const normalizeBreaks = (breaks) =>
  (breaks || [])
    .map((b) => ({ start: toMinutes(b.start), end: toMinutes(b.end) }))
    .filter((b) => !Number.isNaN(b.start) && !Number.isNaN(b.end) && b.end > b.start)
    .sort((a, b) => a.start - b.start);

/**
 * Pack interview slots into [windowStart, windowEnd), skipping break ranges.
 * Advances past breaks when a candidate slot would collide.
 */
export const generateSlotsSkippingBreaks = (startTime, endTime, durationMinutes, count, breaks) => {
  const duration = Number(durationMinutes);
  const winStart = toMinutes(startTime);
  const winEnd = toMinutes(endTime);
  if (!duration || duration <= 0 || Number.isNaN(winStart) || Number.isNaN(winEnd) || winEnd <= winStart) {
    return [];
  }
  const breakRanges = normalizeBreaks(breaks);
  const slots = [];
  let cursor = winStart;
  let guard = 0;

  while (slots.length < count && cursor + duration <= winEnd && guard < 5000) {
    guard += 1;
    const slotEnd = cursor + duration;
    const hit = breakRanges.find((b) => rangesOverlap(cursor, slotEnd, b.start, b.end));
    if (hit) {
      // Jump to end of the blocking break (never schedule inside it).
      cursor = Math.max(cursor + 1, hit.end);
      continue;
    }
    slots.push({ start: fromMinutes(cursor), end: fromMinutes(slotEnd) });
    cursor = slotEnd;
  }
  return slots;
};

/** How many duration-sized slots fit in the window after removing breaks. */
export const countFitSlots = (startTime, endTime, durationMinutes, breaks) => {
  // Ask for a large count; generator stops at window end.
  return generateSlotsSkippingBreaks(startTime, endTime, durationMinutes, 500, breaks).length;
};

const newBreakId = () => `brk-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

/**
 * One-day schedule: panel + date + window, optional breaks, per-candidate slot edits.
 */
const ScheduleInterviewModal = ({ candidates, round = 1, onClose, onScheduled }) => {
  const [panels, setPanels] = useState([]);
  const [panelId, setPanelId] = useState("");
  const [interviewDate, setInterviewDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [breaks, setBreaks] = useState([]); // { id, start, end }
  /** per candidateId: { start, end, manual } */
  const [assignments, setAssignments] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState({ start: "", end: "" });
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

  // Auto-fill non-manual assignments whenever window / duration / breaks / candidates change.
  useEffect(() => {
    const autoSlots = generateSlotsSkippingBreaks(
      startTime, endTime, durationMinutes, candidates.length, breaks
    );
    setAssignments((prev) => {
      const next = {};
      let autoIdx = 0;
      candidates.forEach((c) => {
        const existing = prev[c.id];
        if (existing?.manual && existing.start && existing.end) {
          next[c.id] = existing;
        } else if (autoIdx < autoSlots.length) {
          const slot = autoSlots[autoIdx++];
          next[c.id] = { start: slot.start, end: slot.end, manual: false };
        } else {
          next[c.id] = { start: "", end: "", manual: false };
        }
      });
      return next;
    });
  }, [startTime, endTime, durationMinutes, breaks, candidates]);

  const capacity = useMemo(
    () => countFitSlots(startTime, endTime, durationMinutes, breaks),
    [startTime, endTime, durationMinutes, breaks]
  );

  const selectedPanel = panels.find((p) => p.id === panelId);

  const breakErrors = useMemo(() => {
    const winStart = toMinutes(startTime);
    const winEnd = toMinutes(endTime);
    const map = {};
    breaks.forEach((b) => {
      const s = toMinutes(b.start);
      const e = toMinutes(b.end);
      if (!b.start || !b.end) {
        map[b.id] = "Set both start and end";
        return;
      }
      if (Number.isNaN(s) || Number.isNaN(e)) {
        map[b.id] = "Invalid time";
        return;
      }
      if (e <= s) {
        map[b.id] = "End must be after start";
        return;
      }
      if (!Number.isNaN(winStart) && !Number.isNaN(winEnd)) {
        if (s < winStart || e > winEnd) {
          map[b.id] = "Break must be inside the interview window";
          return;
        }
      }
      const overlapOther = breaks.some(
        (o) => o.id !== b.id && o.start && o.end
          && rangesOverlap(s, e, toMinutes(o.start), toMinutes(o.end))
      );
      if (overlapOther) map[b.id] = "Overlaps another break";
    });
    return map;
  }, [breaks, startTime, endTime]);

  const assignmentWarnings = useMemo(() => {
    const winStart = toMinutes(startTime);
    const winEnd = toMinutes(endTime);
    const breakRanges = normalizeBreaks(breaks);
    const warnings = {};
    const parsed = candidates.map((c) => {
      const a = assignments[c.id] || {};
      return {
        id: c.id,
        name: c.name,
        start: toMinutes(a.start),
        end: toMinutes(a.end),
        has: !!(a.start && a.end),
      };
    });

    parsed.forEach((p) => {
      if (!p.has) {
        warnings[p.id] = "No slot assigned";
        return;
      }
      if (Number.isNaN(p.start) || Number.isNaN(p.end) || p.end <= p.start) {
        warnings[p.id] = "Invalid time range";
        return;
      }
      if (!Number.isNaN(winStart) && !Number.isNaN(winEnd)
          && (p.start < winStart || p.end > winEnd)) {
        warnings[p.id] = "Outside interview window";
        return;
      }
      if (breakRanges.some((b) => rangesOverlap(p.start, p.end, b.start, b.end))) {
        warnings[p.id] = "Overlaps a break";
        return;
      }
      const clash = parsed.find(
        (o) => o.id !== p.id && o.has && !Number.isNaN(o.start) && !Number.isNaN(o.end)
          && rangesOverlap(p.start, p.end, o.start, o.end)
      );
      if (clash) warnings[p.id] = `Overlaps ${clash.name}`;
    });
    return warnings;
  }, [assignments, candidates, startTime, endTime, breaks]);

  const assignedCount = candidates.filter((c) => {
    const a = assignments[c.id];
    return a?.start && a?.end;
  }).length;
  const hasAssignmentWarnings = Object.keys(assignmentWarnings).length > 0;
  const hasBreakErrors = Object.keys(breakErrors).length > 0;
  const enoughSlots = capacity >= candidates.length || assignedCount === candidates.length;

  const addBreak = () => {
    setBreaks((prev) => [...prev, { id: newBreakId(), start: "", end: "" }]);
  };

  const updateBreak = (id, field, value) => {
    setBreaks((prev) => prev.map((b) => (b.id === id ? { ...b, [field]: value } : b)));
  };

  const removeBreak = (id) => {
    setBreaks((prev) => prev.filter((b) => b.id !== id));
  };

  const resetAllSlots = () => {
    const autoSlots = generateSlotsSkippingBreaks(
      startTime, endTime, durationMinutes, candidates.length, breaks
    );
    const next = {};
    candidates.forEach((c, i) => {
      if (i < autoSlots.length) {
        next[c.id] = { start: autoSlots[i].start, end: autoSlots[i].end, manual: false };
      } else {
        next[c.id] = { start: "", end: "", manual: false };
      }
    });
    setAssignments(next);
    setEditingId(null);
  };

  const clearSlot = (candidateId) => {
    setAssignments((prev) => ({
      ...prev,
      [candidateId]: { start: "", end: "", manual: true },
    }));
    if (editingId === candidateId) setEditingId(null);
  };

  const startEdit = (candidateId) => {
    const a = assignments[candidateId] || {};
    setEditingId(candidateId);
    setEditDraft({ start: a.start || "", end: a.end || "" });
  };

  const applyEdit = (candidateId) => {
    const s = toMinutes(editDraft.start);
    let e = toMinutes(editDraft.end);
    // If only start provided, derive end from duration.
    if (!Number.isNaN(s) && (Number.isNaN(e) || !editDraft.end) && durationMinutes > 0) {
      e = s + Number(durationMinutes);
      if (e >= 24 * 60) {
        toast.error("Slot would overflow past midnight");
        return;
      }
    }
    if (Number.isNaN(s) || Number.isNaN(e) || e <= s) {
      toast.error("Enter a valid start and end time");
      return;
    }
    setAssignments((prev) => ({
      ...prev,
      [candidateId]: {
        start: fromMinutes(s),
        end: fromMinutes(e),
        manual: true,
      },
    }));
    setEditingId(null);
  };

  const onEditStartChange = (value) => {
    const s = toMinutes(value);
    const end = !Number.isNaN(s) && durationMinutes > 0
      ? fromMinutes(s + Number(durationMinutes))
      : editDraft.end;
    setEditDraft({ start: value, end: end && toMinutes(end) < 24 * 60 ? end : "" });
  };

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
    if (hasBreakErrors) next.breaks = "Fix break time errors before scheduling";
    if (assignedCount < candidates.length) next.slots = "Every candidate needs a time slot";
    if (hasAssignmentWarnings) next.slots = next.slots || "Resolve slot warnings before scheduling";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSchedule = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const toApiTime = (t) => (t && t.length === 5 ? `${t}:00` : t);
      await recruiterApiService.scheduleInterviews({
        candidateIds: candidates.map((c) => c.id),
        panelId,
        interviewDate,
        startTime: toApiTime(startTime),
        endTime: toApiTime(endTime),
        durationMinutes: Number(durationMinutes),
        round: interviewRound,
        breaks: breaks
          .filter((b) => b.start && b.end)
          .map((b) => ({ startTime: toApiTime(b.start), endTime: toApiTime(b.end) })),
        candidateSlots: candidates.map((c) => ({
          candidateId: c.id,
          startTime: toApiTime(assignments[c.id].start),
          endTime: toApiTime(assignments[c.id].end),
        })),
      });
      toast.success(`Scheduled ${candidates.length} candidate(s) for Round ${interviewRound}. Each will receive an email.`);
      window.dispatchEvent(new CustomEvent("rms:notifications-refresh"));
      onScheduled();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to schedule interviews");
    } finally {
      setSaving(false);
    }
  };

  const canSchedule = !saving && panels.length > 0 && !hasBreakErrors && !hasAssignmentWarnings
    && assignedCount === candidates.length;

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
                <div className="text-danger fs-13 mt-1" style={{ minHeight: "18px" }}>{errors.endTime || ""}</div>
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

            <div className="mt-3">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <div className="fw-semibold small mb-0">Breaks</div>
                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={addBreak}>
                  <i className="bi bi-plus-lg me-1" />Add break
                </button>
              </div>
              {breaks.length === 0 && (
                <div className="text-muted small">No breaks. Add lunch or other gaps so interviews skip that time.</div>
              )}
              {breaks.map((b, idx) => (
                <div key={b.id} className="row g-2 align-items-start mb-2">
                  <div className="col-auto pt-2 text-muted small" style={{ minWidth: 72 }}>Break {idx + 1}</div>
                  <div className="col-md-3">
                    <input
                      type="time"
                      className={`form-control form-control-sm ${breakErrors[b.id] ? "is-invalid" : ""}`}
                      value={b.start}
                      onChange={(e) => updateBreak(b.id, "start", e.target.value)}
                      aria-label={`Break ${idx + 1} start`}
                    />
                  </div>
                  <div className="col-auto pt-2 small text-muted">to</div>
                  <div className="col-md-3">
                    <input
                      type="time"
                      className={`form-control form-control-sm ${breakErrors[b.id] ? "is-invalid" : ""}`}
                      value={b.end}
                      onChange={(e) => updateBreak(b.id, "end", e.target.value)}
                      aria-label={`Break ${idx + 1} end`}
                    />
                  </div>
                  <div className="col-auto">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => removeBreak(b.id)}
                      title="Remove break"
                    >
                      <i className="bi bi-trash" />
                    </button>
                  </div>
                  {breakErrors[b.id] && (
                    <div className="col-12 text-danger fs-13">{breakErrors[b.id]}</div>
                  )}
                </div>
              ))}
              {errors.breaks && <div className="text-danger fs-13">{errors.breaks}</div>}
            </div>

            <div className={`mt-3 p-3 rounded ${enoughSlots && !hasAssignmentWarnings ? "bg-light" : "alert alert-warning mb-0"}`}>
              <div className="fw-semibold mb-1">
                {capacity} interview slot(s) fit · {candidates.length} candidate(s) selected
                {capacity < candidates.length && " — not enough room with current breaks"}
              </div>
              <div className="small text-muted">
                Auto-slots skip breaks. Edit a candidate to place gaps or shift times.
              </div>
            </div>

            <div className="mt-3">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <div className="small text-muted mb-0">Candidates</div>
                <button type="button" className="btn btn-sm btn-link text-decoration-none p-0" onClick={resetAllSlots}>
                  Reset slots
                </button>
              </div>
              <ul className="list-group list-group-flush border rounded">
                {candidates.map((c) => {
                  const a = assignments[c.id] || {};
                  const warn = assignmentWarnings[c.id];
                  const isEditing = editingId === c.id;
                  return (
                    <li key={c.id} className="list-group-item px-3 py-2">
                      <div className="d-flex align-items-center gap-2 flex-wrap">
                        <div className="fw-semibold flex-grow-1" style={{ minWidth: 140 }}>{c.name}</div>
                        {isEditing ? (
                          <>
                            <input
                              type="time"
                              className="form-control form-control-sm"
                              style={{ width: 120 }}
                              value={editDraft.start}
                              onChange={(e) => onEditStartChange(e.target.value)}
                            />
                            <span className="text-muted small">–</span>
                            <input
                              type="time"
                              className="form-control form-control-sm"
                              style={{ width: 120 }}
                              value={editDraft.end}
                              onChange={(e) => setEditDraft((d) => ({ ...d, end: e.target.value }))}
                            />
                            <button type="button" className="btn btn-sm btn-primary" onClick={() => applyEdit(c.id)}>
                              Save
                            </button>
                            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setEditingId(null)}>
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <span className={`small ${warn ? "text-danger" : "text-muted"}`} style={{ minWidth: 110 }}>
                              {formatRange(a.start, a.end)}
                              {a.manual ? " · edited" : ""}
                            </span>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary"
                              title="Edit slot"
                              onClick={() => startEdit(c.id)}
                            >
                              <i className="bi bi-pencil" />
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary"
                              title="Clear slot"
                              onClick={() => clearSlot(c.id)}
                            >
                              Clear
                            </button>
                          </>
                        )}
                      </div>
                      {warn && <div className="text-danger fs-13 mt-1">{warn}</div>}
                    </li>
                  );
                })}
              </ul>
              {errors.slots && <div className="text-danger fs-13 mt-1">{errors.slots}</div>}
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={!canSchedule}
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

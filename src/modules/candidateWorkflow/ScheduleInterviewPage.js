import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import recruiterApiService from "../../core/recruiterApiService";
import ConfirmModal from "../../shared/ConfirmModal";
import DateInput from "../../shared/DateInput";
import TimeInput, { formatTime12 } from "../../shared/TimeInput";
import { formatDate } from "../../shared/dateFormat";
import { generateSlotsSkippingBreaks } from "./components/ScheduleInterviewModal";

const DURATIONS = [15, 20, 30, 45, 60];

const toMinutes = (time) => {
  if (!time || typeof time !== "string") return NaN;
  const [h, m] = time.split(":").map(Number);
  return Number.isNaN(h) || Number.isNaN(m) ? NaN : h * 60 + m;
};

const fromMinutes = (mins) => {
  if (mins == null || Number.isNaN(mins) || mins < 0 || mins >= 24 * 60) return "";
  return `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
};

const overlaps = (aStart, aEnd, bStart, bEnd) => aStart < bEnd && bStart < aEnd;
const todayStr = () => new Date().toISOString().slice(0, 10);
const toApiTime = (t) => (t && t.length === 5 ? `${t}:00` : t);
const newId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const makeDay = () => ({ id: newId("day"), panelId: "", date: "", start: "09:00", end: "17:00", duration: 30, breaks: [] });
const autoSlotsFor = (day) => generateSlotsSkippingBreaks(day.start, day.end, day.duration, 500, day.breaks);
const hhmm = (t) => (t ? String(t).slice(0, 5) : "");
const allSame = (list, key) => list.length > 0 && list.every((c) => c[key] && c[key] === list[0][key]);

/**
 * Reschedule: start Day 1 from the candidates' current schedule - panel and date only when all
 * candidates share them (and the date is not past), window = earliest start to latest end.
 */
const makeRescheduleDay = (list) => {
  const day = makeDay();
  if (allSame(list, "panelId")) day.panelId = list[0].panelId;
  if (allSame(list, "interviewDate") && list[0].interviewDate >= todayStr()) day.date = list[0].interviewDate;
  const starts = list.map((c) => hhmm(c.startTime)).filter(Boolean).sort();
  const ends = list.map((c) => hhmm(c.endTime)).filter(Boolean).sort();
  if (starts.length && ends.length && starts[0] < ends[ends.length - 1]) {
    day.start = starts[0];
    day.end = ends[ends.length - 1];
  }
  if (allSame(list, "durationMinutes") && DURATIONS.includes(Number(list[0].durationMinutes))) {
    day.duration = Number(list[0].durationMinutes);
  }
  return day;
};

/**
 * Schedule Interviews page: one round, spread over one or more days. Each day has its own
 * panel, date, time window, duration and breaks; candidates fill Day 1 first, then Day 2, ...
 * Opened from Candidate Pool (round 1) / Interview Pool (next round, or reschedule with
 * mode "reschedule") with the selected candidates in router state; returns to Candidate
 * Management with the same selection.
 */
const ScheduleInterviewPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  // De-duplicate by id: a repeated id breaks React's row keys and leaves ghost rows behind.
  const candidates = useMemo(() => {
    const seen = new Set();
    return (state?.candidates || []).filter((c) => c?.id && !seen.has(c.id) && seen.add(c.id));
  }, [state]);
  const round = Number(state?.round) > 0 ? Number(state.round) : 1;
  const returnTo = useMemo(() => state?.returnTo || {}, [state]);
  const isReschedule = state?.mode === "reschedule";
  const verb = isReschedule ? "Reschedule" : "Schedule";

  // Starting values - the page counts as unchanged (no discard prompt) until they are edited.
  const [initialDay] = useState(() => (isReschedule ? makeRescheduleDay(candidates) : makeDay()));
  const [initialRoundName] = useState(() => (isReschedule && allSame(candidates, "roundName") ? candidates[0].roundName : ""));

  const [panels, setPanels] = useState([]);
  const [contextLine, setContextLine] = useState("");
  const [days, setDays] = useState(() => [initialDay]);
  const [roundName, setRoundName] = useState(initialRoundName);
  /** candidateId -> { dayId, start, end, manual } */
  const [assign, setAssign] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({ start: "", end: "" });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  /** { title, message } shown in a modal when the schedule request fails. */
  const [scheduleError, setScheduleError] = useState(null);

  const goBack = () => navigate("/candidate-workflow", { state: { restore: returnTo } });

  useEffect(() => {
    recruiterApiService.getPanels()
      .then((res) => setPanels(res.data.data || []))
      .catch(() => toast.error("Failed to load panels"));
  }, []);

  useEffect(() => {
    if (!returnTo.requisitionId) return;
    Promise.all([
      recruiterApiService.getRequisition(returnTo.requisitionId).catch(() => null),
      recruiterApiService.getActivePositionsByRequisition(returnTo.requisitionId).catch(() => null),
    ]).then(([reqRes, posRes]) => {
      const req = reqRes?.data?.data;
      const pos = (posRes?.data?.data || []).find((p) => p.id === returnTo.positionId);
      setContextLine([
        req ? `${req.requisitionCode} - ${req.title}` : null,
        pos ? `${pos.positionTitleName} - ${pos.locationName}` : null,
      ].filter(Boolean).join(" · "));
    });
  }, [returnTo]);

  // Auto-fill: keep manual placements, then fill remaining candidates into free slots
  // on Day 1 first, then Day 2, and so on.
  useEffect(() => {
    setAssign((prev) => {
      const dayIds = new Set(days.map((d) => d.id));
      const next = {};
      candidates.forEach((c) => {
        const a = prev[c.id];
        if (a?.manual && dayIds.has(a.dayId)) next[c.id] = a;
      });
      const queues = days.map((d) => {
        const taken = Object.values(next)
          .filter((a) => a.dayId === d.id && a.start && a.end)
          .map((a) => [toMinutes(a.start), toMinutes(a.end)]);
        return {
          dayId: d.id,
          slots: autoSlotsFor(d).filter((s) => !taken.some(([ts, te]) => overlaps(toMinutes(s.start), toMinutes(s.end), ts, te))),
        };
      });
      let q = 0;
      candidates.forEach((c) => {
        if (next[c.id]) return;
        while (q < queues.length && queues[q].slots.length === 0) q += 1;
        if (q < queues.length) {
          const slot = queues[q].slots.shift();
          next[c.id] = { dayId: queues[q].dayId, start: slot.start, end: slot.end, manual: false };
        } else {
          next[c.id] = { dayId: "", start: "", end: "", manual: false };
        }
      });
      return next;
    });
  }, [days, candidates]);

  const dayIndex = (dayId) => days.findIndex((d) => d.id === dayId);
  const dayLabel = (dayId) => (dayIndex(dayId) >= 0 ? `Day ${dayIndex(dayId) + 1}` : "—");

  const updateDay = (dayId, patch) => {
    setDays((prev) => prev.map((d) => (d.id === dayId ? { ...d, ...patch } : d)));
    setErrors((prev) => {
      const next = { ...prev };
      Object.keys(patch).forEach((k) => delete next[`${dayId}.${k}`]);
      return next;
    });
  };
  const addDay = () => setDays((prev) => [...prev, makeDay()]);
  const removeDay = (dayId) => setDays((prev) => prev.filter((d) => d.id !== dayId));
  const addBreak = (day) => updateDay(day.id, { breaks: [...day.breaks, { id: newId("brk"), start: "", end: "" }] });
  const updateBreak = (day, breakId, field, value) =>
    updateDay(day.id, { breaks: day.breaks.map((b) => (b.id === breakId ? { ...b, [field]: value } : b)) });
  const removeBreak = (day, breakId) => updateDay(day.id, { breaks: day.breaks.filter((b) => b.id !== breakId) });

  const breakErrors = useMemo(() => {
    const map = {};
    days.forEach((d) => {
      const ws = toMinutes(d.start);
      const we = toMinutes(d.end);
      d.breaks.forEach((b) => {
        const s = toMinutes(b.start);
        const e = toMinutes(b.end);
        if (!b.start || !b.end) map[b.id] = "Set both start and end";
        else if (Number.isNaN(s) || Number.isNaN(e) || e <= s) map[b.id] = "End must be after start";
        else if (!Number.isNaN(ws) && !Number.isNaN(we) && (s < ws || e > we)) map[b.id] = "Must be inside the interview window";
        else if (d.breaks.some((o) => o.id !== b.id && o.start && o.end && overlaps(s, e, toMinutes(o.start), toMinutes(o.end)))) {
          map[b.id] = "Overlaps another break";
        }
      });
    });
    return map;
  }, [days]);

  const slotWarnings = useMemo(() => {
    const warnings = {};
    candidates.forEach((c) => {
      const a = assign[c.id] || {};
      const day = days.find((d) => d.id === a.dayId);
      if (!day || !a.start || !a.end) {
        warnings[c.id] = "No slot assigned";
        return;
      }
      const s = toMinutes(a.start);
      const e = toMinutes(a.end);
      if (Number.isNaN(s) || Number.isNaN(e) || e <= s) warnings[c.id] = "Invalid time range";
      else if (s < toMinutes(day.start) || e > toMinutes(day.end)) warnings[c.id] = "Outside this day's time window";
      else if (day.breaks.some((b) => b.start && b.end && overlaps(s, e, toMinutes(b.start), toMinutes(b.end)))) warnings[c.id] = "Overlaps a break";
      else {
        const clash = candidates.find((o) => {
          const oa = assign[o.id] || {};
          return o.id !== c.id && oa.dayId === a.dayId && oa.start && oa.end
            && overlaps(s, e, toMinutes(oa.start), toMinutes(oa.end));
        });
        if (clash) warnings[c.id] = `Overlaps ${clash.name}`;
      }
    });
    return warnings;
  }, [assign, candidates, days]);

  const assignedCount = (dayId) => candidates.filter((c) => assign[c.id]?.dayId === dayId && assign[c.id]?.start).length;
  const totalCapacity = days.reduce((sum, d) => sum + autoSlotsFor(d).length, 0);
  const isDirty = roundName.trim() !== (initialRoundName || "").trim() || days.length > 1
    || days.some((d) => ["panelId", "date", "start", "end", "duration"].some((k) => d[k] !== initialDay[k]) || d.breaks.length)
    || Object.values(assign).some((a) => a?.manual);

  const requestClose = () => {
    if (isDirty && !saving) setConfirmDiscard(true);
    else goBack();
  };

  // ---- per-candidate slot editing ----
  const firstFreeSlot = (dayId, candidateId) => {
    const day = days.find((d) => d.id === dayId);
    if (!day) return null;
    const taken = candidates
      .filter((c) => c.id !== candidateId && assign[c.id]?.dayId === dayId && assign[c.id]?.start)
      .map((c) => [toMinutes(assign[c.id].start), toMinutes(assign[c.id].end)]);
    return autoSlotsFor(day).find((s) => !taken.some(([ts, te]) => overlaps(toMinutes(s.start), toMinutes(s.end), ts, te))) || null;
  };

  const moveToDay = (candidateId, dayId) => {
    const slot = firstFreeSlot(dayId, candidateId);
    setAssign((prev) => ({ ...prev, [candidateId]: { dayId, start: slot?.start || "", end: slot?.end || "", manual: true } }));
    if (editingId === candidateId) setEditingId(null);
  };

  const startEdit = (candidateId) => {
    const a = assign[candidateId] || {};
    setEditingId(candidateId);
    setDraft({ start: a.start || "", end: a.end || "" });
  };

  const onDraftStartChange = (candidateId, value) => {
    const day = days.find((d) => d.id === assign[candidateId]?.dayId);
    const s = toMinutes(value);
    const end = day && !Number.isNaN(s) ? fromMinutes(s + Number(day.duration)) : draft.end;
    setDraft({ start: value, end });
  };

  const applyEdit = (candidateId) => {
    const s = toMinutes(draft.start);
    const e = toMinutes(draft.end);
    if (Number.isNaN(s) || Number.isNaN(e) || e <= s) {
      toast.error("Enter a valid start and end time");
      return;
    }
    setAssign((prev) => ({ ...prev, [candidateId]: { ...prev[candidateId], start: fromMinutes(s), end: fromMinutes(e), manual: true } }));
    setEditingId(null);
  };

  const clearSlot = (candidateId) => {
    setAssign((prev) => ({ ...prev, [candidateId]: { ...prev[candidateId], start: "", end: "", manual: true } }));
    if (editingId === candidateId) setEditingId(null);
  };

  const resetSlots = () => {
    setAssign({});
    setEditingId(null);
    setDays((prev) => [...prev]); // re-run the auto-fill
  };

  // ---- validation + save ----
  const validate = () => {
    const next = {};
    days.forEach((d, i) => {
      if (!d.panelId) next[`${d.id}.panelId`] = "Select a panel";
      if (!d.date) next[`${d.id}.date`] = "Select an interview date";
      else if (d.date < todayStr()) next[`${d.id}.date`] = "Interview date cannot be in the past";
      if (!d.start) next[`${d.id}.start`] = "Start time is required";
      if (!d.end) next[`${d.id}.end`] = "End time is required";
      else if (d.start && toMinutes(d.end) <= toMinutes(d.start)) next[`${d.id}.end`] = "End time must be after start time";
      if (assignedCount(d.id) === 0) next[`${d.id}.day`] = `No candidates are assigned to Day ${i + 1}. Remove it or move candidates to it.`;
      const duplicate = days.find((o, j) => j < i && o.date && o.date === d.date && o.panelId && o.panelId === d.panelId);
      if (duplicate) next[`${d.id}.date`] = `Same date and panel as Day ${dayIndex(duplicate.id) + 1}`;
    });
    if (roundName.trim().length > 120) next.roundName = "Round name must be at most 120 characters";
    if (Object.keys(breakErrors).length) next.slots = "Fix the break time errors first";
    if (Object.keys(slotWarnings).length) next.slots = "Every candidate needs a valid, non-overlapping slot";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSchedule = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      // One request for all days - the backend saves every day or none.
      const save = isReschedule ? recruiterApiService.rescheduleInterviewsMultiDay : recruiterApiService.scheduleInterviewsMultiDay;
      await save({
        round,
        roundName: roundName.trim() || undefined,
        days: days.map((day) => {
          const dayCandidates = candidates.filter((c) => assign[c.id]?.dayId === day.id);
          return {
            candidateIds: dayCandidates.map((c) => c.id),
            panelId: day.panelId,
            interviewDate: day.date,
            startTime: toApiTime(day.start),
            endTime: toApiTime(day.end),
            durationMinutes: Number(day.duration),
            breaks: day.breaks.filter((b) => b.start && b.end).map((b) => ({ startTime: toApiTime(b.start), endTime: toApiTime(b.end) })),
            candidateSlots: dayCandidates.map((c) => ({
              candidateId: c.id,
              startTime: toApiTime(assign[c.id].start),
              endTime: toApiTime(assign[c.id].end),
            })),
          };
        }),
      });
      toast.success(isReschedule
        ? `Rescheduled ${candidates.length} candidate(s) for Round ${round}. Updated invites sent.`
        : `Scheduled ${candidates.length} candidate(s) for Round ${round} across ${days.length} day(s). Each will receive an email.`);
      window.dispatchEvent(new CustomEvent("rms:notifications-refresh"));
      goBack();
    } catch (e) {
      const message = e.response?.data?.message || `Failed to ${verb.toLowerCase()} interviews`;
      // Backend prefixes multi-day errors with "Day N (dd-MMM-yyyy): " - show that as the heading.
      const match = message.match(/^Day (\d+) \(([^)]+)\):\s*([\s\S]*)$/);
      setScheduleError(match
        ? { title: `Day ${match[1]} (${match[2]}) could not be ${verb.toLowerCase()}d`, message: match[3] }
        : { title: `Could not ${verb.toLowerCase()} interviews`, message });
    } finally {
      setSaving(false);
    }
  };

  if (candidates.length === 0) {
    return (
      <div className="app-card text-center py-5">
        <div className="text-muted mb-3">No candidates selected for scheduling.</div>
        <button type="button" className="btn btn-primary" onClick={goBack}>Back to Candidate Management</button>
      </div>
    );
  }

  const err = (dayId, field) => errors[`${dayId}.${field}`];
  // Shown as soon as the times are picked, not only on Schedule.
  const endError = (day) => err(day.id, "end")
    || (day.start && day.end && toMinutes(day.end) <= toMinutes(day.start) ? "End time must be after start time" : "");
  const draftInvalid = !!(draft.start && draft.end && toMinutes(draft.end) <= toMinutes(draft.start));
  const fieldError = (message) => <div className="text-danger fs-13 mt-1" style={{ minHeight: "18px" }}>{message || ""}</div>;

  return (
    <div style={{ fontFamily: "'Roboto', 'Segoe UI', system-ui, sans-serif" }}>
      <div className="app-card mb-3">
        <button type="button" className="btn btn-link p-0 mb-2 text-decoration-none fs-14" onClick={requestClose}>
          <i className="bi bi-arrow-left me-1" />Back to Candidate Management
        </button>
        <div className="d-flex justify-content-between align-items-end flex-wrap gap-2">
          <div>
            <div className="mb-1" style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--tb-title)" }}>
              {verb} Interviews <span className="text-muted fw-normal">· Round {round}{round > 1 && !isReschedule ? " (next round)" : ""}{roundName.trim() ? ` — ${roundName.trim()}` : ""}</span>
            </div>
            {contextLine && <div className="text-muted small">{contextLine}</div>}
            <div className="mt-2" style={{ maxWidth: 360 }}>
              <label className="form-label mb-1">Round name</label>
              <input
                type="text"
                className={`form-control form-control-sm ${errors.roundName ? "is-invalid" : ""}`}
                placeholder={round === 1 ? "e.g. Technical" : "e.g. Managerial"}
                maxLength={120}
                value={roundName}
                onChange={(e) => { setRoundName(e.target.value); setErrors((prev) => ({ ...prev, roundName: undefined })); }}
              />
              {errors.roundName && <div className="text-danger fs-13 mt-1">{errors.roundName}</div>}
            </div>
          </div>
          <div className="d-flex flex-column align-items-end gap-2">
            <div className="text-muted small">
              <span className="fw-semibold text-body">{candidates.length}</span> candidate(s) ·{" "}
              <span className="fw-semibold text-body">{totalCapacity}</span> slot(s) available across {days.length} day(s)
            </div>
            <button type="button" className="btn btn-sm btn-outline-primary" onClick={addDay}>
              <i className="bi bi-calendar-plus me-1" />Add another day
            </button>
          </div>
        </div>
        {panels.length === 0 && (
          <div className="alert alert-warning py-2 mt-3 mb-0">No panels yet. Create one under Panel Management → Manage Panels.</div>
        )}
      </div>

      <div className="row g-3 mb-3">
        {days.map((day, i) => {
          const capacity = autoSlotsFor(day).length;
          const assigned = assignedCount(day.id);
          const panel = panels.find((p) => p.id === day.panelId);
          return (
            <div className="col-lg-6" key={day.id}>
              <div className={`app-card h-100 ${err(day.id, "day") ? "border border-danger" : ""}`}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="d-flex align-items-center gap-2">
                    <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--tb-title)" }}>Day {i + 1}</span>
                    {day.date && <span className="text-muted small">{formatDate(day.date)}</span>}
                    <span className={`badge rounded-pill ${assigned > capacity ? "text-bg-danger" : "text-bg-light border"}`}>
                      {assigned} / {capacity} slots used
                    </span>
                  </div>
                  {days.length > 1 && (
                    <button type="button" className="btn btn-sm btn-outline-danger" title="Remove this day" onClick={() => removeDay(day.id)}>
                      <i className="bi bi-trash" />
                    </button>
                  )}
                </div>

                <div className="row g-2">
                  <div className="col-md-6">
                    <label className="form-label">Panel <span className="text-danger">*</span></label>
                    <select
                      className={`form-select ${err(day.id, "panelId") ? "is-invalid" : ""}`}
                      value={day.panelId}
                      onChange={(e) => updateDay(day.id, { panelId: e.target.value })}
                    >
                      <option value="">Select panel</option>
                      {panels.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    {err(day.id, "panelId")
                      ? fieldError(err(day.id, "panelId"))
                      : <div className="text-muted fs-13 mt-1 text-truncate" style={{ minHeight: "18px" }} title={panel?.memberNames?.join(", ")}>
                          {panel?.memberNames?.length ? `Members: ${panel.memberNames.join(", ")}` : ""}
                        </div>}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Interview date <span className="text-danger">*</span></label>
                    <DateInput
                      value={day.date}
                      min={todayStr()}
                      className={err(day.id, "date") ? "is-invalid" : ""}
                      onChange={(v) => updateDay(day.id, { date: v })}
                    />
                    {fieldError(err(day.id, "date"))}
                  </div>
                  <div className="col-4">
                    <label className="form-label">Start time <span className="text-danger">*</span></label>
                    <TimeInput value={day.start} invalid={!!err(day.id, "start")} ariaLabel="Start time"
                      onChange={(v) => updateDay(day.id, { start: v })} />
                    {fieldError(err(day.id, "start"))}
                  </div>
                  <div className="col-4">
                    <label className="form-label">End time <span className="text-danger">*</span></label>
                    <TimeInput value={day.end} invalid={!!endError(day)} ariaLabel="End time"
                      onChange={(v) => updateDay(day.id, { end: v })} />
                    {fieldError(endError(day))}
                  </div>
                  <div className="col-4">
                    <label className="form-label">Interview Duration</label>
                    <select className="form-select" value={day.duration} onChange={(e) => updateDay(day.id, { duration: Number(e.target.value) })}>
                      {DURATIONS.map((d) => <option key={d} value={d}>{d} mins</option>)}
                    </select>
                  </div>
                </div>

                <div className="border-top pt-2 mt-1">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="form-label mb-0">Breaks</span>
                    <button type="button" className="btn btn-link btn-sm p-0 text-decoration-none" onClick={() => addBreak(day)}>
                      <i className="bi bi-plus-lg me-1" />Add break
                    </button>
                  </div>
                  {day.breaks.length === 0 && <div className="text-muted fs-13">No breaks — interviews run continuously.</div>}
                  {day.breaks.map((b) => (
                    <div key={b.id} className="mb-1">
                      <div className="d-flex align-items-center gap-2">
                        <div style={{ width: 160 }}>
                          <TimeInput size="sm" value={b.start} invalid={!!breakErrors[b.id]} ariaLabel="Break start"
                            onChange={(v) => updateBreak(day, b.id, "start", v)} />
                        </div>
                        <span className="text-muted small">to</span>
                        <div style={{ width: 160 }}>
                          <TimeInput size="sm" value={b.end} invalid={!!breakErrors[b.id]} ariaLabel="Break end"
                            onChange={(v) => updateBreak(day, b.id, "end", v)} />
                        </div>
                        <button type="button" className="btn btn-sm btn-link text-danger p-0" title="Remove break" onClick={() => removeBreak(day, b.id)}>
                          <i className="bi bi-x-circle" />
                        </button>
                      </div>
                      {breakErrors[b.id] && <div className="text-danger fs-13">{breakErrors[b.id]}</div>}
                    </div>
                  ))}
                </div>
                {err(day.id, "day") && <div className="text-danger fs-13 mt-2">{err(day.id, "day")}</div>}
              </div>
            </div>
          );
        })}

      </div>

      <div className="app-card">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--tb-title)" }}>Candidates ({candidates.length})</span>
          <button type="button" className="btn btn-link btn-sm p-0 text-decoration-none" onClick={resetSlots}>
            <i className="bi bi-arrow-counterclockwise me-1" />Reset slots
          </button>
        </div>
        <div className="table-responsive border rounded" style={{ maxHeight: 420, overflowY: "auto" }}>
          <table className="table table-hover align-middle mb-0">
            <thead style={{ position: "sticky", top: 0, zIndex: 1 }}>
              <tr className="text-muted fs-13">
                <th style={{ width: 50 }}>#</th>
                <th>Candidate</th>
                {isReschedule && <th style={{ width: 280 }}>Current slot</th>}
                <th style={{ width: 230 }}>Day</th>
                <th style={{ width: 240 }}>Slot</th>
                <th style={{ width: 100 }} className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((c, idx) => {
                const a = assign[c.id] || {};
                const warn = slotWarnings[c.id];
                const isEditing = editingId === c.id;
                const day = days.find((d) => d.id === a.dayId);
                return (
                  <tr key={c.id}>
                    <td className="text-muted">{idx + 1}</td>
                    <td>
                      <div className="fw-semibold">{c.name}</div>
                      {c.email && <div className="text-muted fs-13">{c.email}</div>}
                    </td>
                    {isReschedule && (
                      <td className="fs-13">
                        {c.interviewDate ? (
                          <>
                            <div className="text-nowrap">{formatDate(c.interviewDate)} · {formatTime12(hhmm(c.startTime))} – {formatTime12(hhmm(c.endTime))}</div>
                            {c.panelName && <div className="text-muted">{c.panelName}</div>}
                          </>
                        ) : <span className="text-muted">—</span>}
                      </td>
                    )}
                    <td>
                      <select className="form-select form-select-sm" value={a.dayId || ""} onChange={(e) => moveToDay(c.id, e.target.value)}>
                        {!a.dayId && <option value="">Unassigned</option>}
                        {days.map((d, i) => (
                          <option key={d.id} value={d.id}>Day {i + 1}{d.date ? ` · ${formatDate(d.date)}` : ""}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      {isEditing ? (
                        <>
                          {/* Start above end - two 12-hour pickers side by side don't fit the Slot column. */}
                          <div className="d-flex flex-column gap-1">
                            <TimeInput size="sm" value={draft.start} ariaLabel="Slot start"
                              onChange={(v) => onDraftStartChange(c.id, v)} />
                            <TimeInput size="sm" value={draft.end} invalid={draftInvalid} ariaLabel="Slot end"
                              onChange={(v) => setDraft((d) => ({ ...d, end: v }))} />
                          </div>
                          {draftInvalid && <div className="text-danger fs-13 mt-1">End time must be after start time</div>}
                        </>
                      ) : (
                        <div>
                          <span className={warn ? "text-danger" : ""}>
                            {a.start && a.end ? `${formatTime12(a.start)} – ${formatTime12(a.end)}` : "—"}
                          </span>
                          {a.manual && a.start && <span className="badge text-bg-light border ms-2 fw-normal">edited</span>}
                          {warn && <div className="text-danger fs-13">{warn}</div>}
                          {!warn && day && !day.date && <div className="text-muted fs-13">{dayLabel(day.id)} has no date yet</div>}
                        </div>
                      )}
                    </td>
                    <td className="text-end text-nowrap">
                      {isEditing ? (
                        <>
                          <button type="button" className="icon-btn-circle me-1" title="Save slot" disabled={draftInvalid} onClick={() => applyEdit(c.id)}>
                            <i className="bi bi-check-lg" />
                          </button>
                          <button type="button" className="icon-btn-circle" title="Cancel" onClick={() => setEditingId(null)}>
                            <i className="bi bi-x-lg" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button type="button" className="icon-btn-circle me-1" title="Edit slot" onClick={() => startEdit(c.id)} disabled={!a.dayId}>
                            <i className="bi bi-pencil" />
                          </button>
                          <button type="button" className="icon-btn-circle danger" title="Clear slot" onClick={() => clearSlot(c.id)}>
                            <i className="bi bi-x-lg" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {errors.slots && <div className="text-danger fs-13 mt-2">{errors.slots}</div>}

        <div className="d-flex justify-content-end gap-2 border-top pt-3 mt-3">
          <button type="button" className="btn btn-secondary" onClick={requestClose}>Cancel</button>
          <button type="button" className="btn btn-primary" disabled={saving || panels.length === 0} onClick={handleSchedule}>
            {saving ? `${verb === "Reschedule" ? "Rescheduling" : "Scheduling"}...` : `${verb} ${candidates.length} candidate(s)`}
          </button>
        </div>
      </div>

      <ConfirmModal
        show={confirmDiscard}
        title="Discard changes?"
        message="The interview schedule you set up has not been saved. Leave this page and discard it?"
        confirmLabel="Discard"
        confirmVariant="danger"
        cancelLabel="Stay"
        onConfirm={() => { setConfirmDiscard(false); goBack(); }}
        onCancel={() => setConfirmDiscard(false)}
      />

      {scheduleError && (
        <div className="modal show d-block" style={{ background: "rgba(0, 0, 0, 0.45)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title text-danger">
                  <i className="bi bi-exclamation-circle-fill me-2" />
                  {scheduleError.title}
                </h5>
                <button className="btn-close" onClick={() => setScheduleError(null)} />
              </div>
              <div className="modal-body">
                <p className="mb-2">{scheduleError.message}</p>
                <p className="mb-0 text-muted small">Nothing was scheduled and no emails were sent. Fix the day above and try again.</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-primary" onClick={() => setScheduleError(null)}>OK</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleInterviewPage;

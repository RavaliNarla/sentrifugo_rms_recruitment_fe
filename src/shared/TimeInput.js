import React from "react";
import "./TimeInput.css";

/**
 * 12-hour time picker (hour / minute / AM-PM dropdowns) that looks the same in every browser.
 * A native <input type="time"> shows 24-hour in Chrome on a 24-hour OS but AM/PM in Firefox,
 * and its format can't be forced - so, like DateInput, we render our own display.
 *
 * value / onChange use "HH:mm" (24-hour), the same as a native time input, so callers and the
 * API payloads are unchanged. "" = not set.
 */
const pad = (n) => String(n).padStart(2, "0");
const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1));

const toParts = (value) => {
  const match = /^(\d{1,2}):(\d{2})/.exec(value || "");
  if (!match) return { h: "", m: "", p: "AM" };
  const hours = Number(match[1]);
  return { h: String(hours % 12 === 0 ? 12 : hours % 12), m: match[2], p: hours < 12 ? "AM" : "PM" };
};

const toValue = ({ h, m, p }) => {
  let hours = Number(h) % 12;
  if (p === "PM") hours += 12;
  return `${pad(hours)}:${m}`;
};

/** "13:30" -> "01:30 PM" - for read-only display next to TimeInput fields. */
export const formatTime12 = (value) => {
  const { h, m, p } = toParts(value);
  return h ? `${pad(h)}:${m} ${p}` : "";
};

const TimeInput = ({ value, onChange, minuteStep = 5, invalid = false, size, disabled = false, ariaLabel = "Time" }) => {
  const parts = toParts(value);
  const minutes = Array.from({ length: Math.ceil(60 / minuteStep) }, (_, i) => pad(i * minuteStep));
  // Keep an existing off-step minute (e.g. 09:07 from saved data) selectable.
  if (parts.m && !minutes.includes(parts.m)) minutes.push(parts.m);
  minutes.sort();

  const change = (key, v) => {
    const next = { ...parts, [key]: v };
    if (!next.h) {
      onChange("");
      return;
    }
    if (!next.m) next.m = "00";
    onChange(toValue(next));
  };

  // The wrapper is the visible "input" box; the three selects inside are borderless.
  const boxClass = `form-control ${size === "sm" ? "form-control-sm" : ""} time-input ${invalid ? "is-invalid" : ""} ${disabled ? "disabled" : ""}`;
  return (
    <div className={boxClass} role="group" aria-label={ariaLabel}>
      <select className="time-input-hour" value={parts.h} disabled={disabled}
        onChange={(e) => change("h", e.target.value)} aria-label={`${ariaLabel} hour`}>
        <option value="">--</option>
        {HOURS.map((h) => <option key={h} value={h}>{pad(h)}</option>)}
      </select>
      <span className="time-input-sep">:</span>
      <select className="time-input-minute" value={parts.m} disabled={disabled || !parts.h}
        onChange={(e) => change("m", e.target.value)} aria-label={`${ariaLabel} minute`}>
        {!parts.m && <option value="">--</option>}
        {minutes.map((m) => <option key={m} value={m}>{m}</option>)}
      </select>
      <select className="time-input-period" value={parts.p} disabled={disabled || !parts.h}
        onChange={(e) => change("p", e.target.value)} aria-label={`${ariaLabel} AM or PM`}>
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </select>
      <i className="bi bi-clock time-input-icon" aria-hidden="true" />
    </div>
  );
};

export default TimeInput;

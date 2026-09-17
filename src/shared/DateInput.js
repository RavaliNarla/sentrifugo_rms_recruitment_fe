import React from "react";
import "./DateInput.css";

/**
 * Wraps a native <input type="date"> (kept for a real, accessible, mobile-friendly
 * date picker + native min/max enforcement) with an always-visible DD-MM-YYYY
 * display, so the shown format doesn't change with the browser/OS locale
 * (SCL_04 - date fields must show DD-MM-YYYY across every screen).
 *
 * The native input sits on top (transparent) and receives all clicks/typing;
 * the formatted text underneath is purely cosmetic.
 */
const formatDisplay = (value) => {
  if (!value) return "";
  const parts = value.split("-");
  if (parts.length !== 3) return value;
  const [y, m, d] = parts;
  return `${d}-${m}-${y}`;
};

const DateInput = ({ value, onChange, min, max, disabled, placeholder = "dd-mm-yyyy", className = "" }) => {
  return (
    <div className={`date-input-wrap ${className}`}>
      <input
        type="date"
        className="date-input-native"
        value={value || ""}
        min={min}
        max={max}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      />
      <div className={`date-input-display form-control ${disabled ? "disabled" : ""}`}>
        <span className={value ? "" : "text-muted"}>{value ? formatDisplay(value) : placeholder}</span>
        <i className="bi bi-calendar3" />
      </div>
    </div>
  );
};

export default DateInput;

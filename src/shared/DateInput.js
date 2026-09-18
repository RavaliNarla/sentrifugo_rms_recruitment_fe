import React, { useRef } from "react";
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

// The browser's own native calendar icon sits flush right, roughly this wide -
// a click there already opens/closes the picker natively; calling showPicker()
// again on top of that collides with the native toggle and closes it right back.
const NATIVE_ICON_ZONE_PX = 32;

const DateInput = ({ value, onChange, min, max, disabled, placeholder = "dd-mm-yyyy", className = "" }) => {
  const inputRef = useRef(null);

  // Native date inputs only open the picker when the browser's own calendar
  // icon is clicked; showPicker() lets a click anywhere else in the field open it too.
  const openPicker = (e) => {
    if (disabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    if (e.clientX >= rect.right - NATIVE_ICON_ZONE_PX) return;
    try {
      inputRef.current?.showPicker?.();
    } catch {
      // showPicker() can throw (e.g. unsupported browser) - clicking still focuses the field.
    }
  };

  return (
    <div className={`date-input-wrap ${className}`}>
      <input
        ref={inputRef}
        type="date"
        className="date-input-native"
        value={value || ""}
        min={min}
        max={max}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        onClick={openPicker}
      />
      <div className={`date-input-display form-control ${disabled ? "disabled" : ""}`}>
        <span className={value ? "" : "text-muted"}>{value ? formatDisplay(value) : placeholder}</span>
        <i className="bi bi-calendar3" />
      </div>
    </div>
  );
};

export default DateInput;

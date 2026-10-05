import React, { useEffect, useMemo, useRef, useState } from "react";
import "./SearchableSelect.css";

/**
 * Drop-in replacement for a <select> with a type-to-filter search box.
 * Looks like a Bootstrap .form-select when closed; opens a panel with a search input and the
 * matching options. Keyboard: Up/Down to move, Enter to pick, Esc to close.
 *
 * options: [{ value, label }] - include the "" option (e.g. "All Statuses") yourself if needed.
 * onChange(value) receives the option's value (not an event).
 */
const SearchableSelect = ({
  value,
  onChange,
  options,
  placeholder = "Select",
  searchPlaceholder = "Search...",
  disabled = false,
  invalid = false,
  size,
  style,
  className = "",
  ariaLabel,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const rootRef = useRef(null);
  const searchRef = useRef(null);
  const listRef = useRef(null);

  const selected = options.find((o) => String(o.value) === String(value ?? ""));
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? options.filter((o) => String(o.label).toLowerCase().includes(q)) : options;
  }, [options, query]);

  // Close when clicking anywhere outside.
  useEffect(() => {
    if (!open) return undefined;
    const onDocMouseDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [open]);

  // On open: clear the search, highlight the current value, focus the search box.
  useEffect(() => {
    if (!open) return;
    setQuery("");
    const idx = options.findIndex((o) => String(o.value) === String(value ?? ""));
    setActive(idx >= 0 ? idx : 0);
    setTimeout(() => searchRef.current?.focus(), 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Keep the highlighted option visible while moving with the arrow keys.
  useEffect(() => {
    if (!open) return;
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  const pick = (opt) => {
    setOpen(false);
    if (String(opt.value) !== String(value ?? "")) onChange(opt.value);
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[active]) pick(filtered[active]);
    } else if (e.key === "Escape" || e.key === "Tab") {
      setOpen(false);
    }
  };

  const sizeClass = size === "sm" ? "form-select-sm" : "";
  return (
    <div ref={rootRef} className={`searchable-select ${className}`} style={style}>
      <button
        type="button"
        className={`form-select ${sizeClass} searchable-select-toggle ${invalid ? "is-invalid" : ""}`}
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (!open && (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            setOpen(true);
          }
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        title={selected?.label || placeholder}
      >
        <span className={selected && selected.value !== "" ? "" : "text-muted-select"}>
          {selected ? selected.label : placeholder}
        </span>
      </button>

      {open && (
        <div className="searchable-select-menu shadow-sm">
          <div className="searchable-select-search">
            <i className="bi bi-search" />
            <input
              ref={searchRef}
              className="form-control form-control-sm"
              placeholder={searchPlaceholder}
              value={query}
              onChange={(e) => { setQuery(e.target.value); setActive(0); }}
              onKeyDown={onKeyDown}
              aria-label={searchPlaceholder}
            />
          </div>
          <ul ref={listRef} className="searchable-select-list" role="listbox">
            {filtered.length === 0 && <li className="searchable-select-empty">No matches</li>}
            {filtered.map((o, i) => (
              <li
                key={`${o.value}`}
                data-index={i}
                role="option"
                aria-selected={String(o.value) === String(value ?? "")}
                className={`searchable-select-option ${i === active ? "active" : ""} ${String(o.value) === String(value ?? "") ? "selected" : ""}`}
                onMouseEnter={() => setActive(i)}
                onMouseDown={(e) => { e.preventDefault(); pick(o); }}
              >
                {o.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;

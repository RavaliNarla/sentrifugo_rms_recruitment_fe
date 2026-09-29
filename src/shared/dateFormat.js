/**
 * Formats an ISO "YYYY-MM-DD" (or "YYYY-MM-DDTHH:mm:ss...") date string as
 * "DD-MM-YYYY" for display. Uses string parsing rather than the Date object
 * to avoid timezone-shift off-by-one bugs. Only for read-only display text —
 * native <input type="date"> fields must keep their value in ISO format and
 * are rendered by the browser using the OS/locale date format, not this.
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  const match = String(dateStr).slice(0, 10).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return dateStr;
  const [, year, month, day] = match;
  return `${day}-${month}-${year}`;
};

const IST = "Asia/Kolkata";

const pad2 = (n) => String(n).padStart(2, "0");

const formatAmPm = (hours24, minutes) => {
  const ampm = hours24 >= 12 ? "pm" : "am";
  const hours = hours24 % 12 || 12;
  return `${hours}.${pad2(minutes)}${ampm}`;
};

/**
 * Display any API datetime in IST.
 * - Instant / offset strings (…Z or ±hh:mm): convert to Asia/Kolkata
 * - Zoneless LocalDateTime (already IST wall clock from BE): format parts as-is
 */
export const formatIstDateTime = (iso) => {
  if (!iso) return "-";
  const str = String(iso).trim();
  try {
    if (/Z$/i.test(str) || /[+-]\d{2}:\d{2}$/.test(str)) {
      const d = new Date(str);
      if (Number.isNaN(d.getTime())) return str;
      const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: IST,
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).formatToParts(d);
      const get = (type) => parts.find((p) => p.type === type)?.value;
      const day = get("day");
      const month = get("month");
      const year = get("year");
      const hour = Number(get("hour"));
      const minute = Number(get("minute"));
      return `${day}-${month}-${year} ${formatAmPm(hour, minute)}`;
    }
    const m = str.match(
      /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?)?/
    );
    if (!m) return str;
    const [, y, mo, day, hh = "0", mi = "0"] = m;
    return `${day}-${mo}-${y} ${formatAmPm(Number(hh), Number(mi))}`;
  } catch {
    return str;
  }
};

/** Compact IST stamp for notification bell (e.g. "29 Sep, 05:31 pm"). */
export const formatIstNotifTime = (iso) => {
  if (!iso) return "";
  const str = String(iso).trim();
  try {
    let day;
    let monthShort;
    let hour;
    let minute;
    if (/Z$/i.test(str) || /[+-]\d{2}:\d{2}$/.test(str)) {
      const d = new Date(str);
      if (Number.isNaN(d.getTime())) return "";
      const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: IST,
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).formatToParts(d);
      const get = (type) => parts.find((p) => p.type === type)?.value;
      day = get("day");
      monthShort = get("month");
      hour = Number(get("hour"));
      minute = Number(get("minute"));
    } else {
      const m = str.match(
        /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?)?/
      );
      if (!m) return "";
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      day = m[3];
      monthShort = months[Number(m[2]) - 1];
      hour = Number(m[4] || 0);
      minute = Number(m[5] || 0);
    }
    const ampm = hour >= 12 ? "pm" : "am";
    const h12 = hour % 12 || 12;
    return `${day} ${monthShort}, ${pad2(h12)}:${pad2(minute)} ${ampm}`;
  } catch {
    return "";
  }
};

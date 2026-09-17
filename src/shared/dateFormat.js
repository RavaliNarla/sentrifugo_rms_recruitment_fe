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

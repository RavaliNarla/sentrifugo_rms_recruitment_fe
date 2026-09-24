/** Dispatches a browser event so Topbar can refresh the bell immediately. */
export const refreshNotifications = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("rms:notifications-refresh"));
  }
};

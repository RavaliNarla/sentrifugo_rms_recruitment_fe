/* ================= STATUS MAP ================= */

const STATUS_MAP = {
  PENDING: "Pending",
  VERIFIED: "Verified",
  REJECTED: "Rejected",
  PROVISIONALLY_APPROVED: "Provisionally Approved",
  ZONAL_ABSENT: "Zonal Absent",
  ZONAL_REJECTED: "Zonal Rejected",
};

/* ================= TIME FORMAT ================= */

const formatTime = (s, e) => {
  if (!s || !e) return "-";

  const start = new Date(s);
  const end = new Date(e);

  const startStr = start
    .toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    .replace(/ AM| PM/, "")
    .toUpperCase();

  const endStr = end
    .toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    .toUpperCase();

  return `${startStr} – ${endStr}`;
};

/* ================= REQUISITIONS DROPDOWN ================= */

export const mapUniqueRequisitionsToDropdown = (list = []) => {
  const map = new Map();

  list.forEach((row) => {
    const req = row.requisition;
    if (!req) return;

    if (!map.has(req.id)) {
      map.set(req.id, {
        value: req.id,
        label: `${req.requisitionCode} - ${req.requisitionTitle}`,
        raw: {
          requisition_id: req.id,
          requisition_title: req.requisitionTitle,
          registration_start_date: req.startDate,
          registration_end_date: req.endDate,
          requisition_code: req.requisitionCode,
        },
      });
    }
  });

  return Array.from(map.values());
};

/* ================= POSITIONS DROPDOWN ================= */

export const mapUniquePositionsToDropdown = (list = [], requisitionId) => {
  const map = new Map();

  list.forEach((row) => {
    const req = row.requisition;
    const pos = row.masterPosition;
    const app = row.application;

    if (!req || !pos || !app) return;
    if (req.id !== requisitionId) return;

    const appPosId = app.positionId;

    if (!map.has(appPosId)) {
      map.set(appPosId, {
        value: appPosId,
        label: pos.positionName,
        raw: {
          positionId: appPosId,
          positionName: pos.positionName,
        },
      });
    }
  });

  return Array.from(map.values());
};

/* ================= TABLE ROW MAPPING ================= */

export const mapCandidatesToTableRows = (list = []) => {
  return list.map((row) => {
    const sched = row.interviewSchedule || {};
    const cand = row.candidate || {};
    const app = row.application || {};
    const cat = row.category || {};
    const pos = row.masterPosition || {};
    const req = row.requisition || {};
    const zone = row.zonalOffice || {};

    const status =
      STATUS_MAP[sched.zonalVerificationStatus] ||
      sched.zonalVerificationStatus ||
      "-";

    return {
      /* ===== TABLE DISPLAY ===== */

      id: sched.interviewScheduleId,
      name: row.candidateFullName || cand.fullName || "-",
      regNo: app.applicationNo,
      category: cat.categoryCode || "-",
      time: formatTime(sched.interviewStartAt, sched.interviewEndAt),
      zone: zone.displayName || "-",

      /* ===== STATE TRACKING ===== */

      absent: app.isAbsent,
      originalAbsent: app.isAbsent,

      status,
      originalStatus: status,

      /* ===== RAW FLATTENED — USED BY UI ===== */

      raw: {
        interviewScheduleId: sched.interviewScheduleId,
        interviewStartAt: sched.interviewStartAt,
        interviewEndAt: sched.interviewEndAt,
        zonalVerificationStatus: sched.zonalVerificationStatus,
        zonalSubmitBeforeDate: sched.zonalSubmitBeforeDate,

        applicationId: sched.applicationId,
        candidateId: sched.candidateId,

        //  SAME ID SYSTEM AS DROPDOWN
        positionId: app.positionId,

        zonalHrComments: sched.zonalHrComments,
        lptRequired: sched.lptRequired,
        lptStatus: sched.lptStatus,

        requisitionId: req.id,
        requisitionTitle: req.requisitionTitle,
        requisitionCode: req.requisitionCode,
        requisitionStartDate: req.startDate,
        requisitionEndDate: req.endDate,

        positionTitle: pos.positionName,
        zonalOfficeName: zone.interviewCentre,
        categoryCode: cat.categoryCode,
        resumeUrl: row.resumeUrl,
      },
    };
  });
};

export const mapPanelPositions = (list = []) =>
  list.map((item) => ({
    requisition: item.requisition, // ✅ FULL OBJECT

    position: {
      positionId: item.position?.positionId,
      requisitionId: item.position?.requisitionId,
    },

    masterPosition: {
      positionName: item.masterPosition?.positionName,
      positionCode: item.masterPosition?.positionCode,
    },

    raw: item,
  }));

/* ================= INTERVIEWER CANDIDATES ================= */

export const mapInterviewerCandidates = (list = []) => {
  return list.map((item, idx) => {
    const start = item.interviewSchedule?.interviewStartAt;
    const end = item.interviewSchedule?.interviewEndAt;

    const formatTime = (t) =>
      t
        ? new Date(t)
            .toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })
            .toUpperCase()
        : null;

    const timeRange =
      start && end
        ? `${formatTime(start)} – ${formatTime(end)}`
        : start
          ? formatTime(start)
          : "-";
    return {
      id: item.application?.id || idx,

      name: item.candidateFullName || item.candidate?.fullName || "-",
      regNo: item.application?.applicationNo || "-",

      category:
        item.category?.categoryCode || item.category?.categoryName || "-",

      time: timeRange,

      zone:
        item.interviewCentre?.displayName ||
        item.interviewCentre?.zone ||
        item.interviewCentre?.interviewCentre ||
        "-",

      absent: item.application?.isAbsent ?? false,
      score: item.panelScore ?? "",
      comment: item.panelComments ?? "",

      isZonalAbsent:
        item.interviewSchedule?.zonalVerificationStatus?.toUpperCase() ===
        "ZONAL_ABSENT",

      raw: {
        applicationId: item.application?.id,
        candidateId: item.candidate?.candidateId,
        interviewScheduleId: item.interviewSchedule?.interviewScheduleId,

        panelId: item.interviewSchedule?.panelId, //  FIXED

        // interviewCenterId:
        //   item.interviewCentre?.interviewCentreId,

        interviewCenterId: item.interviewCentre?.interviewCentreId,
        positionId: item.application?.positionId,
        resumeUrl: item.resumeUrl,
        full: item,
      },
    };
  });
};

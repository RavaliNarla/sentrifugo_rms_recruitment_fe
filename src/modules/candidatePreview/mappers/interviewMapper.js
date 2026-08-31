export const mapInterviewCandidates = (
  apiData = [],
  centreMap = {},
  panelMap = {}
) => {
  return apiData.map((item) => {
    const schedule = item.interviewSchedules || {};

    return {
      candidateId: schedule.candidateId,
      applicationId: schedule.applicationId,
      positionId: item?.application?.positionId,
      id: schedule.interviewScheduleId,
      name: item.fullName || "-",
      regNo: item?.application?.applicationNo || "-",
      fileUrl: item?.resumeUrl || "-",

      date: schedule.interviewStartAt
        ? (() => {
            const d = new Date(schedule.interviewStartAt);
            const day = String(d.getDate()).padStart(2, "0");
            const month = String(d.getMonth() + 1).padStart(2, "0");
            const year = d.getFullYear();
            return `${day}-${month}-${year}`;
          })()
        : "-",

      time:
        schedule.interviewStartAt && schedule.interviewEndAt
          ? `${new Date(schedule.interviewStartAt)
              .toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })
              .toUpperCase()} - ${new Date(schedule.interviewEndAt)
              .toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })
              .toUpperCase()}`
          : "-",

      zone: centreMap[schedule.zonalOfficeId] || "Unknown Centre",

      panel: panelMap[schedule.panelId] || "Unknown Panel",

      status: schedule.interviewStatus || "SCHEDULED",

      score: schedule.finalScore ?? "",
      zonalHrComments: schedule.zonalHrComments || "",

      panelId: schedule.panelId,
      interviewStartAt: schedule.interviewStartAt,
      interviewEndAt: schedule.interviewEndAt,
      duration: schedule.interviewDurationMinutes,
      meetingLink: schedule.meetingLink,
      zonalOfficeId: schedule.zonalOfficeId,
      zonalVerificationStatus: schedule.zonalVerificationStatus,
      zonalSubmitBeforeDate: schedule.zonalSubmitBeforeDate,
    };
  });
};

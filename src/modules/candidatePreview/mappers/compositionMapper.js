export const mapCompensationCandidates = (apiData = []) => {
  return apiData.map((item) => {
    const comp = item.candidateCompensation || {};
    const profile = comp.candidateProfile || {};
    const app = comp.application || {};
    const agreedHike =
      comp.currentCtc && comp.agreedCtc
        ? (
            ((comp.agreedCtc - comp.currentCtc) / comp.currentCtc) *
            100
          ).toFixed(2)
        : 0;

    return {
      id: comp.candidateCompensationId,
      candidateId: comp.candidateId,

      //  UI fields
      name: [profile.firstName, profile.middleName, profile.lastName]
        .filter(Boolean) // removes null/empty
        .join(" "),
      regNo: app.applicationNo,
      fileUrl: item.resumeUrl,
      applicationId: app.id,
      currentCtc: comp.currentCtc,
      expectedCtc: comp.expectedCtc,
      agreedCtc: comp.agreedCtc,
      hike: comp.hike,

      status: comp.compensationStatus,
      fixedPay: comp.fixedPay,
      variablePay: comp.variablePay,
      joiningBonus: comp.joiningBonus,

      comments: comp.recruiterComments || comp.panelComments || "-",
      recruiterComments: comp.recruiterComments,
      panelComments: comp.panelComments,

      negotiation: comp.compensationStatus,

      //  IMPORTANT: ADD THESE FOR MODAL
      candidateProfile: profile,
      application: app,
      interviewScheduleId: comp.interviewScheduleId,
      submitBeforeDate: comp.submitBeforeDate,
       agreedHike,
    };
  });
};

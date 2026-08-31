export const mapCandidatePipeline = (data = {}) => {
  const pipeline = data?.candidatePipeline?.[0] || {};

  const candidateRegistration = data?.candidateRegistration?.[0] || {};

  const pipelineDetails =
    data?.pipelineDetails?.map((item) => ({
      requisitionId: item.requisition_code,
      department: item.department,
      position: item.position_name,
      vacancyCount: item.vacancy_count,

      applicationsReceived: item.applications_received,
      shortlistedCandidates: item.shortlisted_candidates,
      rejectedCandidates: item.rejected_candidates,
      pendingCandidates: item.pending_candidates,

      interviewsScheduled: item.interviews_scheduled,
      interviewsCompleted: item.interviews_completed,

      qualified: item.qualified_candidates,

      offersSent: item.offers_sent,
      offerAccepted: item.offer_accepted,
      offerRejected: item.offer_rejected,

      joined: item.joined,
    })) || [];
  const departmentColors = [
    "#D90429",
    "#1482BE",
    "#0D3B94",
    "#16A34A",
    "#F97316",
    "#8B5CF6",
    "#0891B2",
  ];

  const applicationsByDepartment =
    data?.applicationsByDepartment?.map((item, index) => ({
      department: item.department_name,
      value: item.num_applications,
      color: departmentColors[index % departmentColors.length],
    })) || [];

  const monthlyTrends =
    data?.monthlyTrends?.map((item) => ({
      month: new Date(item.month).toLocaleString("default", {
        month: "short",
      }),
      registrations: item.candidate_registrations || 0,
      interviews: item.interviews_completed || 0,
      requisitions: item.requisitions_created || 0,
      offers: item.offers_sent || 0,
      offerAccepted: item.offer_accepted || 0,
      candidatesJoined: item.candidates_joined || 0,
    })) || [];
  console.log(data?.pipelineDetails);
  return {
    totalVacancies: Number(pipeline.total_vacancies || 0).toLocaleString(
      "en-IN"
    ),
    applicationsReceived: Number(
      pipeline.applications_received || 0
    ).toLocaleString("en-IN"),
    shortlistedCandidates: Number(
      pipeline.shortlisted_candidates || 0
    ).toLocaleString("en-IN"),
    rejectedCandidates: Number(
      pipeline.rejected_candidates || 0
    ).toLocaleString("en-IN"),
    pendingCandidates: Number(pipeline.pending_candidates || 0).toLocaleString(
      "en-IN"
    ),
    interviewsScheduled: Number(
      pipeline.interviews_scheduled || 0
    ).toLocaleString("en-IN"),
    interviewsCompleted: Number(
      pipeline.interviews_completed || 0
    ).toLocaleString("en-IN"),
    qualified: Number(pipeline.qualified || 0).toLocaleString("en-IN"),
    offersSent: Number(pipeline.offers_sent || 0).toLocaleString("en-IN"),
    offerAccepted: Number(pipeline.offer_accepted || 0).toLocaleString("en-IN"),
    offerRejected: Number(pipeline.offer_rejected || 0).toLocaleString("en-IN"),
    joined: Number(pipeline.joined || 0).toLocaleString("en-IN"),

    candidateRegistration: {
      totalCandidates: Number(
        candidateRegistration.total_candidates || 0
      ).toLocaleString("en-IN"),
      registeredOnly: Number(
        candidateRegistration.registered_only || 0
      ).toLocaleString("en-IN"),
      profileCompleted: Number(
        candidateRegistration.profile_completed || 0
      ).toLocaleString("en-IN"),
      appliedCandidates: Number(
        candidateRegistration.applied_candidates || 0
      ).toLocaleString("en-IN"),
    },

    pipelineDetails,
    applicationsByDepartment,
    monthlyTrends,
  };
};

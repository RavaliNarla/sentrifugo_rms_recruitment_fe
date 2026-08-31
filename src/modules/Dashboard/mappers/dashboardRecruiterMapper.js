export const mapRecruiterPerformance = (data = {}) => {
  return (
    data?.recruiterPerformance?.map((item) => ({
      requisition: item.requisition_code || "-",
      position: item.position_name || "-",
      recruiter: item.recruiter_name || "-",

      vacancy: item.vacancy_count || 0,
      applied: item.applications_received || 0,
      shortlisted: item.shortlisted_candidates || 0,
      interview: item.interviewed_candidates || 0,
      qualified: item.qualified_candidates || 0,

      offerSent: item.offers_sent || 0,
      offerAccepted: item.offers_accepted || 0,
      joined: item.joined_candidates || 0,

      status: item.requisition_status || "-",

      // Not currently available in API
      extension: 0,
      cancelled: 0,
      rejected: 0,
      waitlist: 0,
    })) || []
  );
};
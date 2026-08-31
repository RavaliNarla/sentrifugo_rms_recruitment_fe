export const mapCommitteeOverview = (data) => {
  const committee = data?.committeeOverview?.[0] || {};

  const panels = data?.interviewPanels || [];

  return {
    interviewPanel: committee.total_interview_panels || 0,
    screeningPanel: committee.total_screening_panels || 0,
    compensationPanel: committee.total_compensation_panels || 0,

    interviewPanels: panels
      .filter((item) => item?.committee_name?.toLowerCase() === "interview")
      .map((item) => ({
        panelName: item.panel_name,
        positionsAssigned: item.positions_assigned,
        totalDaysUtilized: item.total_days,
      })),

    screeningPanels: panels
      .filter((item) => item?.committee_name?.toLowerCase() === "screening")
      .map((item) => ({
        panelName: item.panel_name,
        positionsAssigned: item.positions_assigned,
        totalDaysUtilized: item.total_days,
      })),

    compensationPanels: panels
      .filter((item) => item?.committee_name?.toLowerCase() === "compensation")
      .map((item) => ({
        panelName: item.panel_name,
        positionsAssigned: item.positions_assigned,
        totalDaysUtilized: item.total_days,
      })),
  };
};

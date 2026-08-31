export const mapDashboardDetails = (response) => {
  const data = response || {};
  const requisitionStatus = data.requisitionStatus?.[0] || {};

  return {
    //Executive Summary mapper
    executiveSummary: {
      totalPositions: data.executiveSummary?.total_positions || 0,

      totalVacancies: data.executiveSummary?.total_vacancies || 0,

      totalDepartments: data.executiveSummary?.total_departments || 0,

      totalRequisitions: data.executiveSummary?.total_requisitions || 0,

      filledVacancies: data.executiveSummary?.filled_vacancies || 0,

      unfilledVacancies: data.executiveSummary?.unfilled_vacancies || 0,
    },
    //Modal popup Exective Summarry mapper
    totalVacancies:
      response?.totalVacancies?.map((item) => ({
        requisition: item.requisition_code,
        department: item.department_name,
        position: item.position_name,
        vacancies: Number(item.vacancies || 0).toLocaleString("en-IN"),
      })) || [],
    totalPositions:
      response?.totalPositions?.map((item) => ({
        requisition: item.requisition_code,
        department: item.department_name,
        position: item.position_name,
        vacancies: Number(item.vacancies || 0).toLocaleString("en-IN"),
        status: item.status,
      })) || [],

    totalRequisitions:
      response?.totalRequisitions?.map((item) => ({
        requisition: item.requisition_code,
        department: item.department_name,
        numPositions: item.num_positions,
        totalVacancies: Number(item.total_vacancies || 0).toLocaleString(
          "en-IN"
        ),
      })) || [],
    totalDepartments:
      response?.totalDepartments?.map((item) => ({
        department: item.department_name,
        numPositions: item.num_positions,
      })) || [],
    //Requsition Summary Mapper
    requisitionStatus: {
      totalRequisitions: requisitionStatus.total_requisitions || 0,

      activeRequisitions: requisitionStatus.active_requisitions || 0,

      closedRequisitions: requisitionStatus.closed_requisitions || 0,

      pendingRequisitions: requisitionStatus.pending_requisitions || 0,

      approvedRequisitions: requisitionStatus.approved_requisitions || 0,
    },
    //Modal Requsition Summary Mapper
    approvedRequisitionDetails:
      response?.approvedRequisitionDetails?.map((item) => ({
        requisition: item.requisition_code,
        numPositions: item.num_positions,
        totalVacancies: Number(item.total_vacancies || 0).toLocaleString(
          "en-IN"
        ),
      })) || [],
    pendingRequisitionDetails:
      response?.pendingRequisitionDetails?.map((item) => ({
        requisition: item.requisition_code,
        numPositions: item.num_positions,
        totalVacancies: Number(item.total_vacancies || 0).toLocaleString(
          "en-IN"
        ),
      })) || [],
    activeRequisitionDetails:
      response?.activeRequisitionDetails?.map((item) => ({
        requisition: item.requisition_code,
        numPositions: item.num_positions,
        totalVacancies: Number(item.total_vacancies || 0).toLocaleString(
          "en-IN"
        ),
      })) || [],
    closedRequisitionDetails:
      response?.closedRequisitionDetails?.map((item) => ({
        requisition: item.requisition_code,
        numPositions: item.num_positions,
      })) || [],
  };
};

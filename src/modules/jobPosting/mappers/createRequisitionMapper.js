export const mapRequisitionToApi = (uiData) => ({
  requisitionTitle: uiData.title,
  requisitionDescription: uiData.description,
  startDate: uiData.startDate,
  endDate: uiData.endDate,
  cutoffDate: uiData.cutoffDate,
});

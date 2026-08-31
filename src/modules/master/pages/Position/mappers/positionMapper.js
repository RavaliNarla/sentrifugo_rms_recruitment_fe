import { cleanData } from "../../../../../shared/utils/common-validations";

/* ========================= API → UI (GET) ========================= */
export const mapPositionFromApi = (api) => ({
  id: api.masterPositionsId || api.positionId,

  title: api.positionName,
  description: api.positionDescription,
  departmentId: api.deptId,
  jobGradeId: api.gradeId,
  mandatoryExperience: api.mandatoryExperience || "",
  preferredExperience: api.preferredExperience || "",
  rolesResponsibilities: api.rolesResponsibilities || "",
  eligibilityAgeMin: api.eligibilityAgeMin || "",
  eligibilityAgeMax: api.eligibilityAgeMax || "",
  code: api.positionCode,
  isActive: api.isActive,
});

/* =========================  LIST ========================= */
export const mapPositionsFromApi = (apiData = []) => {
  if (!Array.isArray(apiData)) return [];
  return apiData.map(mapPositionFromApi);
};

/* ========================= UI → API (ADD / UPDATE) ========================= */
export const mapPositionToApi = (ui, isEditing = false) => ({
  isActive: true,

  ...(isEditing && { masterPositionsId: ui.id }),

  positionCode: ui.code || undefined,
  positionName: ui.title,
  positionDescription: ui.description || "",
  deptId: ui.departmentId,
  gradeId: ui.jobGradeId,
  mandatoryExperience: cleanData(ui.mandatoryExperience),
  preferredExperience: cleanData(ui.preferredExperience),
  rolesResponsibilities: cleanData(ui.rolesResponsibilities),
  eligibilityAgeMin: cleanData(ui.eligibilityAgeMin),
  eligibilityAgeMax: cleanData(ui.eligibilityAgeMax),
});

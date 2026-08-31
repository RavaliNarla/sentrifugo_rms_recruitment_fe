// src/modules/master/pages/JobGrade/mappers/jobGradeMapper.js
import { cleanData } from "../../../../../shared/utils/common-validations";
export const mapJobGradeFromApi = (api) => ({
  id: api.jobGradeId,
  scale: api.jobScale,
  gradeCode: api.jobGradeCode,
  minSalary: api.minSalary,
  maxSalary: api.maxSalary,
  description: api.jobGradeDesc,
  createdDate: api.createdDate,
});

export const mapJobGradesFromApi = (apiData = []) => {
  if (!Array.isArray(apiData)) return [];
  return apiData.map(mapJobGradeFromApi);
};

const parseNumber = (value) => {
  if (value === null || value === undefined) return 0;
  return Number(String(value).replace(/,/g, ""));
};

const todayDate = () => new Date().toISOString().split("T")[0];

export const mapJobGradeToApi = (ui, isEditing = false) => ({
  ...(isEditing && { jobGradeId: ui.id }),
  isActive: true,
  jobScale: cleanData(ui.scale),
  jobGradeCode: cleanData(ui.gradeCode),
  jobGradeDesc: cleanData(ui.description),
  minSalary: cleanData(parseNumber(ui.minSalary)),
  maxSalary: cleanData(parseNumber(ui.maxSalary)),
  effectiveStateDate: todayDate(),
  effectiveEndDate: todayDate(),
});

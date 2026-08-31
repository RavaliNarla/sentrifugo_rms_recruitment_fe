// src/shared/utils/position-validations.js

import { requiredField } from "./common-validations";
import i18n from "i18next";

const normalizeTitle = (s = "") => String(s).trim().toLowerCase();
const isEmpty = (v) => v === null || v === undefined || String(v).trim() === "";

/* ---------------- TITLE ---------------- */
export const validatePositionTitle = (title, options = {}) => {
  const { existing = [], currentId = null } = options;

  let error = requiredField(title);
  if (error) return error;

  if (existing.length > 0) {
    const titleNorm = normalizeTitle(title);
    const duplicate = existing.find((p) => {
      if (!p?.title) return false;
      if (currentId != null && p.id === currentId) return false;
      return normalizeTitle(p.title) === titleNorm;
    });

    if (duplicate) {
      return i18n.t("validation:duplicate");
    }
  }

  return null;
};

/* ---------------- DEPARTMENT ---------------- */
export const validateDepartmentId = (departmentId) => {
  if (isEmpty(departmentId)) {
    return i18n.t("validation:required", { field: "Department" });
  }
  return null;
};

/* ---------------- JOB GRADE ---------------- */
export const validateJobGradeId = (jobGradeId) => {
  if (isEmpty(jobGradeId)) {
    return i18n.t("validation:required", { field: "Job grade" });
  }
  return null;
};

/* ---------------- AGE HELPERS / VALIDATIONS ---------------- */
const toInt = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : NaN;
};

export const validateMinAge = (minAge) => {
  if (isEmpty(minAge)) {
    return i18n.t("validation:required", { field: "Min age" });
  }
  const n = toInt(minAge);
  if (Number.isNaN(n)) {
    return (
      i18n.t("validation:invalid_number", { field: "Min age" }) ||
      "Min age must be a valid number"
    );
  }
  if (n < 18) {
    return (
      i18n.t("validation:min_age_too_low", { min: 18 }) ||
      `Min age must be at least 18`
    );
  }
  if (n > 60) {
    return (
      i18n.t("validation:min_age_too_high", { max: 60 }) ||
      `Min age must be 60 or less`
    );
  }
  return null;
};

export const validateMaxAge = (maxAge, minAge) => {
  if (isEmpty(maxAge)) {
    return i18n.t("validation:required", { field: "Max age" });
  }
  const m = toInt(maxAge);
  if (Number.isNaN(m)) {
    return (
      i18n.t("validation:invalid_number", { field: "Max age" }) ||
      "Max age must be a valid number"
    );
  }
  if (m < 18) {
    return (
      i18n.t("validation:max_age_too_low", { min: 18 }) ||
      `Max age must be at least 18`
    );
  }
  if (m > 120) {
    return (
      i18n.t("validation:max_age_too_high", { max: 120 }) ||
      `Max age must be 120 or less`
    );
  }
  if (!isEmpty(minAge)) {
    const min = toInt(minAge);
    if (!Number.isNaN(min) && m < min) {
      return (
        i18n.t("validation:max_less_than_min") ||
        "Max age must be greater than or equal to Min age"
      );
    }
  }
  return null;
};

/* ---------------- MANDATORY EXPERIENCE ---------------- */
export const validateMandatoryExperience = (value) => {
  let error = requiredField(value);
  if (error) return error;
  return null;
};

/* ---------------- ROLES & RESPONSIBILITIES ---------------- */
export const validateRolesResponsibilities = (value) => {
  let error = requiredField(value);
  if (error) return error;
  return null;
};

/* ---------------- FORM ---------------- */
export const validatePositionForm = (formData = {}, options = {}) => {
  const errors = {};
  const { existing = [], currentId = null } = options;

  const titleError = validatePositionTitle(formData.title, {
    existing,
    currentId,
  });
  if (titleError) errors.title = titleError;

  const deptError = validateDepartmentId(formData.departmentId);
  if (deptError) errors.departmentId = deptError;

  const gradeError = validateJobGradeId(formData.jobGradeId);
  if (gradeError) errors.jobGradeId = gradeError;

  const minAgeError = validateMinAge(formData.eligibilityAgeMin);
  if (minAgeError) errors.eligibilityAgeMin = minAgeError;

  const maxAgeError = validateMaxAge(
    formData.eligibilityAgeMax,
    formData.eligibilityAgeMin
  );
  if (maxAgeError) errors.eligibilityAgeMax = maxAgeError;

  const mandExpError = validateMandatoryExperience(
    formData.mandatoryExperience
  );
  if (mandExpError) errors.mandatoryExperience = mandExpError;

  const rolesError = validateRolesResponsibilities(
    formData.rolesResponsibilities
  );
  if (rolesError) errors.rolesResponsibilities = rolesError;

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};
const positionValidations = {
  validatePositionTitle,
  validateDepartmentId,
  validateJobGradeId,
  validateMinAge,
  validateMaxAge,

  validateMandatoryExperience,
  validateRolesResponsibilities,
  validatePositionForm,
};

export default positionValidations;

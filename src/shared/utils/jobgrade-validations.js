// src/validators/jobgrade-validations.js
import { requiredField } from "./common-validations";
import i18n from "i18next";

const normalize = (s = "") => String(s).trim().toLowerCase();

const toNumberSafe = (v) => {
  if (v === "" || v === null || v === undefined) return NaN;
  const n = Number(String(v).replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : NaN;
};

export const validateScale = (scale) => {
  let error = requiredField(scale, "Scale");
  if (error) return error;
  return null;
};

/**
 * Grade Code
 */
export const validateGradeCode = (gradeCode) => {
  let error = requiredField(gradeCode, "Grade code");
  if (error) return error;
  return null;
};

export const validateMinSalary = (minSalary) => {
  let error = requiredField(minSalary, "Minimum salary");
  if (error) return error;

  const digitsOnly = String(minSalary).replace(/\D/g, "");

  if (digitsOnly.length > 10) {
    return i18n.t("jobGrade:digits_allowed");
  }

  const n = toNumberSafe(minSalary);
  if (Number.isNaN(n)) {
    return i18n.t("jobGrade:min_invalid_number");
  }

  if (n < 0) {
    return i18n.t("jobGrade:min_negative_not_allowed");
  }

  return null;
};

export const validateMaxSalary = (maxSalary) => {
  // ✅ OPTIONAL FIELD: allow empty
  if (maxSalary === "" || maxSalary === null || maxSalary === undefined) {
    return null;
  }

  const digitsOnly = String(maxSalary).replace(/\D/g, "");

  if (digitsOnly.length > 10) {
    return i18n.t("jobGrade:digits_allowed");
  }

  const n = toNumberSafe(maxSalary);
  if (Number.isNaN(n)) {
    return i18n.t("jobGrade:max_invalid_number");
  }

  if (n < 0) {
    return i18n.t("jobGrade:max_negative_not_allowed");
  }

  return null;
};

export const validateDescription = (description) => {
  let error = requiredField(description, "Description");
  if (error) return error;
  return null;
};

export const validateJobGradeForm = (formData = {}, options = {}) => {
  const errors = {};
  const { existing = [], currentId = null } = options;

  // ----- basic field validations -----
  const scaleErr = validateScale(formData.scale);
  if (scaleErr) errors.scale = scaleErr;

  const codeErr = validateGradeCode(formData.gradeCode);
  if (codeErr) errors.gradeCode = codeErr;

  const minErr = validateMinSalary(formData.minSalary);
  if (minErr) errors.minSalary = minErr;

  const maxErr = validateMaxSalary(formData.maxSalary);
  if (maxErr) errors.maxSalary = maxErr;

  const descErr = validateDescription(formData.description);
  if (descErr) errors.description = descErr;

  // ----- salary cross-field check -----
  const minNum = toNumberSafe(formData.minSalary);
  const maxNum = toNumberSafe(formData.maxSalary);

  //  Only validate if maxSalary is provided and > 0
  if (
    !Number.isNaN(minNum) &&
    !Number.isNaN(maxNum) &&
    maxNum > 0 &&
    minNum > maxNum
  ) {
    errors.minSalary = errors.minSalary || i18n.t("jobGrade:min_less_than_max");

    errors.maxSalary =
      errors.maxSalary || i18n.t("jobGrade:max_greater_than_min");
  }

  // ----- uniqueness checks (only if base validation passed) -----
  if (!errors.scale) {
    const scaleNorm = normalize(formData.scale);
    const duplicate = existing.find(
      (e) =>
        normalize(e.scale) === scaleNorm &&
        (currentId == null || e.id !== currentId)
    );
    if (duplicate) {
      errors.scale = i18n.t("jobGrade:scale_exists");
    }
  }
  if (!errors.gradeCode) {
    const codeNorm = normalize(formData.gradeCode);
    const duplicate = existing.find(
      (e) =>
        normalize(e.gradeCode) === codeNorm &&
        (currentId == null || e.id !== currentId)
    );
    if (duplicate) {
      errors.gradeCode = i18n.t("jobGrade:grade_code_exists");
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};
const jobgradeValidations = {
  validateScale,
  validateGradeCode,
  validateMinSalary,
  validateMaxSalary,
  validateDescription,
  validateJobGradeForm,
};
export default jobgradeValidations;

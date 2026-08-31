import { requiredField } from "./common-validations";
import i18n from "i18next";

const normalizeName = (s = "") => String(s).trim().toLowerCase();

export const validateDepartmentName = (name) => {
  let error = requiredField(name);
  if (error) return error;
  return null;
};

export const validateDepartmentDescription = (description) => {
  let error = requiredField(description);
  if (error) return error;
  return null;
};

export const validateDepartmentForm = (formData = {}, options = {}) => {
  const errors = {};
  const { existing = [], currentId = null } = options;

  const nameError = validateDepartmentName(formData.name);
  if (nameError) errors.name = nameError;

  const descError = validateDepartmentDescription(formData.description);
  if (descError) errors.description = descError;

  // uniqueness check
  if (!errors.name) {
    const nameNorm = normalizeName(formData.name);
    const duplicate = existing.find((d) => {
      if (!d?.name) return false;
      if (currentId != null && d.id === currentId) return false;
      return normalizeName(d.name) === nameNorm;
    });

    if (duplicate) {
      errors.name = i18n.t("validation:duplicate");
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

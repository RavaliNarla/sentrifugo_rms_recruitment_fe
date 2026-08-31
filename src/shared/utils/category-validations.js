import { requiredField } from "./common-validations";
import i18n from "i18next";

const normalize = (v = "") => String(v).trim().toLowerCase();

export const validateCategoryCode = (code) => {
  let error = requiredField(code);
  if (error) return error;
  return null;
};

export const validateCategoryName = (name) => {
  let error = requiredField(name);
  if (error) return error;
  return null;
};

export const validateCategoryDescription = (description) => {
  let error = requiredField(description);
  if (error) return error;
  return null;
};

/* =========================
   FORM VALIDATION
========================= */

export const validateCategoryForm = (formData = {}, options = {}) => {
  const errors = {};
  const { existing = [], currentId = null } = options;

  /* ---- CODE ---- */
  const codeError = validateCategoryCode(formData.code);
  if (codeError) errors.code = codeError;

  /* ---- NAME ---- */
  const nameError = validateCategoryName(formData.name);
  if (nameError) errors.name = nameError;

  /* ---- DESCRIPTION ---- */
  const descError = validateCategoryDescription(formData.description);
  if (descError) errors.description = descError;
  // Duplicate CODE
  if (!errors.code) {
    const codeNorm = normalize(formData.code);

    const duplicateCode = existing.find((c) => {
      if (!c?.code) return false;
      if (currentId != null && String(c.id) === String(currentId)) {
        return false;
      }

      return normalize(c.code) === codeNorm;
    });

    if (duplicateCode) {
      errors.code = i18n.t("validation:duplicate");
    }
  }

  // Duplicate NAME
  if (!errors.name) {
    const nameNorm = normalize(formData.name);

    const duplicateName = existing.find((c) => {
      if (!c?.name) return false;
      if (currentId != null && String(c.id) === String(currentId)) {
        return false;
      }

      return normalize(c.name) === nameNorm;
    });

    if (duplicateName) {
      errors.name = i18n.t("validation:duplicate");
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

/* =========================
   DEFAULT EXPORT
========================= */
const categoryValidations = {
  validateCategoryForm,
  validateCategoryCode,
  validateCategoryName,
  validateCategoryDescription,
};

export default categoryValidations;

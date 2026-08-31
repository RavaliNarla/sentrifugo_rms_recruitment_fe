import { requiredField } from "./common-validations";
import i18n from "i18next";

const normalize = (v = "") => String(v).trim().toLowerCase();

/* =========================
   FIELD VALIDATIONS
========================= */

export const validateCertificationName = (name) => {
  let error = requiredField(name);
  if (error) return error;
  return null;
};

export const validateCertificationDescription = (description) => {
  let error = requiredField(description);
  if (error) return error;
  return null;
};

export const validateCertificationForm = (formData = {}, options = {}) => {
  const errors = {};
  const { existing = [], currentId = null } = options;

  /* ---- NAME ---- */
  const nameError = validateCertificationName(formData.name);
  if (nameError) errors.name = nameError;

  /* ---- DESCRIPTION ---- */
  const descError = validateCertificationDescription(formData.description);
  if (descError) errors.description = descError;

  /* ---- DUPLICATE NAME ---- */
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
const certificationValidations = {
  validateCertificationForm,
  validateCertificationName,
  validateCertificationDescription,
};

export default certificationValidations;

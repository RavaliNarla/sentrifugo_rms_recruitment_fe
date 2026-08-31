import { requiredField } from "./common-validations";
import i18n from "i18next";
const normalizeName = (s = "") => String(s).trim().toLowerCase();

export const validateDocumentName = (name) => {
  let error = requiredField(name, i18n.t("validation:document_name_required"));
  if (error) return error;
  return null;
};
export const validateDocumentDescription = (description) => {
  let error = requiredField(
    description,
    i18n.t("validation:document_description_required")
  );
  if (error) return error;

  return null;
};
export const validateDocumentForm = (formData = {}, options = {}) => {
  const errors = {};
  const { existing = [], currentId = null } = options;

  // Name validation
  const nameError = validateDocumentName(formData.name);
  if (nameError) errors.name = nameError;

  // Description validation
  const descError = validateDocumentDescription(formData.description);
  if (descError) errors.description = descError;

  // Uniqueness check
  if (!errors.name && formData.name) {
    const nameNorm = normalizeName(formData.name);

    const duplicate = existing.find((doc) => {
      if (!doc?.name) return false;
      if (currentId != null && doc.id === currentId) return false;
      return normalizeName(doc.name) === nameNorm;
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
const documentValidations = {
  validateDocumentForm,
  validateDocumentName,
  validateDocumentDescription,
};
export default documentValidations;

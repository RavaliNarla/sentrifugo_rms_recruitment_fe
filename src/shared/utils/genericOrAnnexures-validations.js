import { requiredField } from "./common-validations";
import i18n from "i18next";

const normalize = (s = "") => String(s).trim().toLowerCase();

/* ================= TYPE ================= */
export const validateAnnexureType = (type) => {
  let error = requiredField(type);
  if (error) return error;
  return null;
};

/* ================= FILE ================= */
export const validateAnnexureFile = (file) => {
  if (!file) {
    return i18n.t("validation:required");
  }

  // Optional: ensure PDF only
  if (file.type !== "application/pdf") {
    return i18n.t("validation:invalid_file");
  }

  return null;
};

/* ================= FORM ================= */
export const validateGenericOrAnnexuresForm = (formData = {}, options = {}) => {
  const errors = {};
  const { existing = [], currentId = null } = options;

  const typeError = validateAnnexureType(formData.type);
  if (typeError) errors.type = typeError;

  const fileError = validateAnnexureFile(formData.file);
  if (fileError) errors.file = fileError;

  /* ===== DUPLICATE CHECK (TYPE + FILE NAME) ===== */
  if (!errors.type && !errors.file) {
    const typeNorm = normalize(formData.type);
    const fileNorm = normalize(formData.file?.name);

    const duplicate = existing.find((item) => {
      if (!item?.file?.name) return false;
      if (currentId != null && item.id === currentId) return false;

      return (
        normalize(item.type) === typeNorm &&
        normalize(item.file.name) === fileNorm
      );
    });

    if (duplicate) {
      errors.file = i18n.t("validation:duplicate");
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

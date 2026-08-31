import { requiredField } from "./common-validations";
import i18n from "i18next";
export const validateState = (value) => {
  return requiredField(value) || null;
};
export const validateLanguages = (list = []) => {
  if (!list || list.length === 0) {
    return i18n.t(
      "stateLanguages:languages_required",
      "Please select at least one language"
    );
  }
  const seen = new Set();
  for (let val of list) {
    if (seen.has(val)) {
      return i18n.t("stateLanguages:duplicate_language", "Duplicate language");
    }
    seen.add(val);
  }
  return null;
};
export const validateStateLanguageForm = (formData = {}, options = {}) => {
  const errors = {};
  const { existing = [], currentId = null } = options;
  const stateError = validateState(formData.state);
  if (stateError) errors.state = stateError;
  const langError = validateLanguages(formData.languages);
  if (langError) errors.languages = langError;
  if (!stateError) {
    const isDuplicate = existing.some((item) => {
      const sameState = String(item.stateId) === String(formData.state);
      const isCurrentRecord = String(item.stateId) === String(currentId);
      return sameState && !isCurrentRecord;
    });
    if (isDuplicate) {
      errors.state = i18n.t(
        "stateLanguages:duplicate_state",
        "State already exists"
      );
    }
  }
  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

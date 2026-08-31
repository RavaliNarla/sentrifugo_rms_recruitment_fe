/**
 * Common validation functions that can be reused across the application
 */

import i18n from "i18next";

const emailRegex = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/;

const isValidEmail = (email) => {
  if (typeof email !== "string") return false;

  const trimmed = email.trim();

  if (trimmed.length === 0 || trimmed.length > 254) return false;

  return emailRegex.test(trimmed);
};
export const requiredField = (value) => {
  if (value === null || value === undefined) {
    return i18n.t("validation:required");
  }

  // If string → trim
  if (typeof value === "string" && value.trim() === "") {
    return i18n.t("validation:required");
  }

  return null;
};
export const minLength = (value, min) => {
  if (value && value.length < min) {
    return i18n.t("validation:minLength", { min });
  }
  return null;
};

export const maxLength = (value, max) => {
  if (value && value.length > max) {
    return i18n.t("validation:maxLength", { max });
  }
  return null;
};

export const emailFormat = (email) => {
  if (typeof email !== "string" || email.length > 254) {
    return i18n.t("validation:invalidEmail");
  }

  if (email && !isValidEmail(email)) {
    return i18n.t("validation:invalidEmail");
  }

  return null;
};

export const phoneFormat = (phone) => {
  const phoneRegex = /^[0-9]{10}$/;
  if (phone && !phoneRegex.test(phone)) {
    return i18n.t("validation:invalidPhone");
  }
  return null;
};

export const cleanData = (value) => {
  if (value !== null && typeof value === "string") {
    return value.trim();
  }
  return value;
};

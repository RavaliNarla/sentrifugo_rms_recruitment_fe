// src/validators/interviewpanel-validations.js
import i18n from "i18next";

const isEmpty = (v) => v === null || v === undefined || String(v).trim() === "";

export function validatePanelName(
  name,
  { existing = [], currentId = null } = {}
) {
  const n = String(name || "").trim();
  if (isEmpty(n)) {
    return i18n.t("validation:required");
  }

  const dup = existing.find(
    (it) =>
      String(it.name || "")
        .trim()
        .toLowerCase() === n.toLowerCase() &&
      (currentId == null || it.id !== currentId)
  );

  if (dup) {
    return i18n.t("validation:duplicate");
  }

  return null;
}

export function validatePanelMembers(members) {
  let arr = [];

  if (Array.isArray(members)) {
    arr = members.map((m) => String(m).trim()).filter(Boolean);
  } else if (typeof members === "string") {
    arr = members
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean);
  }

  if (arr.length === 0) {
    return i18n.t("validation:required"); // ✅ COMMON
  }

  return null;
}
function validateCommunity(community) {
  if (!community) {
    return i18n.t("validation:required"); // ✅ COMMON
  }
  return null;
}

export function validateInterviewPanelForm(formData = {}, options = {}) {
  const errors = {};
  const existing = options.existing || [];
  const currentId = options.currentId ?? null;

  // --- normalize name ---
  const name = String(formData.name || "").trim();

  // --- normalize community ---
  const community = String(formData.community || "").trim();

  // --- normalize members to array ---
  let membersArray = [];
  if (Array.isArray(formData.members)) {
    membersArray = formData.members
      .map((m) => String(m).trim())
      .filter(Boolean);
  } else if (typeof formData.members === "string") {
    membersArray = formData.members
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean);
  }

  // --- name validation + uniqueness ---
  const nameErr = validatePanelName(name, { existing, currentId });
  if (nameErr) errors.name = nameErr;

  // --- community validation ---
  const communityErr = validateCommunity(community);
  if (communityErr) errors.community = communityErr;

  // --- members validation ---
  const memErr = validatePanelMembers(membersArray);
  if (memErr) errors.members = memErr;

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    normalized: {
      name,
      community,
      members: membersArray,
    },
  };
}
const interviewPanelValidations = {
  validatePanelName,
  validatePanelMembers,
  validateInterviewPanelForm,
};

export default interviewPanelValidations;

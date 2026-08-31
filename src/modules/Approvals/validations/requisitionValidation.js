// requisitionValidation.js

/**
 * Validate requisition selection for approval/rejection.
 * @param {Set} selectedReqIds - Set of selected requisition IDs
 * @returns {string[]} Array of error messages (empty if no errors)
 */
export const validateSelectedRequisitions = (selectedReqIds) => {
  const errors = [];

  if (!selectedReqIds || selectedReqIds.size === 0) {
    errors.push("Please select at least one requisition.");
  }

  return errors;
};

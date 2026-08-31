// src/validators/relaxationtype-validations.js

const isEmpty = (v) => v === null || v === undefined || String(v).trim() === "";

export function validateCode(code, { existing = [], currentId = null } = {}) {
  const c = String(code || "").trim();
  if (isEmpty(c)) return "Code/title is required";
  if (c.length < 2) return "Code/title must be at least 2 characters";
  if (c.length > 120) return "Code/title is too long";

  const dup = existing.find(
    (it) =>
      String(it.code || "")
        .trim()
        .toLowerCase() === c.toLowerCase() &&
      (currentId == null || it.id !== currentId)
  );
  if (dup) return "Code/title must be unique";
  return null;
}

export function validateInputType(inputType) {
  const v = String(inputType || "").trim();
  if (isEmpty(v)) return "Input type is required";
  if (!["Number", "Text", "Boolean"].includes(v)) return "Invalid input type";
  return null;
}

export function validateOperator(operator) {
  const v = String(operator || "").trim();
  if (isEmpty(v)) return "Operator is required";
  if (!["<=", ">=", "==", "!=", "<", ">"].includes(v))
    return "Invalid operator";
  return null;
}

export function validateDescription(desc) {
  if (isEmpty(desc)) return null;
  const d = String(desc);
  if (d.length > 500) return "Description must be at most 500 characters";
  return null;
}

export function validateRelaxationTypeForm(formData = {}, options = {}) {
  const errors = {};
  const existing = options.existing || [];
  const currentId = options.currentId ?? null;

  const codeErr = validateCode(formData.code, { existing, currentId });
  if (codeErr) errors.code = codeErr;

  const inputErr = validateInputType(formData.inputType);
  if (inputErr) errors.inputType = inputErr;

  const opErr = validateOperator(formData.operator);
  if (opErr) errors.operator = opErr;

  const descErr = validateDescription(formData.description);
  if (descErr) errors.description = descErr;

  return { valid: Object.keys(errors).length === 0, errors };
}
const relaxationTypeValidations = {
  validateRelaxationTypeForm,
  validateCode,
  validateInputType,
  validateOperator,
  validateDescription,
};

export default relaxationTypeValidations;

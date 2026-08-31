// validations/jobpostingcommonvalidators.js
export const validatePositiveInteger = ({
  value,
  fieldName,
  required = true,
  allowZero = false,
}) => {
  const trimmed = String(value ?? "").trim();

  if (required && trimmed === "") {
    return "validation:required";
  }

  if (trimmed === "") return null; // optional & empty is OK

  if (!/^\d+$/.test(trimmed)) {
    return {
      key: "validation:only_numbers",
      params: { field: fieldName },
    };
  }

  const num = Number(trimmed);

  if (!allowZero && num <= 0) {
    return {
      key: "validation:greater_than_zero",
      params: { field: fieldName },
    };
  }

  return null;
};

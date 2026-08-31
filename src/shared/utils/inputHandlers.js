const PATTERNS = {
  ALPHA_SPACE: /^[A-Za-z\s]*$/,
  ALPHA_NUMERIC_SPACE: /^[A-Za-z0-9\s]*$/,
  ALPHA_NUMERIC_SPACE_DASH_AMP: /^[A-Za-z0-9 _\-&/\\():]*$/,
  TEXTAREA_BASIC: /^[A-Za-z0-9\s.,\-/()&’':]*$/,
  NUMBERS_ONLY: /^[0-9]*$/,
  ALPHA_NUMERIC_SPACE_ambersent_Dash_underscore_at: /^[A-Za-z0-9 _\-&]*$/,
  NUMERIC_SPACE: /^[A-Za-z0-9\s]*$/,
  DESCRIPTION: /^[A-Za-z0-9\s.,\-_/()&:;'"@#]*$/,
};

export const handleValidatedInput = ({
  e,
  fieldName,
  setFormData,
  onValidChange,
  setErrors,
  pattern,
  errorMessage,
  preventLeadingSpace = true,
}) => {
  let value = e.target.value;

  //  validation
  if (pattern && !pattern.test(value)) {
    setErrors?.((prev) => ({
      ...prev,
      [fieldName]: errorMessage,
    }));
    return;
  }

  //  prevent leading spaces
  if (preventLeadingSpace) {
    value = value.replace(/^\s+/, "");
  }

  //  UPDATE VALUE (SAFE FOR BOTH CASES)
  if (typeof onValidChange === "function") {
    onValidChange(value);
  } else if (typeof setFormData === "function") {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  } else {
    console.warn(
      `[handleValidatedInput] No handler provided for "${fieldName}"`
    );
  }

  //  clear error
  setErrors?.((prev) => {
    const copy = { ...prev };
    delete copy[fieldName];
    return copy;
  });
};

export const INPUT_PATTERNS = PATTERNS;

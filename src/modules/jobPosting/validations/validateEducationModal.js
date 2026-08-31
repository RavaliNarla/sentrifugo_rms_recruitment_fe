export const validateEducationModal = ({ groups, mode }) => {
  const errors = { rows: [] };

  // ✅ Track duplicate OR groups
  const groupKeys = new Set();

  groups.forEach((group, gIdx) => {
    // ✅ Track duplicates only inside SAME GROUP
    const seenEducations = new Set();

    group.educations.forEach((row, rIdx) => {
      const rowErrors = {};

      const hasType = !!row.educationTypeId;
      const hasDegree = !!row.educationQualificationsId;
      const isPartiallyFilled = hasType || hasDegree;

      // ✅ Create education key
      const educationKey = [
        row.educationTypeId,
        row.educationQualificationsId,
        row.specializationId || "",
      ].join("_");

      // ✅ Duplicate inside SAME GROUP
      if (hasType && hasDegree) {
        if (seenEducations.has(educationKey)) {
          rowErrors.educationQualificationsId =
            "validation:duplicate_education";
        } else {
          seenEducations.add(educationKey);
        }
      }

      // ✅ Percentage Validation
      if (row.percentage !== "") {
        const per = parseFloat(row.percentage);

        if (isNaN(per) || per < 0 || per > 100) {
          rowErrors.percentage = "validation:percentage_range";
        }
      }

      // ✅ Duration Validation
      if (row.duration !== "") {
        const dur = parseInt(row.duration);

        if (isNaN(dur) || dur < 0) {
          rowErrors.duration = "validation:duration_invalid";
        }
      }

      // ✅ Mandatory Mode Validation
      if (mode === "mandatory") {
        if (!hasType) {
          rowErrors.educationTypeId = "validation:required";
        }

        if (!hasDegree) {
          rowErrors.educationQualificationsId = "validation:required";
        }
      }

      // ✅ Preferred Mode Validation
      if (mode === "preferred" && isPartiallyFilled) {
        if (!hasType) {
          rowErrors.educationTypeId = "validation:required";
        }

        if (!hasDegree) {
          rowErrors.educationQualificationsId = "validation:required";
        }
      }

      // ✅ Convert group index -> flat index
      const flatIndex =
        groups.slice(0, gIdx).reduce((acc, g) => acc + g.educations.length, 0) +
        rIdx;

      if (Object.keys(rowErrors).length > 0) {
        errors.rows[flatIndex] = rowErrors;
      }
    });

    // ✅ Duplicate ENTIRE GROUP Check
    const groupKey = [...seenEducations].sort().join("|");

    if (groupKey && groupKeys.has(groupKey)) {
      // ✅ Group-level error
      errors.groupErrors = errors.groupErrors || {};

      errors.groupErrors[gIdx] = "validation:duplicate_group";
    } else if (groupKey) {
      groupKeys.add(groupKey);
    }
  });

  // ✅ FINAL ERROR CHECK
  const hasRowErrors = errors.rows.some(
    (row) => row && Object.keys(row).length > 0
  );

  const hasGroupErrors =
    errors.groupErrors && Object.keys(errors.groupErrors).length > 0;

  if (!hasRowErrors && !hasGroupErrors) {
    return {};
  }

  return errors;
};

export const validateCertificationGroups = (certGroups) => {
  const errors = {};
  const groupKeys = new Set();

  certGroups.forEach((group, gIdx) => {
    const seenCertifications = new Set();

    (group.certifications || []).forEach((certRow) => {
      if (!certRow.certificationId) return;

      // ❌ DUPLICATE INSIDE SAME GROUP
      if (seenCertifications.has(certRow.certificationId)) {
        errors.certGroupErrors = errors.certGroupErrors || {};

        errors.certGroupErrors[gIdx] = "validation:duplicate_certification";
      } else {
        seenCertifications.add(certRow.certificationId);
      }
    });

    // ❌ DUPLICATE ENTIRE OR GROUP
    const groupKey = [...seenCertifications].sort().join("|");

    if (groupKey && groupKeys.has(groupKey)) {
      errors.certGroupErrors = errors.certGroupErrors || {};

      errors.certGroupErrors[gIdx] = "validation:duplicate_cert_group";
    } else if (groupKey) {
      groupKeys.add(groupKey);
    }
  });

  return errors;
};

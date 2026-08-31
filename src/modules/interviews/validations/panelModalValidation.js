export const validatePanelModal = ({ rows, panelId }) => {
  const errors = { rows: [], panelId: "" };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Panel validation
  if (!panelId) {
    errors.panelId = "validation:panel_required";
  }

  rows.forEach((row, i) => {
    const rowErrors = {};

    if (!row.date) {
      rowErrors.date = "validation:required";
    } else if (new Date(row.date) < today) {
      rowErrors.date = "validation:past_dates_not_allowed";
    }

    if (!row.duration) {
      rowErrors.duration = "validation:duration_required";
    }

    if (!row.startTime) {
      rowErrors.startTime = "validation:start_time_required";
    }

    if (!row.endTime) {
      rowErrors.endTime = "validation:end_time_required";
    }

    if (!row.perDay) {
      rowErrors.perDay = "validation:required";
    } else if (!/^\d+$/.test(row.perDay)) {
      rowErrors.perDay = "validation:only_numbers";
    } else if (Number(row.perDay) <= 0) {
      rowErrors.perDay = "validation:greater_than_zero";
    }

    if (Object.keys(rowErrors).length) {
      errors.rows[i] = rowErrors;
    }
  });

  return errors.rows?.length || errors.panelId ? errors : {};
};

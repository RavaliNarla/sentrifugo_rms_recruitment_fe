export const validateRequisitionSubmission = ({
  requisitions,
  selectedReqIds,
}) => {
  const errors = [];

  const selected = requisitions.filter((r) => selectedReqIds.has(r.id));

  if (selected.length === 0) {
    errors.push("validation:no_requisitions_selected");
    return errors;
  }

  const noPositionReqs = selected.filter(
    (r) => !r.isDraft && Number(r.positions) === 0
  );

  if (noPositionReqs.length > 0) {
    const labels = noPositionReqs
      .map((r) => r.code || r.requisitionId)
      .join(", ");

    errors.push({
      key: "validation:no_positions_for_requisition",
      params: { labels },
    });
  }

  return errors;
};

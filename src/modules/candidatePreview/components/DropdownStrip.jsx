import React, { useMemo } from "react";
import Select from "react-select";
import { useTranslation } from "react-i18next";

export default function DropdownStrip({
  requisitions,
  positions,
  selectedRequisitionId,
  selectedPositionId,
  loadingRequisitions,
  loadingPositions,
  onRequisitionChange,
  onPositionChange,
  onRequisitionSearch,
  // ✅ DISABLE HERE
  disableRequisition = false,
  disablePosition = false,
}) {
  const { t } = useTranslation(["candidateWorkflow", "common"]);
  const requisitionOptions = useMemo(
    () =>
      requisitions.map((req) => ({
        value: req.id,
        label: `${req.requisitionCode} - ${req.requisitionTitle}`,
      })),
    [requisitions]
  );

  const positionOptions = useMemo(
    () =>
      positions.map((pos) => ({
        value: pos.jobPositions.positionId,
        label: pos?.masterPositions?.positionName,
      })),
    [positions]
  );

  return (
    <>
      <div className="col-md-3 col-12">
        <label className="fs-14 blue-color">
          {t("candidateWorkflow:requisition")}
        </label>
        <Select
          className="mt-1 fs-14"
          classNamePrefix="react-select"
          options={requisitionOptions}
          isLoading={loadingRequisitions}
          placeholder={t("candidateWorkflow:select_requisition")}
          isDisabled={disableRequisition}
          value={requisitionOptions.find(
            (opt) => opt.value === selectedRequisitionId
          )}
          // ✅ FIX
          filterOption={(option, inputValue) =>
            option.label?.toLowerCase().includes(inputValue.toLowerCase())
          }
          onChange={(option) =>
            onRequisitionChange({
              target: { value: option ? option.value : "" },
            })
          }
        />
      </div>

      <div className="col-md-3 col-12">
        <label className="fs-14 blue-color">{t("common:position")}</label>
        <Select
          className="mt-1 fs-14"
          classNamePrefix="react-select"
          options={positionOptions}
          isLoading={loadingPositions}
          isDisabled={!selectedRequisitionId || disablePosition}
          placeholder={
            loadingPositions
              ? t("candidateWorkflow:loading_positions")
              : t("candidateWorkflow:select_position")
          }
          value={
            selectedPositionId
              ? positionOptions.find((opt) => opt.value === selectedPositionId)
              : null
          }
          onChange={(option) => onPositionChange(option ? option.value : "")}
        />
      </div>
    </>
  );
}

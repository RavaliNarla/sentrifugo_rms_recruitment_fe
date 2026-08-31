import React, { useMemo } from "react";
import Select from "react-select";
import { useTranslation } from "react-i18next";
import { components } from "react-select";
import "../../../style/css/CandidateScreening.css";
import { toast } from "react-toastify";
export default function DropdownStripMultipleposition({
  requisitions,
  positions,
  selectedRequisitionId,
  selectedPositionId,
  loadingRequisitions,
  loadingPositions,
  onRequisitionChange,
  onPositionChange,
  onRequisitionSearch,
  //  DISABLE HERE
  disableRequisition = false,
  disablePosition = false,
  isReadonly = false,
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

  const Option = (props) => {
    return (
      <components.Option {...props}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "8px",
          }}
        >
          <input
            type="checkbox"
            checked={props.isSelected}
            onChange={() => null}
            style={{
              marginTop: "4px",
              accentColor: "#FFFFFF",
              cursor: "pointer",
              flexShrink: 0,
            }}
          />

          <label
            style={{
              margin: 0,
              cursor: "pointer",
            }}
          >
            {props.label}
          </label>
        </div>
      </components.Option>
    );
  };

  const MultiValue = ({ index, getValue, ...props }) => {
    const selected = getValue();

    if (index === 0) {
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <components.MultiValue {...props} />

          {selected.length > 1 && (
            <span
              style={{
                fontSize: "13px",
                color: "#555",
                fontWeight: 500,
              }}
            >
              +{selected.length - 1}
            </span>
          )}
        </div>
      );
    }

    return null;
  };
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
          onInputChange={(inputValue, actionMeta) => {
            if (actionMeta.action === "input-change") {
              onRequisitionSearch(inputValue);
            }
          }}
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
          isMulti
          closeMenuOnSelect={true}
          hideSelectedOptions={false}
          components={{
            Option,
            MultiValue,
            ...(isReadonly && {
              MultiValueRemove: () => null,
            }),
          }}
          className="mt-1 fs-14"
          classNamePrefix="react-select"
          options={positionOptions}
          isLoading={loadingPositions}
          isDisabled={!selectedRequisitionId || disablePosition}
          styles={{
            control: (base) => ({
              ...base,
              minHeight: "38px",
              height: "38px",
              overflow: "hidden",
              display: "flex",
              flexWrap: "nowrap",
              alignItems: "center",
            }),

            valueContainer: (base) => ({
              ...base,
              display: "flex",
              flexWrap: "nowrap",
              alignItems: "center",
              overflow: "hidden",
              whiteSpace: "nowrap",
              maxWidth: "calc(100% - 55px)",
            }),
          }}
          placeholder={
            loadingPositions
              ? t("candidateWorkflow:loading_positions")
              : t("candidateWorkflow:select_position")
          }
          value={positionOptions.filter((opt) =>
            selectedPositionId?.includes(opt.value)
          )}
          onChange={(options) => {
            const selectedIds = options ? options.map((o) => o.value) : [];

            // GET SELECTED POSITION OBJECTS
            const selectedPositions = positions.filter((p) =>
              selectedIds.includes(p.jobPositions?.positionId)
            );

            // GET EMPLOYMENT TYPES
            const employmentTypes = selectedPositions.map(
              (p) => p.jobPositions?.employmentType
            );

            // UNIQUE TYPES
            const uniqueEmploymentTypes = [...new Set(employmentTypes)];

            // VALIDATION
            if (uniqueEmploymentTypes.length > 1) {
              toast.error("Please select positions with same employment type");

              return;
            }

            onPositionChange(selectedIds);
          }}
        />
      </div>
    </>
  );
}

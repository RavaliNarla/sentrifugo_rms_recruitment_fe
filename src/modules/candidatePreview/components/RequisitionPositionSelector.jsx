import React, { useMemo } from "react";
import Select, { components } from "react-select";
import { useTranslation } from "react-i18next";

import {
  mapUniqueRequisitionsToDropdown,
  mapUniquePositionsToDropdown,
} from "../../Verification/mappers/CandidateVerificationMapper";

/* ================= CONTROL TOOLTIP ================= */

const TooltipControl = (props) => {
  const selected = props.getValue()?.[0];

  return (
    <components.Control
      {...props}
      innerProps={{
        ...props.innerProps,
        title: selected?.label || "",
      }}
    />
  );
};

const TooltipOption = (props) => (
  <components.Option {...props}>
    <div title={props.data.label}>{props.children}</div>
  </components.Option>
);

/* ================= MAIN ================= */

const RequisitionPositionSelector = ({
  apiList = [],
  onRequisitionChange,
  onPositionChange,
  selectedRequisitionRaw,
  selectedPositionRaw,
  closeCalendar, // ✅ added
}) => {
  const { t } = useTranslation(["candidateWorkflow"]);

  /* ===== SELECT STYLES ===== */

  const selectStyles = {
    control: (b) => ({
      ...b,
      fontSize: "12px",
      minHeight: "34px",
    }),

    valueContainer: (b) => ({
      ...b,
      padding: "2px 8px",
    }),

    input: (b) => ({
      ...b,
      fontSize: "12px",
    }),

    singleValue: (b) => ({
      ...b,
      fontSize: "14px",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      maxWidth: "100%",
    }),

    option: (b) => ({
      ...b,
      fontSize: "14px",
      whiteSpace: "normal",
      lineHeight: "18px",
    }),

    placeholder: (b) => ({
      ...b,
      fontSize: "12px",
      color: "#6c757d",
    }),

    menu: (b) => ({
      ...b,
      fontSize: "12px",
    }),

    menuPortal: (base) => ({
      ...base,
      zIndex: 9999, // ✅ prevents overlap issue
    }),
  };

  /* ===== Build requisition options ===== */

  const requisitions = useMemo(
    () => mapUniqueRequisitionsToDropdown(apiList),
    [apiList]
  );

  /* ===== Selected requisition ===== */

  const selectedRequisitionOption = useMemo(() => {
    if (!selectedRequisitionRaw) return null;

    const found = requisitions.find(
      (r) => r.value === selectedRequisitionRaw.requisition_id
    );

    if (found) return found;

    return {
      value: selectedRequisitionRaw.requisition_id,
      label: selectedRequisitionRaw.requisition_title,
      raw: selectedRequisitionRaw,
    };
  }, [requisitions, selectedRequisitionRaw]);

  /* ===== Positions ===== */

  const positions = useMemo(() => {
    if (!selectedRequisitionOption) return [];

    return mapUniquePositionsToDropdown(
      apiList,
      selectedRequisitionOption.value
    );
  }, [apiList, selectedRequisitionOption]);

  /* ===== Selected position ===== */

  const selectedPositionOption = useMemo(() => {
    if (!selectedPositionRaw) return null;

    const found = positions.find(
      (p) => p.value === selectedPositionRaw.positionId
    );

    if (found) return found;

    return {
      value: selectedPositionRaw.positionId,
      label: selectedPositionRaw.positionName,
      raw: selectedPositionRaw,
    };
  }, [positions, selectedPositionRaw]);

  /* ================= UI ================= */

  return (
    <div className="row g-3">
      {/* ===== Requisition ===== */}

      <div className="col-md-4">
        <label className="fs-14 blue-color">
          {t("candidateWorkflow:requisition")}
        </label>

        <Select
          styles={selectStyles}
          components={{
            Control: TooltipControl,
            Option: TooltipOption,
          }}
          className="mt-1 fs-14"
          classNamePrefix="react-select"
          placeholder={t("candidateWorkflow:select_requisition")}
          options={requisitions}
          value={selectedRequisitionOption}
          menuPortalTarget={document.body} // ✅ fix overlay
          onMenuOpen={() => closeCalendar?.()} // ✅ close datepicker
          onChange={(opt) => {
            onRequisitionChange?.(opt?.raw || null);
            onPositionChange?.(null);
          }}
        />
      </div>

      {/* ===== Position ===== */}

      <div className="col-md-4">
        <label className="fs-14 blue-color">
          {t("candidateWorkflow:position")}
        </label>

        <Select
          styles={selectStyles}
          components={{
            Control: TooltipControl,
            Option: TooltipOption,
          }}
          className="mt-1 fs-14"
          classNamePrefix="react-select"
          placeholder={t("candidateWorkflow:select_position")}
          options={positions}
          value={selectedPositionOption}
          isDisabled={!selectedRequisitionOption}
          menuPortalTarget={document.body} // ✅ fix overlay
          onMenuOpen={() => closeCalendar?.()} // ✅ close datepicker
          onChange={(opt) => {
            onPositionChange?.(opt?.raw || null);
          }}
        />
      </div>
    </div>
  );
};

export default RequisitionPositionSelector;

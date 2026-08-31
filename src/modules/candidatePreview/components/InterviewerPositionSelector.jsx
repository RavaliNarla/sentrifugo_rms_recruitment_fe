import React, { useMemo } from "react";
import Select, { components } from "react-select";
import { useTranslation } from "react-i18next";

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

/* ================= OPTION TOOLTIP ================= */

const TooltipOption = (props) => (
  <components.Option {...props}>
    <div title={props.data.label}>{props.children}</div>
  </components.Option>
);

/* ================= MAIN ================= */

export default function InterviewerPositionSelector({
  apiData = [],
  selectedRequisition,
  selectedPosition,
  onRequisitionChange,
  onPositionChange,
  closeCalendar,
  showImportBtn,
  onImportClick,
}) {
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

    /* selected value — single line */
    singleValue: (b) => ({
      ...b,
      fontSize: "14px",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      maxWidth: "100%",
    }),

    /* dropdown options — allow wrap */
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
  };

  /* ================= REQUISITION OPTIONS ================= */

  const requisitionOptions = useMemo(() => {
    const map = new Map();

    apiData.forEach((r) => {
      const req = r?.requisition;
      if (!req?.id) return;

      if (!map.has(req.id)) {
        map.set(req.id, {
          value: req.id,
          label: `${req.requisitionCode} — ${req.requisitionTitle}`,
          raw: r,
        });
      }
    });

    return Array.from(map.values());
  }, [apiData]);

  /* ================= POSITION OPTIONS ================= */

  const positionOptions = useMemo(() => {
    if (!selectedRequisition) return [];

    return apiData
      .filter((r) => r.requisition.id === selectedRequisition.requisition.id)
      .map((r) => ({
        value: r.position.positionId,
        label: r.masterPosition.positionName,
        raw: r,
      }));
  }, [apiData, selectedRequisition]);
  const { t } = useTranslation(["candidateWorkflow", "common"]);

  /* ================= UI ================= */

  return (
    <div className="row g-3 align-items-end">
      {/* ===== Requisition ===== */}

      <div className="col-md-4">
        <label className="fs-14 blue-color">
          {" "}
          {t("candidateWorkflow:requisition")}
        </label>

        <Select
          options={requisitionOptions}
          styles={selectStyles}
          placeholder={t("candidateWorkflow:select_requisition")}
          components={{
            Control: TooltipControl,
            Option: TooltipOption,
          }}
          value={
            selectedRequisition && {
              value: selectedRequisition.requisition.id,
              label: `${selectedRequisition.requisition.requisitionCode} — ${selectedRequisition.requisition.requisitionTitle}`,
              raw: selectedRequisition,
            }
          }
          isClearable
          onChange={(opt) => {
            onRequisitionChange(opt?.raw || null);
            onPositionChange(null);
          }}
          onMenuOpen={() => closeCalendar?.()}
        />
      </div>

      {/* ===== Position ===== */}

      <div className="col-md-4">
        <label className="fs-14 blue-color">{t("common:position")}</label>

        <Select
          options={positionOptions}
          styles={selectStyles}
          placeholder={t("candidateWorkflow:select_position")}
          components={{
            Control: TooltipControl,
            Option: TooltipOption,
          }}
          value={
            selectedPosition && {
              value: selectedPosition.position.positionId,
              label: selectedPosition.masterPosition.positionName,
              raw: selectedPosition,
            }
          }
          isClearable
          isDisabled={!selectedRequisition}
          onChange={(opt) => onPositionChange(opt?.raw || null)}
          onMenuOpen={() => closeCalendar?.()}
        />
      </div>
    </div>
  );
}

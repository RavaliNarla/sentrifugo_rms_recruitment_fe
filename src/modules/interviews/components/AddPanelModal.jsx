import { Modal, Form } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { useAddPanelModal } from "../../interviews/hooks/useAddPanelModal";
import "../../../style/css/InterviewPanelsConfig.css";
import { formatDateDDMMYYYY } from "../../../shared/utils/dateUtils";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
const AddPanelModal = ({
  show,
  onClose,
  onSave,
  mode = "add",
  initialPanel = "",
  initialRows = [],
  panels = [], // ✅ NEW
  selectedPanels = [],
}) => {
  const { t } = useTranslation(["interviewSchedule", "common"]);

  const {
    panelId,
    setPanelId,
    rows,
    errors,
    addRow,
    removeRow,
    updateRow,
    handleSave,
    handleCancel,
    clearPanelError,
    showPanelInfo,
    setShowPanelInfo,

    panelInfoLoading,

    panelAvailability,

    loadPanelAvailability,
    panelRanges,
  } = useAddPanelModal({
    show,
    initialPanel,
    initialRows,
    onSave,
    onClose,
    panels,
  });

  const isDateAllowed = (date, ranges) => {
    if (!date) return false;

    return ranges.some((range) => {
      const selected = new Date(date);

      const start = new Date(range.startDate);

      const end = new Date(range.endDate);

      // remove time issue
      selected.setHours(0, 0, 0, 0);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);

      return selected >= start && selected <= end;
    });
  };

  return (
    <Modal
      show={show}
      onHide={handleCancel}
      size="xl"
      centered
      dialogClassName="ap-modal"
    >
      <Modal.Body className="ap-body">
        {/* HEADER */}
        <div className="ap-header">
          <div>
            <div className="ap-title">
              {mode === "edit" ? t("edit_title") : t("add_title")}
            </div>
            <div className="ap-sub">
              {mode === "edit" ? t("edit_sub") : t("add_sub")}
            </div>
          </div>

          <button className="ap-close" onClick={handleCancel}>
            <i className="bi bi-x-lg" />
          </button>
        </div>

        {/* SELECT PANEL */}
        <Form.Group className="mb-4">
          <Form.Label className="ap-label">
            {t("select_panel")} <span>*</span>
          </Form.Label>

          <div className="ap-select-wrap">
            <Form.Select
              className={`ap-input ap-modern-select ${
                errors?.panelId ? "ap-error" : ""
              }`}
              disabled={mode === "edit"}
              value={panelId || ""}
              onChange={(e) => {
                setPanelId(e.target.value);
                clearPanelError();
              }}
            >
              <option value="">{t("select_panel_placeholder")}</option>

              {panels.map((panel) => {
                const isSelected = selectedPanels?.some(
                  (p) => p.id === panel.id
                );

                return (
                  <option key={panel.id} value={panel.id}>
                    {panel.name}
                  </option>
                );
              })}
            </Form.Select>
            {panelId && (
              <button
                type="button"
                className="ap-info-btn"
                onClick={(e) => {
                  e.stopPropagation();

                  loadPanelAvailability();
                }}
              >
                <i className="bi bi-info-circle" />
              </button>
            )}

            {showPanelInfo && (
              <div className="ap-panel-popover">
                <div className="ap-panel-popover-header">
                  <h6 className="ap-panel-popover-title">
                    <i className="bi bi-calendar-check me-2 text-primary" />{" "}
                     {t("scheduled_interviews")}
                  </h6>
                  <button
                    type="button"
                    className="ap-panel-popover-close"
                    onClick={() => setShowPanelInfo(false)}
                  >
                    <i className="bi bi-x" />
                  </button>
                </div>

                <div className="ap-panel-popover-body">
                  {panelInfoLoading ? (
                    <div className="ap-loading-spinner py-4">
                      <div
                        className="spinner-border text-primary spinner-border-sm"
                        role="status"
                      ></div>
                      <span className="ms-2 text-muted">
                        {t("loading_availability")}
                      </span>
                    </div>
                  ) : panelAvailability.length > 0 ? (
                    panelAvailability.map((day, index) => (
                      <div key={index} className="ap-day-section">
                        {/* Elegant Header for Date */}
                        <div className="ap-day-badge-header">
                          <span className="ap-date-text">
                            <i className="bi bi-calendar-event me-1" />
                            {formatDateDDMMYYYY(day.panelDate)}
                          </span>
                          <span className="ap-count-badge">
                              {day.panelAvailableModels?.length || 0} {t("allocated")}
                          </span>
                        </div>

                        {/* List of Time Slots */}
                        <div className="ap-slots-list">
                          {day.panelAvailableModels.map((slot, idx) => (
                            <div key={idx} className="ap-slot-row-item">
                              <div className="ap-slot-left">
                                <span className="ap-time-pill">
                                  <i className="bi bi-clock me-1" />
                                  {slot.startTime.slice(0, 5)} -{" "}
                                  {slot.endTime.slice(0, 5)}
                                </span>
                              </div>
                              <div className="ap-slot-right">
                                <div
                                  className="ap-slot-position-title"
                                  title={slot.positionName}
                                >
                                  {slot.positionName}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted py-4">
                      <i className="bi bi-calendar-x d-block fs-4 mb-2 text-neutral" />
                      {t("no_scheduled_interviews")}
                    </div>
                  )}
                </div>
              </div>
            )}
            <i className="bi bi-chevron-down ap-select-icon" />
          </div>
          <div className="field-error">
            {errors?.panelId ? t(errors.panelId) : ""}
          </div>

          {/* DATE RANGE TEXT BELOW DROPDOWN */}
          {panelRanges.length > 0 && (
            <div className="ap-date-range-text">
               {t("allowed_ranges")}:
              {panelRanges.map((range, index) => (
                <div key={index} className="ap-range-item">
                  <div className="ap-range-position">{range.positionName}</div>

                  <div className="ap-range-dates">
                   {formatDateDDMMYYYY(range.startDate)} {t("to")} {formatDateDDMMYYYY(range.endDate)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Form.Group>

        {/* ROWS */}
        {rows.map((row, i) => (
          <div key={i} className="ap-panel-row">
            {/* FIRST ROW: Date, Start Time, End Time */}
            <div className="ap-row-group">
              {/* DATE */}
              <div className="ap-field">
                <Form.Label className="ap-label">
                  {t("panel_date")} <span>*</span>
                </Form.Label>

                <div className="ap-icon-input">
                  <DatePicker
                    selected={row.date ? new Date(row.date) : null}
                    onChange={(date) => {
                      if (!date) return;

                      const year = date.getFullYear();

                      const month = String(date.getMonth() + 1).padStart(
                        2,
                        "0"
                      );

                      const day = String(date.getDate()).padStart(2, "0");

                      const formatted = `${year}-${month}-${day}`;

                      updateRow(i, "date", formatted);
                    }}
                    filterDate={(date) => isDateAllowed(date, panelRanges)}
                    dateFormat="dd/MM/yyyy"
                   placeholderText={t("select_date")}
                    className={`ap-input ap-no-date ${
                      errors?.rows?.[i]?.date ? "ap-error" : ""
                    }`}
                  />

                  <i className="bi bi-calendar3 ap-calendar" />
                </div>

                <div className="field-error">
                  {errors?.rows?.[i]?.date ? t(errors.rows[i].date) : ""}
                </div>
              </div>

              {/* START TIME */}
              <div className="ap-field">
                <Form.Label className="ap-label">
                   {t("start_time")} <span>*</span>
                </Form.Label>

                <input
                  type="time"
                  className={`ap-input ${
                    errors?.rows?.[i]?.startTime ? "ap-error" : ""
                  }`}
                  value={row.startTime}
                  onChange={(e) => updateRow(i, "startTime", e.target.value)}
                />

                <div className="field-error">
                  {errors?.rows?.[i]?.startTime
                    ? t(errors.rows[i].startTime)
                    : ""}
                </div>
              </div>

              {/* END TIME */}
              <div className="ap-field">
                <Form.Label className="ap-label">
                  {t("end_time")} <span>*</span>
                </Form.Label>

                <input
                  type="time"
                  className={`ap-input ${
                    errors?.rows?.[i]?.endTime ? "ap-error" : ""
                  }`}
                  value={row.endTime}
                  onChange={(e) => updateRow(i, "endTime", e.target.value)}
                />

                <div className="field-error">
                  {errors?.rows?.[i]?.endTime ? t(errors.rows[i].endTime) : ""}
                </div>
              </div>
            </div>

            {/* SECOND ROW: Duration, Interviews per Day, Actions */}
            <div className="ap-row-group">
              {/* DURATION */}
              <div className="ap-select-wrap">
                <Form.Label className="ap-label">
                   {t("duration")} <span>*</span>
                </Form.Label>

                <Form.Select
                  className={`ap-input ap-modern-select ap-no-arrow ${
                    errors?.rows?.[i]?.duration ? "ap-error" : ""
                  }`}
                  value={row.duration}
                  onChange={(e) => updateRow(i, "duration", e.target.value)}
                >
                  <option value="10">10 {t("minutes")}</option>
<option value="15">15 {t("minutes")}</option>
<option value="30">30 {t("minutes")}</option>
<option value="45">45 {t("minutes")}</option>
<option value="60">60 {t("minutes")}</option>
                </Form.Select>

                <i className="bi bi-chevron-down ap-select-icon" />

                <div className="field-error">
                  {errors?.rows?.[i]?.duration
                    ? t(errors.rows[i].duration)
                    : ""}
                </div>
              </div>

              {/* INTERVIEWS PER DAY */}
              <div className="ap-field">
                <Form.Label className="ap-label">
                  {t("interviews_per_day")} <span>*</span>
                </Form.Label>

                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={3}
                  placeholder={t("enter_interviews_per_day")}
                  className={`ap-inputs ${
                    errors?.rows?.[i]?.perDay ? "ap-error" : ""
                  }`}
                  value={row.perDay}
                  onChange={(e) => {
                    const onlyNums = e.target.value.replace(/\D/g, "");
                    updateRow(i, "perDay", onlyNums);
                  }}
                  readOnly
                />

                <div className="field-error">
                  {errors?.rows?.[i]?.perDay ? t(errors.rows[i].perDay) : ""}
                </div>
              </div>

              {/* ACTIONS */}
              <div className="ap-field ap-actions">
                <Form.Label className="ap-label">&nbsp;</Form.Label>
                {i === 0 ? (
                  <button type="button" className="ap-plus" onClick={addRow}>
                    <i className="bi bi-plus-lg" />
                  </button>
                ) : (
                  <button
                    type="button"
                    className="ap-trash"
                    onClick={() => removeRow(i)}
                  >
                    <i className="bi bi-trash" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* FOOTER */}
        <div className="ap-footer">
          <button className="ap-cancel" onClick={handleCancel}>
            {t("common:cancel")}
          </button>
          <button className="ap-save" onClick={handleSave}>
            {t("common:save")}
          </button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default AddPanelModal;

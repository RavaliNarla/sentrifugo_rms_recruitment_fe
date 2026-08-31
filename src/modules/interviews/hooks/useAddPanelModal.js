import { useState, useEffect } from "react";
import { validatePanelModal } from "../../interviews/validations/panelModalValidation";
import interviewService from "../services/interviewService";

export const useAddPanelModal = ({
  show,
  initialPanel,
  initialRows,
  onSave,
  onClose,
  panels,
  onPanelsUpdated,
}) => {
  const buildRows = () =>
    initialRows && initialRows.length
      ? initialRows.map((r) => ({ ...r })) // clone edit rows
      : [
          {
            date: "",
            perDay: "",
            duration: "15",
            startTime: "",
            endTime: "",
          },
        ];

  // const [panelName, setPanelName] = useState("");
  const [panelId, setPanelId] = useState("");
  const [rows, setRows] = useState([
    {
      date: "",
      perDay: "",
      duration: "15",
      startTime: "",
      endTime: "",
    },
  ]);
  const [errors, setErrors] = useState({});

  const [showPanelInfo, setShowPanelInfo] = useState(false);

  const [panelInfoLoading, setPanelInfoLoading] = useState(false);

  const [panelAvailability, setPanelAvailability] = useState([]);

  /* ✅ Reset ONLY when modal opens */
  useEffect(() => {
    if (!show) return;

    setShowPanelInfo(false);

    setPanelAvailability([]);

    setPanelId(initialPanel || "");

    const builtRows = buildRows();

    setRows(builtRows);

    // ✅ duplicate validation for edit mode
    const duplicateDates = {};

    builtRows.forEach((row, index) => {
      const isDuplicate = builtRows.some(
        (r, i) => i !== index && r.date && r.date === row.date
      );

      if (isDuplicate) {
        if (!duplicateDates.rows) {
          duplicateDates.rows = [];
        }

        duplicateDates.rows[index] = {
          date: "Date already selected",
        };
      }
    });

    setErrors(duplicateDates);
  }, [initialPanel, show]); // 🔥 ONLY show// 🔥 ONLY show — do NOT add initialRows

  const selectedPanel = panels.find((p) => String(p.id) === String(panelId));

  const panelRanges = selectedPanel?.ranges || [];

  const isDateWithinRanges = (date) => {
    if (!date) return false;

    return panelRanges.some((range) => {
      const selected = new Date(date);

      const min = new Date(range.startDate);

      const max = new Date(range.endDate);

      return selected >= min && selected <= max;
    });
  };
  /* ================= ADD ================= */

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      {
        date: "",
        perDay: "",
        duration: "15",
        startTime: "",
        endTime: "",
      },
    ]);
  };

  const removeRow = (i) => {
    setRows((prev) => prev.filter((_, idx) => idx !== i));
  };
  const updateRow = (i, field, value) => {
    // ================= UPDATE ROW =================

    setRows((prev) => {
      const copy = [...prev];

      copy[i] = {
        ...copy[i],
        [field]: value,
      };

      if (field === "date") {
        const duplicateDate = copy.some(
          (r, idx) => idx !== i && r.date && r.date === value
        );

        if (duplicateDate) {
          setErrors((prevErrors) => {
            const updated = { ...prevErrors };

            if (!updated.rows) {
              updated.rows = [];
            }

            if (!updated.rows[i]) {
              updated.rows[i] = {};
            }

            updated.rows[i].date = "Date already selected";

            return updated;
          });
        } else {
          setErrors((prevErrors) => {
            const updated = { ...prevErrors };

            if (updated.rows?.[i]?.date) {
              delete updated.rows[i].date;

              if (Object.keys(updated.rows[i]).length === 0) {
                delete updated.rows[i];
              }
            }

            return updated;
          });
        }
      }

      if (field === "date") {
        const validDate = isDateWithinRanges(value);

        if (!validDate) {
          setErrors((prevErrors) => {
            const updated = { ...prevErrors };

            if (!updated.rows) {
              updated.rows = [];
            }

            if (!updated.rows[i]) {
              updated.rows[i] = {};
            }

            updated.rows[i].date = "Date must be within panel range";

            return updated;
          });
        }
      }

      const row = copy[i];

      // ================= LIVE TIME VALIDATION =================

      if (row.startTime && row.endTime && row.duration) {
        const start = new Date(`2000-01-01T${row.startTime}`);
        const end = new Date(`2000-01-01T${row.endTime}`);

        const diffMins = (end - start) / (1000 * 60);

        // ❌ invalid time range
        if (diffMins <= 0) {
          row.perDay = "";

          setErrors((prevErrors) => {
            const updated = { ...prevErrors };

            if (!updated.rows) {
              updated.rows = [];
            }

            if (!updated.rows[i]) {
              updated.rows[i] = {};
            }

            updated.rows[i].endTime = "validation:end_time_greater_than_start";

            return updated;
          });
        } else {
          if (
            row.startTime &&
            row.endTime &&
            row.duration &&
            field !== "perDay"
          ) {
            const start = new Date(`2000-01-01T${row.startTime}`);

            const end = new Date(`2000-01-01T${row.endTime}`);

            const diffMins = (end - start) / (1000 * 60);

            // invalid range
            if (diffMins <= 0) {
              row.perDay = "";

              setErrors((prevErrors) => {
                const updated = { ...prevErrors };

                if (!updated.rows) {
                  updated.rows = [];
                }

                if (!updated.rows[i]) {
                  updated.rows[i] = {};
                }

                updated.rows[i].endTime =
                  "validation:end_time_greater_than_start";

                return updated;
              });
            } else {
              // ✅ auto calculate ONLY
              // when recruiter is not typing perDay
              const interviews = Math.floor(diffMins / Number(row.duration));

              row.perDay = interviews.toString();

              // clear validation
              setErrors((prevErrors) => {
                const updated = { ...prevErrors };

                if (updated.rows?.[i]?.endTime) {
                  delete updated.rows[i].endTime;

                  if (Object.keys(updated.rows[i]).length === 0) {
                    delete updated.rows[i];
                  }
                }

                return updated;
              });
            }
          }

          // clear end time validation
          setErrors((prevErrors) => {
            const updated = { ...prevErrors };

            if (updated.rows?.[i]?.endTime) {
              delete updated.rows[i].endTime;

              // remove empty object
              if (Object.keys(updated.rows[i]).length === 0) {
                delete updated.rows[i];
              }
            }

            return updated;
          });
        }
      }

      return copy;
    });

    setErrors((prevErrors) => {
      const updated = { ...prevErrors };

      if (updated.rows?.[i]) {
        // clear current field error
        if (field !== "date" || isDateWithinRanges(value)) {
          delete updated.rows[i][field];
        }

        // clear dependent validations
        if (
          field === "startTime" ||
          field === "endTime" ||
          field === "duration"
        ) {
          delete updated.rows[i].perDay;
        }

        // remove empty row object
        if (Object.keys(updated.rows[i]).length === 0) {
          delete updated.rows[i];
        }
      }

      // clear panel error when user selects panel
      if (field === "panelId") {
        delete updated.panelId;
      }

      return updated;
    });
  };

  const clearPanelError = () => {
    setErrors((prev) => {
      const updated = { ...prev };

      delete updated.panelId;

      return updated;
    });
  };

  /* ================= SAVE ================= */

  const handleSave = () => {
    const v = validatePanelModal({
      rows,
      panelId,
    });
    setErrors(v);

    if (v.panelId || (v.rows && Object.keys(v.rows).length > 0)) {
      return;
    }

    // ✅ FIND SELECTED PANEL
    const selectedPanel = panels.find((p) => p.id === panelId);

    const invalidDateExists = rows.some(
      (row) => row.date && !isDateWithinRanges(row.date)
    );
    if (invalidDateExists) {
      const updatedRows = rows.map((row) => {
        if (row.date && !isDateWithinRanges(row.date)) {
          return {
            date: "Date must be within panel range",
          };
        }

        return {};
      });

      setErrors((prev) => ({
        ...prev,
        rows: updatedRows,
      }));

      return;
    }

    onSave({
      panelId,
      panelName: selectedPanel?.name, // ✅ FIX HERE
      slots: rows,
    });

    onClose();
  };

  const handleCancel = () => {
    onClose();
  };
  const sortedRanges = [...panelRanges].sort(
    (a, b) => new Date(a.startDate) - new Date(b.startDate)
  );

  const minDate = sortedRanges[0]?.startDate || "";

  const maxDate = sortedRanges[sortedRanges.length - 1]?.endDate || "";
  const loadPanelAvailability = async () => {
    if (!panelId || !minDate || !maxDate) return;

    try {
      setShowPanelInfo(true);

      setPanelInfoLoading(true);

      const res = await interviewService.getScheduledSlots({
        panelId,

        panelStartDate: minDate,

        panelEndDate: maxDate,
      });

      // ✅ IMPORTANT FIX
      setPanelAvailability(res?.data || []);
    } catch (error) {
      console.error("Panel availability error", error);

      setPanelAvailability([]);
    } finally {
      setPanelInfoLoading(false);
    }
  };

  return {
    panelId,
    setPanelId,
    rows,
    errors,
    addRow,
    removeRow,
    updateRow,
    handleSave,
    handleCancel,
    // minDate,   // ✅ ADD
    // maxDate,    // ✅ ADD
    clearPanelError,

    showPanelInfo,
    setShowPanelInfo,

    panelInfoLoading,

    panelAvailability,

    loadPanelAvailability,
    panelRanges,
  };
};

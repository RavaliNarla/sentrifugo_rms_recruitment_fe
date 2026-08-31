import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import "../../../style/css/InterviewPanelsConfig.css";
import { formatDateDDMMYYYY } from "../../../shared/utils/dateUtils";

const InterviewScheduleTable = ({ rows, position }) => {
  const { t } = useTranslation("interviewSchedule");
  const [page, setPage] = useState(0);

  const [pageSize, setPageSize] = useState(10);

  const totalElements = rows.length;

  const paginatedRows = rows.slice(page * pageSize, (page + 1) * pageSize);

  return (
    <div className="schedule-card">
      <div className="schedule-title">{t("schedule_title")}</div>

      <table className="schedule-table">
        <thead>
          <tr>
            <th style={{ width: "32%" }}>{t("candidate")}</th>
            {/* <th>Position</th> */}
            <th style={{ width: "16%" }}>{t("date")}</th>
            <th style={{ width: "16%" }}>{t("time")}</th>
            <th style={{ width: "16%" }}>{t("zone")}</th>
            <th style={{ width: "20%" }}>{t("panel_details")}</th>
          </tr>
        </thead>

        <tbody>
          {paginatedRows.map((row) => (
            <tr key={row.id}>
              <td>
                <div className="cand-name">{row.name}</div>

                <p className="text-muted fs-12 mb-0">
                  Application Number: {row.regNo}
                </p>
                <p className="text-muted fs-12 mb-0">
                  Position:{" "}
                  {position?.find(
                    (p) => p.jobPositions?.positionId === row.positionId
                  )?.masterPositions?.positionName || "-"}
                </p>
              </td>
              
              <td>{formatDateDDMMYYYY(row.date)}</td>
              <td>{row.time}</td>
              <td>{row.zone}</td>
              <td>{row.panel}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* FOOTER */}

      <div className="d-flex justify-content-between align-items-center px-3 py-3 border-top">
        <div className="fs-14 text-muted">
          Showing {rows.length === 0 ? 0 : page * pageSize + 1}–
          {Math.min((page + 1) * pageSize, totalElements)} of {totalElements}
        </div>

        <div className="d-flex align-items-center gap-2">
          <select
            className="form-select fs-14"
            style={{ width: "90px" }}
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));

              setPage(0);
            }}
          >
            {[10, 20, 50].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <button
            className="btn btn-sm btn-outline-secondary"
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
          >
            Prev
          </button>

          <button
            className="btn btn-sm btn-outline-secondary"
            disabled={(page + 1) * pageSize >= totalElements}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default InterviewScheduleTable;

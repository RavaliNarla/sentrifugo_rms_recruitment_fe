import React from "react";
import { useTranslation } from "react-i18next";
import { FaEye, FaPen } from "react-icons/fa";

export default function ExaminationCutoffTable({
  rows = [],
  onView,
  onEdit,
  page,
  setPage,

  pageSize,
  setPageSize,

  totalPages,
  totalElements,
  statusFilter,
  setStatusFilter,
}) {
  const tableRows = rows || [];
  const { t } = useTranslation("examconfiguration");

  return (
    <div className="cutoff-table-wrapper bg-white rounded-4">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="table-main-heading m-0">
          {t("position_wise_cutoff_configuration")}
        </h5>


      </div>

      {/* TABLE */}

      <div className="table-responsive">
        <table className="table align-middle cutoff-custom-table">
          <thead>
            <tr>
              <th>{t("position")}</th>
              <th>{t("total_marks")}</th>
              <th>{t("number_of_sections")}</th>
              <th className="weightage-column">{t("weightage")}</th>
              <th>{t("status")}</th>
              <th>{t("actions")}</th>
            </tr>
          </thead>

          <tbody>
            {tableRows.length > 0 ? (
              tableRows.map((item, index) => (
                <tr key={index}>
                  <td>{item.positionName || item.positionId}</td>

                  <td>{item.totalMarks}</td>

                  <td>{item.sections?.length || 0}</td>

                  <td>
                    <span className="fw-semibold">
                      {item.writtenExamWeightage}%
                    </span>
                  </td>

                  <td>
                    <span
                      className={`status-pill ${item.status === "APPROVED" ||
                        item.status === "L1_APPROVED"
                        ? "approved"
                        : item.status === "REJECTED" ||
                          item.status === "L1_REJECTED" ||
                          item.status === "L2_REJECTED"
                          ? "rejected"
                          : item.status === "FINALIZED"
                            ? "finalized"
                            : "pending"
                        }`}
                    >
                      {item.status?.replaceAll("_", " ")}
                    </span>
                  </td>

                  <td>
                    <div className="d-flex justify-content-center align-items-center gap-2 w-100">
                      <button
                        className="icon-btn"
                        onClick={() => onView && onView(item)}
                      >
                        <FaEye size={13} />
                      </button>

                      <button
                        className="icon-btn"
                        disabled={
                          !["PENDING", "L1_REJECTED", "L2_REJECTED", "APPROVED"].includes(
                            item.status
                          )
                        }
                        style={{
                          opacity: ![
                            "PENDING",
                            "L1_REJECTED",
                            "L2_REJECTED",
                            "APPROVED",
                          ].includes(item.status)
                            ? 0.5
                            : 1,
                          cursor: ![
                            "PENDING",
                            "L1_REJECTED",
                            "L2_REJECTED",
                            "APPROVED",
                          ].includes(item.status)
                            ? "not-allowed"
                            : "pointer",
                        }}
                        onClick={() => {
                          if (
                            !["PENDING", "L1_REJECTED", "L2_REJECTED", "APPROVED"].includes(
                              item.status
                            )
                          ) {
                            return;
                          }

                          onEdit && onEdit(item);
                        }}
                      >
                        <FaPen size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-4">
                  {t("no_configurations_found")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}

    </div>
  );
}

import React from "react";
import edit_icon from "../../../assets/edit_icon.png";
import delete_icon from "../../../assets/delete_icon.png";
import Loader from "../../../shared/components/Loader";
import { useTranslation } from "react-i18next";
const InterviewPanelTable = ({
  panels,
  loading,
  onEdit,
  onDelete,
  page,
  setPage,
  size,
  setSize,
  totalPages,
  pageSize = 10,
  search,
  setSearch,
  showFilters,
  setShowFilters,
}) => {
  const { t } = useTranslation(["interviewPanelCommittee", "common"]);
  return (
    <>
      {/* ===== HEADER ===== */}
      <div className="table-header">
        {loading && <Loader />}
        <span className="table-title">
          {" "}
          {t("interviewPanelCommittee:panels_history")}
        </span>

        <div className="table-search-row">
          <input
            type="text"
            placeholder={t("interviewPanelCommittee:search_panel_name")}
            className="table-search-input"
            value={search?.panelName || ""}
            onChange={(e) =>
              setSearch((prev) => ({
                ...prev,
                panelName: e.target.value,
              }))
            }
          />

          <div className="table-filters">
          
            <select
              className="table-filter-select"
              value={search.committeeName || ""}
              onChange={(e) =>
                setSearch((prev) => ({
                  ...prev,
                  committeeName: e.target.value,
                }))
              }
            >
              <option value="">
                {" "}
                {t("interviewPanelCommittee:all_committees")}
              </option>
              <option value="Interview">
                {t("interviewPanelCommittee:interview")}
              </option>
              <option value="Screening">
                {t("interviewPanelCommittee:screening")}
              </option>
              <option value="Compensation">
                {t("interviewPanelCommittee:compensation")}
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* ===== TABLE ===== */}
      <table className="table panel-table">
        <thead>
          <tr>
            <th>{t("interviewPanelCommittee:s_no")}</th>
            <th>
              {t("interviewPanelCommittee:panel_name")}
            </th>
            <th>
              {t("interviewPanelCommittee:panel_type")}
             
            </th>

            <th>
              {t("interviewPanelCommittee:panel_members")}
            </th>
            <th>{t("common:actions")}</th>
          </tr>
        </thead>

        <tbody>
          {panels.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ textAlign: "center" }}>
                {t("interviewPanelCommittee:no_panels_found")}
              </td>
            </tr>
          ) : (
            panels.map((panel, index) => (
              <tr key={panel.id}>
                {/* ✅ Correct serial number */}
                <td>{page * size + index + 1}</td>

                <td className="panel-name-cell" title={panel.panelName}>
                  {panel.panelName}
                </td>
                <td>{panel.panelType}</td>
                <td>{panel.members}</td>
                {/* <td>{panel.centerName}</td> */}

                <td className="actions">
                  <div className="icon-group">
                    <button
                      className="table-icon-btn edit"
                      onClick={() => onEdit(panel.id)}
                    >
                      <img src={edit_icon} alt="Edit" />
                    </button>

                    <button
                      className="table-icon-btn delete"
                      onClick={() => onDelete(panel.id, panel.panelName)}
                    >
                      <img src={delete_icon} alt="Delete" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <div className="table-footer">
        {/* Pagination - CENTER */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="pagination-btn"
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
            >
              ‹
            </button>

            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                className={`pagination-btn ${page === i ? "active" : ""}`}
                onClick={() => setPage(i)}
              >
                {i + 1}
              </button>
            ))}

            <button
              className="pagination-btn"
              disabled={page === totalPages - 1}
              onClick={() => setPage(page + 1)}
            >
              ›
            </button>
          </div>
        )}

        {/* Page Size - RIGHT */}
        <div className="table-size-selector">
          <span>{t("interviewPanelCommittee:show")}</span>
          <select
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span>{t("interviewPanelCommittee:entries")}</span>
        </div>
      </div>
    </>
  );
};

export default InterviewPanelTable;

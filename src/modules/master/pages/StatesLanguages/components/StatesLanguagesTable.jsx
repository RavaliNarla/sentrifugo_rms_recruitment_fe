import React from "react";
import { useTranslation } from "react-i18next";
import { Table, Button } from "react-bootstrap";
import editIcon from "../../../../../assets/edit_icon.png";
import viewIcon from "../../../../../assets/view_icon.png";
const StatesLanguagesTable = ({
  data = [],
  currentPage,
  setCurrentPage,
  pageSize,
  setPageSize,
  onEdit,
  onView,
}) => {
  const { t } = useTranslation(["common", "stateLanguages"]);
  const indexOfLast = currentPage * pageSize;
  const indexOfFirst = indexOfLast - pageSize;
  const current = data.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(data.length / pageSize);
  const getVisiblePages = (currentPage, totalPages) => {
    let pages = [];
    let showStartEllipsis = false;
    let showEndEllipsis = false;
    if (totalPages <= 3) {
      pages = [...Array(totalPages)].map((_, i) => i + 1);
    } else {
      if (currentPage <= 2) {
        pages = [1, 2, 3];
        showEndEllipsis = true;
      } else if (currentPage >= totalPages - 1) {
        pages = [totalPages - 2, totalPages - 1, totalPages];
        showStartEllipsis = true;
      } else {
        pages = [currentPage - 1, currentPage, currentPage + 1];
        showStartEllipsis = true;
        showEndEllipsis = true;
      }
    }
    return { pages, showStartEllipsis, showEndEllipsis };
  };
  return (
    <>
      <div className="table-responsive">
        <Table hover className="user-table">
          <thead>
            <tr>
              <th>{t("stateLanguages:s_no")}</th>
              <th>{t("stateLanguages:state")}</th>
              <th>{t("stateLanguages:languages")}</th>
              <th style={{ textAlign: "center" }}>{t("common:actions")}</th>
            </tr>
          </thead>
          <tbody>
            {current.length ? (
              current.map((item, idx) => (
                <tr key={idx}>
                  <td>{indexOfFirst + idx + 1}</td>
                  <td className="text-nowrap">{item.stateName || "-"}</td>
                  <td className="text-nowrap">
                    {item.languageNames?.length
                      ? item.languageNames.join(", ")
                      : "-"}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <div className="action-buttons">
                      <Button
                        variant="link"
                        className="action-btn view-btn"
                        onClick={() => onView(item)}
                      >
                        <img src={viewIcon} alt="View" className="icon-16" />
                      </Button>
                      <Button
                        variant="link"
                        className="action-btn edit-btn"
                        onClick={() => onEdit(item, idx)}
                      >
                        <img src={editIcon} alt="Edit" className="icon-16" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center">
                  {t("stateLanguages:no_data")}
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
      {/* PAGINATION */}
      {data.length > 0 && (
        <div
          className="d-flex justify-content-end align-items-center gap-3 mt-2"
          style={{ marginBottom: "60px" }}
        >
          {/* PAGE SIZE */}
          <div className="d-flex align-items-center gap-2 user-actions">
            <span
              className="fw-semibold"
              style={{ color: "var(--bs-heading-color)" }}
            >
              {t("stateLanguages:page_size")} :
            </span>
            <select
              className="form-select form-select-sm"
              style={{ width: "90px" }}
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              {[5, 10, 15, 20, 25, 30].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          {/* PAGINATION */}
          <ul className="pagination mb-0">
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button
                className="page-link"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                &laquo;
              </button>
            </li>
            {(() => {
              const { pages, showStartEllipsis, showEndEllipsis } =
                getVisiblePages(currentPage, totalPages);
              return (
                <>
                  {showStartEllipsis && (
                    <li className="page-item disabled">
                      <span className="page-link">…</span>
                    </li>
                  )}
                  {pages.map((number) => (
                    <li
                      key={number}
                      className={`page-item ${currentPage === number ? "active" : ""}`}
                    >
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(number)}
                      >
                        {number}
                      </button>
                    </li>
                  ))}
                  {showEndEllipsis && (
                    <li className="page-item disabled">
                      <span className="page-link">…</span>
                    </li>
                  )}
                </>
              );
            })()}
            <li
              className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}
            >
              <button
                className="page-link"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                &raquo;
              </button>
            </li>
          </ul>
        </div>
      )}
    </>
  );
};
export default StatesLanguagesTable;

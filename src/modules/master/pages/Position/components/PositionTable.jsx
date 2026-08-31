import React from "react";
import { Table, Button, Form } from "react-bootstrap";
import viewIcon from "../../../../../assets/view_icon.png";
import editIcon from "../../../../../assets/edit_icon.png";
import deleteIcon from "../../../../../assets/delete_icon.png";

const PositionTable = ({
  data,
  searchTerm,
  currentPage,
  setCurrentPage,
  pageSize,
  setPageSize,
  onEdit,
  onView,
  onDelete,
  t,
}) => {
  /*  FILTER (NO UUID FILTERING) */
  const term = searchTerm.toLowerCase().trim();

  const filtered = !term
    ? data
    : data.filter(
        (p) =>
          p.title?.toLowerCase().includes(term) ||
          p.department?.toLowerCase().includes(term) ||
          p.jobGrade?.toLowerCase().includes(term) ||
          p.rolesResponsibilities?.toLowerCase().includes(term) ||
          p.description?.toLowerCase().includes(term)
      );
  const indexOfLast = currentPage * pageSize;
  const indexOfFirst = indexOfLast - pageSize;
  const current = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / pageSize);
  const getVisiblePages = (currentPage, totalPages) => {
    const windowSize = 3;

    let start = currentPage - 1;
    let end = currentPage + 2;

    // Clamp to bounds
    if (start < 1) {
      start = 1;
      end = Math.min(totalPages + 1, start + windowSize);
    }

    if (end > totalPages + 1) {
      end = totalPages + 1;
      start = Math.max(1, end - windowSize);
    }

    const pages = [];
    for (let i = start; i < end; i++) {
      pages.push(i);
    }

    return {
      pages,
      showStartEllipsis: start > 1,
      showEndEllipsis: end <= totalPages,
    };
  };
  return (
    <>
      <div className="table-responsive">
        <Table hover className="user-table">
          <thead>
            <tr>
              <th>{t("s_no")}</th>
              <th>{t("department")}</th>
              <th>{t("position_title")}</th>
              <th>{t("job_grade")}</th>
              <th>{t("roles_responsibilities")}</th>
              <th style={{ textAlign: "center" }}>{t("actions")}</th>
            </tr>
          </thead>

          <tbody>
            {current.length > 0 ? (
              current.map((p, idx) => (
                <tr key={p.id}>
                  <td>{indexOfFirst + idx + 1}</td>
                  <td>{p.department}</td>
                  <td>{p.title}</td>
                  <td>{p.jobGrade}</td>
                  <td>{p.rolesResponsibilities}</td>
                  <td>
                    <div className="action-buttons">
                      <Button
                        variant="link"
                        className="action-btn"
                        title="View"
                        onClick={() => onView(p)}
                      >
                        <img src={viewIcon} alt="view" className="icon-16" />
                      </Button>

                      <Button
                        variant="link"
                        className="action-btn"
                        title="Edit"
                        onClick={() => onEdit(p)}
                      >
                        <img src={editIcon} alt="edit" className="icon-16" />
                      </Button>

                      <Button
                        variant="link"
                        className="action-btn"
                        title="Delete"
                        onClick={() => onDelete(p)}
                      >
                        <img
                          src={deleteIcon}
                          alt="delete"
                          className="icon-16"
                        />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center">
                  No positions found
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      {filtered.length > 0 && (
        <div className="d-flex justify-content-end align-items-center gap-3 mt-2">
          {/* Page size */}
          <div className="d-flex align-items-center gap-2 user-actions">
            <span
              className="fw-semibold"
              style={{ color: "var(--bs-heading-color)" }}
            >
              {t("page_size")}
            </span>

            <Form.Select
              size="sm"
              style={{ width: "90px" }}
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              {[5, 10, 15, 25, 30].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </Form.Select>
          </div>

          {/* Pagination */}
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
                  {/* Leading ellipsis */}
                  {showStartEllipsis && (
                    <li className="page-item disabled">
                      <span className="page-link">…</span>
                    </li>
                  )}

                  {/* Page numbers */}
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

                  {/* Trailing ellipsis */}
                  {showEndEllipsis && (
                    <li className="page-item disabled">
                      <span className="page-link">…</span>
                    </li>
                  )}
                </>
              );
            })()}

            <li
              className={`page-item ${
                currentPage === totalPages ? "disabled" : ""
              }`}
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

export default PositionTable;

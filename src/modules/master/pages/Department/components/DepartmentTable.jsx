import React from "react";
import { Table, Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import viewIcon from "../../../../../assets/view_icon.png";
import editIcon from "../../../../../assets/edit_icon.png";
import deleteIcon from "../../../../../assets/delete_icon.png";

const DepartmentTable = ({
  data,
  searchTerm,
  onEdit,
  onView,
  onDelete,
  currentPage,
  setCurrentPage,
  pageSize,
  setPageSize,
}) => {
  const { t } = useTranslation(["department"]);
  // Filter logic
  const filteredDepts = data.filter((dept) => {
    const term = searchTerm.toLowerCase().trim();

    if (!term) return true;

    return (
      dept.name?.toLowerCase().includes(term) ||
      dept.description?.toLowerCase().includes(term)
    );
  });

  const indexOfLastDept = currentPage * pageSize;
  const indexOfFirstDept = indexOfLastDept - pageSize;
  const totalPages = Math.ceil(filteredDepts.length / pageSize);
  const currentDepts = filteredDepts.slice(indexOfFirstDept, indexOfLastDept);

  const paginate = (num) => setCurrentPage(num);
  const getVisiblePages = (currentPage, totalPages) => {
    const windowSize = 3;

    let start = currentPage - 1;
    let end = currentPage + 2;
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
              <th>{t("department:s.no.")}</th>
              <th>{t("department:name")}</th>
              <th>{t("department:description")}</th>
              <th style={{ textAlign: "center" }}>{t("department:actions")}</th>
            </tr>
          </thead>
          <tbody>
            {currentDepts.length > 0 ? (
              currentDepts.map((dept, idx) => (
                <tr key={dept.id}>
                  <td>{indexOfFirstDept + idx + 1}</td>
                  <td data-label="Name:">&nbsp;{dept.name}</td>
                  <td data-label="Description:">&nbsp;{dept.description}</td>
                  <td>
                    <div className="action-buttons">
                      <Button
                        variant="link"
                        className="action-btn view-btn"
                        title="View"
                        onClick={() => onView(dept)}
                      >
                        <img src={viewIcon} alt="View" className="icon-16" />
                      </Button>
                      <Button
                        variant="link"
                        className="action-btn edit-btn"
                        title="Edit"
                        onClick={() => onEdit(dept)}
                      >
                        <img src={editIcon} alt="Edit" className="icon-16" />
                      </Button>
                      <Button
                        variant="link"
                        className="action-btn delete-btn"
                        title="Delete"
                        onClick={() => onDelete(dept)}
                      >
                        <img
                          src={deleteIcon}
                          alt="Delete"
                          className="icon-16"
                        />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center">
                  {t("department:no_records")}
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
      {filteredDepts.length > 0 && (
        <div className="d-flex justify-content-end align-items-center gap-3 mt-2">
          {/* Page size */}
          <div className="d-flex align-items-center gap-2 user-actions">
            <span
              className="fw-semibold"
              style={{ color: "var(--bs-heading-color)" }}
            >
              {t("page_size")}
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

          {/* Pagination */}
          <ul className="pagination mb-0">
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button
                className="page-link"
                onClick={() => paginate(currentPage - 1)}
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
              className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}
            >
              <button
                className="page-link"
                onClick={() => paginate(currentPage + 1)}
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

export default DepartmentTable;

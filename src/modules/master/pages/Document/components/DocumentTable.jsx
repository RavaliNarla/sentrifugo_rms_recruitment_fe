import { Table, Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";

import viewIcon from "../../../../../assets/view_icon.png";
import editIcon from "../../../../../assets/edit_icon.png";
import deleteIcon from "../../../../../assets/delete_icon.png";

const DocumentTable = ({
  data,
  searchTerm,
  onEdit,
  onView,
  onDelete,
  currentPage,
  setCurrentPage,
  itemsPerPage,
  setItemsPerPage,
}) => {
  const { t } = useTranslation(["documents"]);
  const filtered = data.filter((d) =>
    [d.name, d.description].some((v) =>
      String(v || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    )
  );

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const current = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
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
              <th>{t("sno")}</th>
              <th>{t("document_name")}</th>
              <th>{t("description")}</th>
              <th>{t("confirm_required")}</th>
              <th style={{ textAlign: "center" }}>{t("actions")}</th>
            </tr>
          </thead>

          <tbody>
            {current.length > 0 ? (
              current.map((d, idx) => (
                <tr key={d.id}>
                  <td>{indexOfFirst + idx + 1}</td>
                  <td>{d.name}</td>
                  <td>{d.description}</td>
                  <td>{d.isRequiredConfirmed ? "True" : "False"}</td>

                  <td>
                    <div className="action-buttons">
                      <Button
                        variant="link"
                        className="action-btn view-btn"
                        onClick={() => onView(d)}
                      >
                        <img src={viewIcon} alt="view" className="icon-16" />
                      </Button>

                      <Button
                        variant="link"
                        className="action-btn edit-btn"
                        onClick={() => onEdit(d)}
                      >
                        <img src={editIcon} alt="edit" className="icon-16" />
                      </Button>

                      <Button
                        variant="link"
                        className="action-btn delete-btn"
                        onClick={() => onDelete(d)}
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
                <td colSpan="4" className="text-center">
                  {t("noRecords")}
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      {/* DROPDOWN LEFT + PAGINATION RIGHT */}
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

            <select
              className="form-select form-select-sm"
              style={{ width: "90px" }}
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
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

export default DocumentTable;

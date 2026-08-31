import { Table, Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";

import viewIcon from "../../../../../assets/view_icon.png";
import editIcon from "../../../../../assets/edit_icon.png";
import deleteIcon from "../../../../../assets/delete_icon.png";

const SpecialCategoryTable = ({
  data,
  searchTerm,
  onView,
  onEdit,
  onDelete,
  currentPage,
  setCurrentPage,
  itemsPerPage,
  setItemsPerPage,
}) => {
  const { t } = useTranslation(["specialCategory"]);
  const filtered = data.filter((s) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;

    return (
      s.code?.toLowerCase().includes(term) ||
      s.name?.toLowerCase().includes(term) ||
      s.description?.toLowerCase().includes(term)
    );
  });

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const current = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  return (
    <>
      <div className="table-responsive">
        <Table hover className="user-table">
          <thead>
            <tr>
              <th>{t("sno")}</th>
              <th>{t("code")}</th>
              <th>{t("name")}</th>
              <th>{t("description")}</th>
              <th style={{ textAlign: "center" }}>{t("actions")}</th>
            </tr>
          </thead>

          <tbody>
            {current.length > 0 ? (
              current.map((s, idx) => (
                <tr key={s.id}>
                  <td>{indexOfFirst + idx + 1}</td>
                  <td>{s.code}</td>
                  <td>{s.name}</td>
                  <td>{s.description}</td>
                  <td>
                    <div className="action-buttons">
                      <Button
                        variant="link"
                        className="action-btn view-btn"
                        onClick={() => onView(s)}
                      >
                        <img src={viewIcon} alt="view" className="icon-16" />
                      </Button>

                      <Button
                        variant="link"
                        className="action-btn edit-btn"
                        onClick={() => onEdit(s)}
                      >
                        <img src={editIcon} alt="edit" className="icon-16" />
                      </Button>

                      <Button
                        variant="link"
                        className="action-btn delete-btn"
                        onClick={() => onDelete(s)}
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
                <td colSpan="5" className="text-center">
                  {t("noRecords")}
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

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <li
                key={n}
                className={`page-item ${n === currentPage ? "active" : ""}`}
              >
                <button className="page-link" onClick={() => setCurrentPage(n)}>
                  {n}
                </button>
              </li>
            ))}

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

export default SpecialCategoryTable;

// components/LocationTable.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import { Table, Button } from "react-bootstrap";
import viewIcon from "../../../../../assets/view_icon.png";
import editIcon from "../../../../../assets/edit_icon.png";
import deleteIcon from "../../../../../assets/delete_icon.png";
const LocationTable = ({
  data,
  searchTerm,
  onView,
  onEdit,
  onDelete,
  currentPage,
  setCurrentPage,
  pageSize,
  setPageSize,
}) => {
  const filtered = data.filter((loc) =>
    [loc.name, loc.cityName].some((v) =>
      String(v || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    )
  );
  const { t } = useTranslation(["location", "validation"]);

  const indexOfLast = currentPage * pageSize;
  const indexOfFirst = indexOfLast - pageSize;
  const current = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / pageSize);

  return (
    <>
      <Table hover className="user-table">
        <thead>
          <tr>
            <th>{t("sno")}</th>
            <th>{t("cityy")}</th>
            <th>{t("location_name")}</th>
            <th style={{ textAlign: "center" }}>{t("actions")}</th>
          </tr>
        </thead>

        <tbody>
          {current.length ? (
            current.map((loc, idx) => (
              <tr key={loc.id}>
                <td>{indexOfFirst + idx + 1}</td>
                <td>{loc.cityName}</td>
                <td>{loc.name}</td>
                <td>
                  <div className="action-buttons">
                    <Button
                      variant="link"
                      className="action-btn view-btn"
                      title="View"
                      onClick={() => onView && onView(loc)}
                    >
                      <img src={viewIcon} alt="View" className="icon-16" />
                    </Button>
                    <Button
                      variant="link"
                      className="action-btn edit-btn"
                      title="Edit"
                      onClick={() => onEdit(loc)}
                    >
                      <img src={editIcon} alt="Edit" className="icon-16" />
                    </Button>

                    <Button
                      variant="link"
                      className="action-btn delete-btn"
                      title="Delete"
                      onClick={() => onDelete(loc)}
                    >
                      <img src={deleteIcon} alt="Delete" className="icon-16" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center">
                No records found
              </td>
            </tr>
          )}
        </tbody>
      </Table>

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
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                &laquo;
              </button>
            </li>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (number) => (
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
              )
            )}

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

export default LocationTable;

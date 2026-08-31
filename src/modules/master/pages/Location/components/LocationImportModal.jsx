import React, { useState } from "react";
import { Button, Alert } from "react-bootstrap";
import { Upload as UploadIcon } from "react-bootstrap-icons";
import { useTranslation } from "react-i18next";
import { useLocations } from "../hooks/useLocations";

const LocationImportModal = ({ onClose = () => {}, onSuccess = () => {} }) => {
  const { t } = useTranslation(["location"]);
  const [errorDetails, setErrorDetails] = useState([]);

  const { bulkAddLocations, downloadLocationTemplate, loading } =
    useLocations();

  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const isExcel =
      file &&
      (file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.type === "application/vnd.ms-excel");

    if (!isExcel) {
      setError(t("location:invalid_file"));
      return;
    }

    setSelectedFile(file);
    setError("");
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError(t("location:no_file_selected"));
      return;
    }

    const result = await bulkAddLocations(selectedFile);

    if (result?.success) {
      onSuccess();
      onClose();
    } else {
      setError(result?.message || t("location:import_error"));
      setErrorDetails(result?.data || []);
    }
  };

  return (
    <div>
      <div
        className="import-area p-4 rounded"
        style={{ background: "#fceee9" }}
      >
        <div className="text-center mb-3">
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 12,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#fff",
              marginBottom: "1rem",
            }}
          >
            <UploadIcon size={32} />
          </div>

          <h5 className="mb-2 uploadfile">{t("location:upload_locations")}</h5>

          <p className="text-muted small">{t("location:support_xlsx")}</p>
        </div>

        {error && (
          <Alert variant="danger">
            {/* Summary */}
            <div className="fw-semibold">{error}</div>

            {/* Scrollable row errors */}
            {errorDetails.length > 0 && (
              <div
                className="mt-2"
                style={{
                  maxHeight: "150px",
                  overflowY: "auto",
                }}
              >
                <ul className="mb-0">
                  {errorDetails.map((msg, idx) => (
                    <li key={idx}>{msg}</li>
                  ))}
                </ul>
              </div>
            )}
          </Alert>
        )}
        <input
          id="upload-xlsx-location"
          type="file"
          accept=".xlsx,.xls"
          hidden
          onChange={handleFileChange}
          disabled={loading}
        />

        <div className="text-center mb-3">
          <label htmlFor="upload-xlsx-location">
            <Button
              variant="primary"
              as="span"
              className="btnupload"
              disabled={loading}
            >
              {selectedFile
                ? t("location:reupload_xlsx")
                : t("location:upload_xlsx")}
            </Button>
          </label>

          {selectedFile && (
            <div className="mt-2">
              <small className="text-muted d-block">{selectedFile.name}</small>
              <Button
                variant="outline-danger"
                size="sm"
                className="mt-2"
                onClick={() => setSelectedFile(null)}
                disabled={loading}
              >
                {t("location:remove")}
              </Button>
            </div>
          )}
        </div>

        <div className="text-center mb-3 small">
          {t("location:download_template")} :
          <button
            type="button"
            onClick={downloadLocationTemplate}
            className="btn btn-link p-0 text-primary text-decoration-none btnfont"
            style={{ cursor: "pointer" }}
            disabled={loading}
          >
            {" "}
            XLSX
          </button>
        </div>
      </div>

      <div className="d-flex justify-content-end gap-2 modal-footer-custom">
        <Button
          variant="outline-secondary"
          onClick={onClose}
          disabled={loading}
        >
          {t("location:cancel")}
        </Button>

        <Button variant="primary" onClick={handleUpload} disabled={loading}>
          {loading ? t("location:importing") : t("location:import")}
        </Button>
      </div>
    </div>
  );
};

export default LocationImportModal;

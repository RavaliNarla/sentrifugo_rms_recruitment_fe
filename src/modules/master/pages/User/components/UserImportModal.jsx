import React, { useState } from "react";
import { Button, Alert } from "react-bootstrap";
import { Upload as UploadIcon } from "react-bootstrap-icons";
import { useTranslation } from "react-i18next";

const UserImportModal = ({
  onClose = () => {},
  onSuccess = () => {},
  bulkAddUsers,
  downloadUserTemplate,
  loading,
}) => {
  const { t } = useTranslation(["user"]);

  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState("");
  const [errorDetails, setErrorDetails] = useState([]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    const isExcel =
      file &&
      (file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.type === "application/vnd.ms-excel");

    if (!isExcel) {
      setError(t("user:invalid_file"));
      return;
    }

    setSelectedFile(file);
    setError("");
    setErrorDetails([]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError(t("user:no_file_selected"));
      return;
    }

    const result = await bulkAddUsers(selectedFile);

    if (result?.success) {
      onSuccess();
      onClose();
    } else {
      setError(result?.error || t("user:import_error"));
      setErrorDetails(result?.details || []);
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

          <h5 className="mb-2 uploadfile">{t("user:upload_users")}</h5>

          <p className="text-muted small">{t("user:support_xlsx")}</p>
        </div>

        {error && (
          <Alert variant="danger">
            <div>{error}</div>

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

        {/* FILE INPUT */}
        <input
          id="upload-xlsx-user"
          type="file"
          accept=".xlsx,.xls"
          hidden
          onChange={handleFileChange}
          disabled={loading}
        />

        <div className="text-center mb-3">
          <label htmlFor="upload-xlsx-user">
            <Button
              variant="primary"
              as="span"
              className="btnupload"
              disabled={loading}
            >
              {selectedFile ? t("user:reupload_xlsx") : t("user:upload_xlsx")}
            </Button>
          </label>

          {selectedFile && (
            <div className="mt-2">
              <small className="text-muted d-block">{selectedFile.name}</small>

              <Button
                variant="outline-danger"
                size="sm"
                className="mt-2"
                onClick={() => {
                  setSelectedFile(null);
                  setError("");
                  setErrorDetails([]);
                }}
                disabled={loading}
              >
                {t("user:remove")}
              </Button>
            </div>
          )}
        </div>

        <div className="text-center mb-3 small">
          {t("user:download_template")} :
          <button
            type="button"
            onClick={downloadUserTemplate}
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
          {t("user:cancel")}
        </Button>

        <Button variant="primary" onClick={handleUpload} disabled={loading}>
          {loading ? t("user:importing") : t("user:import")}
        </Button>
      </div>
    </div>
  );
};

export default UserImportModal;

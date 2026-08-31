import React, { useState } from "react";
import { Button, Alert } from "react-bootstrap";
import { Upload as UploadIcon } from "react-bootstrap-icons";
import { useDocuments } from "../hooks/useDocuments";

const DocumentImportModal = ({
  t = (key) => key, // Default translation function
  onClose = () => {},
  onSuccess = () => {},
}) => {
  const { bulkAddDocuments, downloadDocumentTemplate, loading } =
    useDocuments();
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const isExcel =
      file &&
      (file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.type === "application/vnd.ms-excel" ||
        file.name.endsWith(".xlsx") ||
        file.name.endsWith(".xls"));

    if (isExcel) {
      setSelectedFile(file);
      setError("");
    } else {
      setError("Only Excel files (.xlsx, .xls) are allowed.");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a file to upload");
      return;
    }

    const result = await bulkAddDocuments(selectedFile);

    if (result.success) {
      onSuccess();
      onClose();
    } else {
      setError(result.error || "Failed to import documents");
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
          <h5 className="mb-2">
            {t("upload_documents") || "Upload Documents"}
          </h5>
          <p className="text-muted small">Support for XLSX formats</p>
        </div>

        {error && (
          <Alert variant="danger" className="text-center">
            {error}
          </Alert>
        )}

        <input
          id="upload-xlsx"
          type="file"
          accept=".xlsx,.xls"
          hidden
          onChange={handleFileChange}
          disabled={loading}
        />

        <div className="text-center mb-3">
          <label htmlFor="upload-xlsx">
            <Button
              variant="primary"
              as="span"
              className="btnupload"
              disabled={loading}
            >
              {selectedFile ? "Reupload XLSX" : "Upload XLSX"}
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
                Remove
              </Button>
            </div>
          )}
        </div>

        <div className="text-center mb-3 import-area small">
          {t("download_template") || "Download template:"}

          <button
            type="button"
            onClick={downloadDocumentTemplate}
            className="btn btn-link p-0 text-primary text-decoration-none btnfont"
            style={{ cursor: "pointer" }}
            disabled={loading}
          >
            {" "}
            XLSX
          </button>
        </div>
      </div>

      <div className="d-flex justify-content-end gap-2 modal-footer-custom mt-3">
        <Button
          variant="outline-secondary"
          onClick={onClose}
          disabled={loading}
        >
          {t("cancel") || "Cancel"}
        </Button>
        <Button variant="primary" onClick={handleUpload}>
          {loading ? t("importing") || "Importing..." : t("import") || "Import"}
        </Button>
      </div>
    </div>
  );
};

export default DocumentImportModal;

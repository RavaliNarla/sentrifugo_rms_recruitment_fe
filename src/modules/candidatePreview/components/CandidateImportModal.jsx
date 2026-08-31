import React, { useState } from "react";

import { useCandidateImport } from "../hooks/useCandidateImport";

import { Button, Alert } from "react-bootstrap";

import { Upload as UploadIcon } from "react-bootstrap-icons";

const CandidateImportModal = ({
  t,
  onClose = () => {},
  onSuccess = () => {},
  positionIds = [],
  fetchCandidates = () => {},
}) => {
  

  const [selectedFile, setSelectedFile] = useState(null);

  const [error, setError] = useState("");

  const [errorDetails, setErrorDetails] = useState([]);

  /* =========================
     HOOK
  ========================== */

  const {
    bulkImportCandidates,

    downloadCandidateTemplate,

    loading,
  } = useCandidateImport();

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    const isExcel =
      file &&
      (file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.type === "application/vnd.ms-excel");

    if (isExcel) {
      setSelectedFile(file);

      setError("");

      setErrorDetails([]);
    } else {
      setError("Please upload valid XLSX file");
    }
  };

  

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select file");

      return;
    }

    const result = await bulkImportCandidates(selectedFile);

    if (result.success) {
      onSuccess();
await fetchCandidates();
      onClose();
    } else {
      setError(result.error);

      setErrorDetails(result.details || []);
    }
  };

  return (
    <div>
     
      <div
        className="p-4 rounded"
        style={{
          background: "#FCEEE9",
          borderRadius: "18px",
          minHeight: "280px",
        }}
      >
        {/* ICON + TITLE */}

        <div className="text-center mb-3">
          <div
            style={{
              width: 58,
              height: 58,
              borderRadius: 12,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#fff",
              marginBottom: "1rem",
            }}
          >
            <UploadIcon size={24} color="#374151" />
          </div>

          <h5
            className="mb-1"
            style={{
              fontWeight: "600",
              fontSize: "15px",
              color: "#1F2937",
            }}
          >
           {t("uploadCandidateScoreTitle")}
          </h5>

          <p
            className="text-muted mb-3"
            style={{
              fontSize: "12px",
            }}
          >
           {t("uploadCandidateScoreDescription")}
          </p>
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

        
        <input
          id="upload-candidates-xlsx"
          type="file"
          accept=".xlsx,.xls"
          hidden
          onChange={handleFileChange}
          disabled={loading}
        />

        <div className="text-center mb-3">
          <label htmlFor="upload-candidates-xlsx">
            <Button
              variant="primary"
              as="span"
              disabled={loading}
              style={{
                background: "#F97316",
                border: "none",
                fontSize: "13px",
                fontWeight: "600",
                padding: "8px 18px",
                borderRadius: "10px",
              }}
            >
              {selectedFile ? t("reuploadXlsx") : t("uploadXlsx")}
            </Button>
          </label>

          {/* FILE NAME */}

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
                 {t("remove")}
              </Button>
            </div>
          )}
        </div>

        <div
          className="text-center"
          style={{
            fontSize: "15px",
            marginTop: "18px",
          }}
        >
        {t("downloadTemplate")}:
          <button
            type="button"
            onClick={async () => {
              const result = await downloadCandidateTemplate(positionIds);

              if (!result?.success) {
                setError(result.error);

                setErrorDetails(result.details || []);
              }
            }}
            className="btn btn-link p-0 text-primary text-decoration-none"
            style={{
              cursor: "pointer",
              fontSize: "15px",
              fontWeight: "600",
            }}
            disabled={loading}
          >
            {" "}
            XLSX
          </button>
        </div>
      </div>

      <div className="d-flex justify-content-end gap-2 mt-3">
        <Button
          variant="outline-secondary"
          onClick={onClose}
          style={{
            fontSize: "13px",
            padding: "7px 16px",
            borderRadius: "10px",
            fontWeight: "600",
          }}
        >
          {t("cancel")}
        </Button>

        <Button
          onClick={handleUpload}
          style={{
            background: "#F97316",
            border: "none",
            fontSize: "13px",
            padding: "7px 18px",
            borderRadius: "10px",
            fontWeight: "600",
          }}
          disabled={loading}
        >
        {loading ? t("importing") : t("import")}
        </Button>
      </div>
    </div>
  );
};

export default CandidateImportModal;

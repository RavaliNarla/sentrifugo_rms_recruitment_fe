import React, { useState } from "react";
import { Button, Alert } from "react-bootstrap";
import { Upload as UploadIcon } from "react-bootstrap-icons";

const PositionAssignmentImportModal = ({
  t,
  onClose = () => {},
  onSuccess = () => {},
  bulkImportPositionAssignments,
  downloadPositionAssignmentTemplate,
  loading,
}) => {
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

    if (isExcel) {
      setSelectedFile(file);
      setError("");
    } else {
      setError(t("interviewPanelCommittee:invalid_file"));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError(t("interviewPanelCommittee:no_file_selected"));
      return;
    }
    const result = await bulkImportPositionAssignments(selectedFile);

    if (result.success) {
      onSuccess();
      onClose();
    } else {
      setError(result.error);
      setErrorDetails(result.details || []);
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

          <h5 className="mb-2 uploadfile">
            {t("interviewPanelCommittee:upload_position_assignments")}
          </h5>

          <p className="text-muted small">
            {t("interviewPanelCommittee:support_xlsx")}
          </p>
        </div>

        {error && (
          <Alert variant="danger">
            <div>{error}</div>

            {errorDetails.length > 0 && (
              <div
                className="mt-2"
                style={{ maxHeight: "150px", overflowY: "auto" }}
              >
                <ul className="mb-0">
                  {errorDetails.map((msg, idx) => (
                    <li key={idx} className="error-display">
                      {msg}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Alert>
        )}
        <input
          id="upload-position-assignment-xlsx"
          type="file"
          accept=".xlsx,.xls"
          hidden
          onChange={handleFileChange}
          disabled={loading}
        />

        <div className="text-center mb-3">
          <label htmlFor="upload-position-assignment-xlsx">
            <Button
              variant="primary"
              as="span"
              className="btnupload"
              disabled={loading}
            >
              {selectedFile
                ? t("interviewPanelCommittee:reupload_xlsx")
                : t("interviewPanelCommittee:upload_xlsx")}
            </Button>
          </label>

          {selectedFile && (
            <div className="mt-2">
              <small className="text-muted d-block file-name">
                {selectedFile.name}
              </small>
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
                {t("interviewPanelCommittee:remove")}
              </Button>
            </div>
          )}
        </div>

        <div className="text-center mb-3 import-area small">
          {t("interviewPanelCommittee:download_template")}:
          <button
            type="button"
            onClick={() => {
              downloadPositionAssignmentTemplate();
            }}
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
          {t("interviewPanelCommittee:cancel")}
        </Button>

        <Button
          variant=""
          className="import-btn"
          onClick={handleUpload}
          disabled={loading}
        >
          {loading
            ? t("interviewPanelCommittee:importing")
            : t("interviewPanelCommittee:import")}
        </Button>
      </div>
    </div>
  );
};

export default PositionAssignmentImportModal;

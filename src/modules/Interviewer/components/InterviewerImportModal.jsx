import React, { useState } from "react";
import { Button, Alert } from "react-bootstrap";
import { Upload as UploadIcon } from "react-bootstrap-icons";
import { useTranslation } from "react-i18next";

import InterviewerService from "../service/InterviewerService";

const InterviewerImportModal = ({
  onClose = () => {},
  onSuccess = () => {},

  positionId,
  selectedDate,
}) => {
  const { t } = useTranslation("interviewDay");

  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState("");
  const [errorDetails, setErrorDetails] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ================= FILE VALIDATION ================= */
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
      setError(t("invalid_file"));
    }
  };

  /* ================= UPLOAD ================= */
  const handleUpload = async () => {
    if (!selectedFile) {
      setError(t("no_file_selected"));
      return;
    }

    try {
      setLoading(true);

      //  RESET OLD ERRORS (IMPORTANT)
      setError("");
      setErrorDetails([]);

      const res = await InterviewerService.uploadInterviewFile(selectedFile);

      //  NORMALIZE RESPONSE (handles both formats)
      const success = res?.success ?? res?.data?.success;
      const message = res?.message ?? res?.data?.message;
      const details = res?.data ?? res?.data?.data ?? [];

      //  SUCCESS FLOW
      if (success) {
        onSuccess();
        onClose();
      }
      //  FAILURE (VALIDATION / BUSINESS ERROR)
      else {
        setError(message || t("import_error"));

        //  ENSURE ARRAY (VERY IMPORTANT)
        setErrorDetails(Array.isArray(details) ? details : []);
      }
    } catch (err) {
      const message = err?.response?.data?.message || t("upload_failed");

      const details = err?.response?.data?.data || [];

      setError(message);
      setErrorDetails(Array.isArray(details) ? details : []);
    } finally {
      setLoading(false);
    }
  };

  /* ================= TEMPLATE DOWNLOAD ================= */
  const downloadTemplate = async () => {
    try {
      if (!positionId || !selectedDate) {
        setError("Please select position and date");
        return;
      }

      const formatDate = (d) => {
        const date = new Date(d);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      };

      const res = await InterviewerService.downloadInterviewTemplate(
        positionId,
        formatDate(selectedDate)
      );

      // ✅ create download
      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "interview_template.xlsx";
      a.click();

      window.URL.revokeObjectURL(url);
    } catch {
      setError(t("template_download_failed") || "Template download failed");
    }
  };

  return (
    <div>
      <div
        className="import-area p-4 rounded"
        style={{ background: "#fceee9" }}
      >
        {/* ICON + TITLE */}
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

          <h5 className="mb-2 uploadfile">{t("upload_interview_data")}</h5>

          <p className="text-muted small">{t("support_xlsx")}</p>
        </div>

        {/* ERROR */}
        {/* ERROR */}
        {error && (
          <Alert variant="danger" className="custom-error-box">
            <div className="fw-semibold mb-2">{error}</div>

            {errorDetails.length > 0 && (
              <div className="error-scroll">
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
          id="upload-xlsx-interviewer"
          type="file"
          accept=".xlsx,.xls"
          hidden
          onChange={handleFileChange}
          disabled={loading}
        />

        {/* UPLOAD BUTTON */}
        <div className="text-center mb-3">
          <label htmlFor="upload-xlsx-interviewer">
            <Button
              variant="primary"
              as="span"
              className="btnupload"
              disabled={loading}
            >
              {selectedFile ? t("reupload_xlsx") : t("upload_xlsx")}
            </Button>
          </label>

          {/* FILE PREVIEW */}
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
                {t("remove")}
              </Button>
            </div>
          )}
        </div>

        {/* TEMPLATE DOWNLOAD */}
        <div className="text-center mb-3 import-area small">
          {t("download_template")}:
          <button
            type="button"
            onClick={downloadTemplate}
            className="btn btn-link p-0 text-primary text-decoration-none btnfont"
            disabled={loading}
          >
            {" "}
            XLSX
          </button>
        </div>
      </div>

      {/* FOOTER */}
      <div className="d-flex justify-content-end gap-2 modal-footer-custom">
        <Button
          variant="outline-secondary"
          onClick={onClose}
          disabled={loading}
        >
          {t("cancel")}
        </Button>

        <Button
          className="import-btn"
          onClick={handleUpload}
          disabled={loading}
        >
          {loading ? t("importing") : t("import")}
        </Button>
      </div>
    </div>
  );
};

export default InterviewerImportModal;

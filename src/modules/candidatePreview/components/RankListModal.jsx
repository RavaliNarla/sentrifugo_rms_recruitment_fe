import React from "react";
import { Modal } from "react-bootstrap";
import fileIcon from "../../../assets/upload-filled-file.png";
import deleteIcon from "../../../assets/delete_icon.png";
import { toast } from "react-toastify";
import jobPositionApiService from "../../jobPosting/services/jobPositionApiService";
import Loader from "../../../shared/components/Loader";
import { useTranslation } from "react-i18next";

const RankListModal = ({
  showRankListModal,
  setShowRankListModal,
  onUploadSuccess,
  selectedIds,
  setSelectedIds,
  positionId,
}) => {
  const { t } = useTranslation(["candidateWorkflow", "common"]);
  const [loading, setLoading] = React.useState(false);
  const [file, setFile] = React.useState(null);
  const [validationErrors, setValidationErrors] = React.useState([]);
  const fileInputRef = React.useRef(null);

  /* ---------------- FILE SELECT ---------------- */

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (!selectedFile.name.toLowerCase().endsWith(".xlsx")) {
      toast.error(t("candidateWorkflow:only_xlsx_allowed"));
      e.target.value = "";
      return;
    }

    setFile(selectedFile);
    setValidationErrors([]);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setValidationErrors([]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      if (!positionId) {
        toast.error("Please select a position");
        return;
      }

      setLoading(true);

      const response =
        await jobPositionApiService.downloadAssignLocationExcel(positionId);

      // Error response
      if (response instanceof Blob && response.type === "application/json") {
        const text = await response.text();

        const json = JSON.parse(text);

        toast.error(
          json?.message || "Failed to download template"
        );

        return;
      }

      // Success response
      const url = window.URL.createObjectURL(response.data);

      const link = document.createElement("a");
      link.href = url;
      link.download = "Assign_Locations.xlsx";

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);

      toast.success("Downloaded successfully");
    } catch (err) {
      console.error("DOWNLOAD ERROR =>", err);

      toast.error(
        err?.message || "Failed to download template"
      );
    } finally {
      setLoading(false);
    }
  };
  /* ---------------- BULK UPLOAD ---------------- */

  const handleBulkUpload = async () => {
    if (!file) {
      toast.error(t("candidateWorkflow:please_upload_xlsx_file"));
      return;
    }

    try {
      setLoading(true);
      setValidationErrors([]);

      const res = await jobPositionApiService.uploadRanksExcel(file);

      if (res?.success === true) {
        toast.success(
          res?.message ||
          t("candidateWorkflow:rank_list_uploaded_successfully")
        );

        if (typeof onUploadSuccess === "function") {
          await onUploadSuccess();
        }

        closeModal();
        setSelectedIds([]);
      } else {
        toast.error(
          res?.message ||
          t("common:validation_failed")
        );

        const errors = Array.isArray(res?.data)
          ? res.data
          : [];

        setValidationErrors(errors);
      }
    } catch (err) {
      console.error("UPLOAD ERROR =>", err);

      const errorData = err?.response?.data;

      toast.error(
        errorData?.message ||
        err?.message ||
        t("candidateWorkflow:upload_failed")
      );

      const errors = Array.isArray(errorData?.data)
        ? errorData.data
        : [];

      setValidationErrors(errors);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- CLOSE ---------------- */

  const closeModal = () => {
    setShowRankListModal(false);
    setFile(null);
    setValidationErrors([]);
  };

  return (
    <Modal
      show={showRankListModal}
      onHide={closeModal}
      centered
      backdrop="static"
    >
      <Modal.Header closeButton className="modalhead">
        <div className="d-grid">
          <h5 className="mb-1 blue-color fs-15">
            {" "}
            {t("candidateWorkflow:upload_assigned_list")}
          </h5>
          <p className="text-muted fs-14 mb-0">
            {t("candidateWorkflow:upload_assigned_list_for_selected_position")}
          </p>
        </div>
      </Modal.Header>

      <Modal.Body>
        <div
          className="text-center px-3 pt-3 pb-2 rounded"
          style={{ backgroundColor: "#FFF1E8" }}
        >
          <img src={fileIcon} width={60} className="mb-2" alt="file" />
          <p className="mb-1 fw-600 fs-15">
            {t("candidateWorkflow:upload_file")}
          </p>
          <small className="text-muted fs-13">
            {t("candidateWorkflow:support_xlsx_format")}
          </small>

          <div className="d-grid justify-content-center gap-2 mt-3">
            <button
              className="btn orange-bg text-white fs-13 rounded shadow px-3"
              onClick={() => fileInputRef.current.click()}
            >
              {t("candidateWorkflow:upload_xlsx")}
            </button>
          </div>

          {file && (
            <div className="form-control blue-border mt-4 d-flex align-items-center justify-content-between p-3">
              <input
                type="text"
                className="fs-13 border-0 w-100"
                value={file.name}
                readOnly
              />
              <img
                src={deleteIcon}
                alt="Remove file"
                width={22}
                className="cursor-pointer"
                onClick={handleRemoveFile}
              />
            </div>
          )}

          {validationErrors.length > 0 && (
            <div className="mt-3">
              {validationErrors.map((err, idx) => (
                <p key={idx} className="text-danger fs-13 mb-1 text-center">
                  {err}
                </p>
              ))}
            </div>
          )}

          <div className="d-flex justify-content-center gap-1 mt-4">
            <small className="text-muted fs-12">
              {t("candidateWorkflow:download_template")}:
            </small>
            <span
              className="blue-color fw-500 cursor-pointer fs-14"
              onClick={handleDownloadTemplate}
            >
              XLSX
            </span>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx"
          style={{ display: "none" }}
          onChange={handleFileSelect}
        />

        {loading && <Loader />}
      </Modal.Body>

      <Modal.Footer className="modalfoot">
        <button
          className="btn btn-light-grey shadow border fs-13 px-3"
          onClick={closeModal}
        >
          {t("common:cancel")}
        </button>

        <button
          className="btn orange-bg text-white shadow fs-13 px-4"
          onClick={handleBulkUpload}
          disabled={!file}
        >
          {t("candidateWorkflow:import")}
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default RankListModal;

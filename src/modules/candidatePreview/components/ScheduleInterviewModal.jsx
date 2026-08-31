import React from "react";
import { Modal } from "react-bootstrap";
import fileIcon from "../../../assets/upload-filled-file.png";
import deleteIcon from "../../../assets/delete_icon.png";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import jobPositionApiService from "../../jobPosting/services/jobPositionApiService";
import Loader from "../../../shared/components/Loader";

const ScheduleInterviewModal = ({
  showScheduleModal,
  setShowScheduleModal,
  applicationIds,
  positionId,
  onBulkScheduleSuccess,
}) => {
  const { t } = useTranslation(["candidateWorkflow", "common"]);
  const [loading, setLoading] = React.useState(false);
  const fileInputRef = React.useRef(null);
  const [file, setFile] = React.useState(null);
  const [validationErrors, setValidationErrors] = React.useState([]);

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

  const handleDownloadTemplate = async () => {
    try {
      setLoading(true);
      const res =
        await jobPositionApiService.downloadInterviewScheduleTemplate(
          positionId
        );

      const blob = new Blob([res.data], {
        type:
          res.headers["content-type"] ||
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "Interview_Schedule_Template.xlsx";
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success(t("candidateWorkflow:template_downloaded_successfully"));
    } catch (err) {
      console.error(err);
      toast.error(t("candidateWorkflow:failed_to_download_template"));
    } finally {
      setLoading(false);
    }
  };

  const handleBulkUpload = async () => {
    if (!file) {
      toast.error(t("candidateWorkflow:please_upload_xlsx_file"));
      return;
    }

    if (!applicationIds?.length) {
      toast.error(t("candidateWorkflow:no_candidates_selected"));
      return;
    }

    try {
      setLoading(true);
      const res = await jobPositionApiService.bulkScheduleInterviews({
        file,
        applicationIds,
        positionId,
      });

      if (res.success === true) {
        if (typeof onBulkScheduleSuccess === "function") {
          onBulkScheduleSuccess();
        }
        setShowScheduleModal(false);
        setFile(null);
        setValidationErrors([]);
        toast.success(
          res.message ||
            t("candidateWorkflow:interviews_scheduled_successfully")
        );
      } else {
        const apiErrors =
          res?.data && Array.isArray(res.data)
            ? res.data
            : [
                res?.data.map((row) => row) ||
                  t("candidateWorkflow:bulk_scheduling_failed"),
              ];
        setValidationErrors(apiErrors);
        toast.error(res.message || t("common:validation_failed"));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setValidationErrors([]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const closeModal = () => {
    setShowScheduleModal(false);
    setFile(null);
    setValidationErrors([]);
  };

  return (
    <div>
      <Modal
        show={showScheduleModal}
        onHide={() => {
          setShowScheduleModal(false);
          setFile(null);
          closeModal();
        }}
        centered
        backdrop="static"
      >
        <Modal.Header
          className="d-flex justify-content-between modalhead"
          closeButton
        >
          <div className="d-grid">
            <h5 className="mb-1 blue-color fs-15">
              {t("common:schedule_interviews")}
            </h5>
            <p className="text-muted fs-14 mb-0">
              {t("candidateWorkflow:schedule_interview_selected_candidates")}
            </p>
          </div>
          
        </Modal.Header>

        <Modal.Body>

          {/* Upload box */}
          <div
            className="text-center px-3 pt-3 pb-2 rounded"
            style={{ backgroundColor: "#FFF1E8" }}
          >
            <img alt="file" src={fileIcon} width={60} className="mb-2" />
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
              <div className="form-control blue-border mt-1 d-flex align-items-center gap-2 p-3 justify-content-between mt-4">
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
              <div className="mt-2 text-start">
                {validationErrors.map((errMsg, index) => (
                  <p key={index} className="text-danger fs-13 mb-1 text-center">
                    {errMsg}
                  </p>
                ))}
              </div>
            )}

            <div className="d-flex align-items-center gap-1 justify-content-center mt-4">
              <small className="d-block text-muted d-flex justify-content-center gap-1 fs-12">
                {t("candidateWorkflow:download_template")}:
              </small>
              <p className="blue-color cursor-pointer mb-0 fs-15 fw-500">
                {/* <b>CSV</b> | */}
                <p
                  className="blue-color fw-500 mb-0"
                  onClick={handleDownloadTemplate}
                >
                  XLSX
                </p>
              </p>
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
            {t("common:import")}
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ScheduleInterviewModal;

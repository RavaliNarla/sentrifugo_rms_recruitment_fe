import React from "react";
import { Modal, Spinner } from "react-bootstrap";
import { useTranslation } from "react-i18next";

const PdfViewerModal = ({ show, onHide, fileUrl, loading, title }) => {
  const { t } = useTranslation(["candidateWorkflow"]);
  const getFileExtension = (url = "") => {
    const cleanUrl = url.split("?")[0]; // remove query params
    return cleanUrl.split(".").pop()?.toLowerCase();
  };

  const extension = React.useMemo(() => {
    if (!fileUrl) return null;
    return getFileExtension(fileUrl);
  }, [fileUrl]);

  const isPdf = extension === "pdf";
  const isDoc = extension === "doc" || extension === "docx";

  React.useEffect(() => {
    if (show && isDoc && fileUrl) {
      window.open(fileUrl, "_blank"); // triggers download
    }
  }, [show, isDoc, fileUrl]);

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="xl"
      centered
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header closeButton>
        <Modal.Title className="blue-color" style={{ fontSize: "1rem" }}>
          {title}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ height: "80vh", padding: 0 }}>
        {loading ? (
          <div className="d-flex justify-content-center align-items-center h-100">
            <Spinner animation="border" />
          </div>
        ) : isPdf ? (
          <iframe
            src={`${fileUrl}#toolbar=0&navpanes=0`}
            title="PDF Viewer"
            width="100%"
            height="100%"
            style={{ border: "none" }}
          />
        ) : isDoc ? (
          <div className="d-flex flex-column justify-content-center align-items-center h-100 text-center px-4">
            <h6 className="mb-2">
              {t("candidateWorkflow:preview_not_available")}
            </h6>
            <p className="text-muted fs-14 mb-0">
              {t("candidateWorkflow:doc_preview_line1")}
              <br />
              {t("candidateWorkflow:doc_preview_line2")}
            </p>
          </div>
        ) : (
          <div className="text-center mt-5">
            {t("candidateWorkflow:unsupported_file_format")}
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default PdfViewerModal;

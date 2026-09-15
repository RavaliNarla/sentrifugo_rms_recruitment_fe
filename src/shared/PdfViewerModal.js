import React, { useEffect } from "react";
import { Modal, Spinner } from "react-bootstrap";

const PdfViewerModal = ({ show, onHide, fileUrl, loading, title = "Document Preview", fileExtension }) => {
  const extension = (fileExtension || "").toLowerCase().replace(/^\./, "");
  const isPdf = extension === "pdf";
  const isImage = ["png", "jpg", "jpeg", "gif", "webp"].includes(extension);
  const isDoc = extension === "doc" || extension === "docx";

  useEffect(() => {
    if (show && isDoc && fileUrl) {
      window.open(fileUrl, "_blank");
    }
  }, [show, isDoc, fileUrl]);

  return (
    <Modal show={show} onHide={onHide} size="xl" centered backdrop="static" keyboard={false}>
      <Modal.Header closeButton>
        <Modal.Title className="text-app-primary" style={{ fontSize: "1rem" }}>
          {title}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ height: "80vh", padding: 0 }}>
        {loading ? (
          <div className="d-flex justify-content-center align-items-center h-100">
            <Spinner animation="border" />
          </div>
        ) : isPdf && fileUrl ? (
          <iframe
            src={`${fileUrl}#toolbar=0&navpanes=0`}
            title="PDF Viewer"
            width="100%"
            height="100%"
            style={{ border: "none" }}
          />
        ) : isImage && fileUrl ? (
          <div className="d-flex justify-content-center align-items-center h-100 p-3">
            <img src={fileUrl} alt={title} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
          </div>
        ) : isDoc ? (
          <div className="d-flex flex-column justify-content-center align-items-center h-100 text-center px-4">
            <h6 className="mb-2">Preview not available</h6>
            <p className="text-muted fs-14 mb-0">
              Word documents cannot be previewed in the browser.
              <br />
              The file has been opened in a new tab for download.
            </p>
          </div>
        ) : (
          <div className="text-center mt-5 text-muted">Unsupported file format</div>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default PdfViewerModal;

import React, { useEffect, useRef } from "react";
import { Modal, Spinner } from "react-bootstrap";

const PdfViewerModal = ({ show, onHide, fileUrl, loading, title = "Document Preview", fileExtension }) => {
  const extension = (fileExtension || "").toLowerCase().replace(/^\./, "");
  const isPdf = extension === "pdf";
  const isImage = ["png", "jpg", "jpeg", "gif", "webp"].includes(extension);
  const isDoc = extension === "doc" || extension === "docx";
  const pdfFrameRef = useRef(null);

  useEffect(() => {
    if (show && isDoc && fileUrl) {
      window.open(fileUrl, "_blank");
    }
  }, [show, isDoc, fileUrl]);

  // The browser PDF toolbar is hidden (#toolbar=0) and Chrome/Edge honour that while Firefox
  // doesn't - so Print is our own button, the same in every browser. The PDF is a same-origin
  // blob URL, so the viewer frame can be asked to print directly.
  const handlePrint = () => {
    try {
      const frameWindow = pdfFrameRef.current?.contentWindow;
      frameWindow.focus();
      frameWindow.print();
    } catch {
      // Fallback: open the PDF in a new tab, where the browser's own Print is available.
      window.open(fileUrl, "_blank");
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" centered backdrop="static" keyboard={false}>
      <Modal.Header closeButton>
        <Modal.Title className="text-app-primary" style={{ fontSize: "1rem" }}>
          {title}
        </Modal.Title>
        {isPdf && fileUrl && !loading && (
          <button type="button" className="btn btn-outline-primary btn-sm ms-auto me-3" onClick={handlePrint} title="Print">
            <i className="bi bi-printer me-1" />Print
          </button>
        )}
      </Modal.Header>

      <Modal.Body style={{ height: "80vh", padding: 0 }}>
        {loading ? (
          <div className="d-flex justify-content-center align-items-center h-100">
            <Spinner animation="border" />
          </div>
        ) : isPdf && fileUrl ? (
          <iframe
            ref={pdfFrameRef}
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

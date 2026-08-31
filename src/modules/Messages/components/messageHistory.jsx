import React from "react";
import { useTranslation } from "react-i18next";
import "../../../style/css/MessageCard.css";
import attachment from "../../../assets/attachment.png";
import masterApiService from "../../master/services/masterApiService.js";
import { Modal } from "react-bootstrap";
import { FaExternalLinkAlt } from "react-icons/fa";
const MessageHistory = ({ item }) => {
  const { t } = useTranslation(["messages", "common"]);
  const [previewUrl, setPreviewUrl] = React.useState(null);
  const [showPreview, setShowPreview] = React.useState(false);
  const handleClose = () => {
    setShowPreview(false);
    setPreviewUrl(null);
  };
  const handleViewFile = async (path) => {
    try {
      const encodedPath = encodeURIComponent(path);
      const res =
        await masterApiService.getMessagesAzureBlobSasUrl(encodedPath);
      const fileUrl = res;
      if (fileUrl) {
        setPreviewUrl(fileUrl);
        setShowPreview(true);
      }
    } catch (err) {
      console.error("File open error", err);
    }
  };

  const getColorByTitle = (title) => {
    const text = title?.toLowerCase() || "";
    if (text.includes("candidate")) {
      return "#42579f";
    }
    if (text.includes("recruiter")) {
      return "#f26522";
    }
    if (text.includes("approver") || text.includes("approval")) {
      return "#28a745";
    }
    if (text.includes("approved")) {
      return "#198754";
    }
    if (text.includes("rejected")) {
      return "#dc3545";
    }
    return "#6c757d";
  };
  return (
    <div className="msg-history">
      <div className="msg-history-title">{t("messages:request_history")}</div>
      {item.history?.map((hist, index) => {
        const color = getColorByTitle(hist.title);
        return (
          <React.Fragment key={index}>
            <div className="msg-history-item">
              <div
                className="msg-icon"
                style={{
                  backgroundColor: color,
                  color: "#fff",
                }}
              >
                {hist.title?.charAt(0)?.toUpperCase() || "?"}
              </div>
              <div className="flex-grow-1">
                <div className="msg-history-head" style={{ color }}>
                  {hist.title}
                </div>
                <div className="msg-history-text">
                  <b>{t("messages:comment")}:</b> {hist.comment}
                </div>
                <div className="msg-history-time">
                  {hist.approvalDate || hist.time}
                </div>
              </div>
              {hist.attachmentPath && (
                <img
                  src={attachment}
                  width={50}
                  height={50}
                  alt="attachment"
                  style={{ cursor: "pointer" }}
                  onClick={() => handleViewFile(hist.attachmentPath)}
                />
              )}
            </div>
            {index !== item.history.length - 1 && (
              <div className="msg-divider"></div>
            )}
          </React.Fragment>
        );
      })}
      <Modal show={showPreview} onHide={handleClose} size="xl" centered>
        {/* HEADER */}
        <Modal.Header closeButton className="border-0 pb-2">
          <div className="w-100 d-flex justify-content-between align-items-center">
            <div>
              <h6 className="mb-0 fw-semibold">{t("messages:file")}</h6>
            </div>
            <div
              className="d-flex gap-4 align-items-center"
              style={{ paddingRight: "15px" }}
            >
              {previewUrl && (
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-outline-primary"
                >
                  <FaExternalLinkAlt />
                </a>
              )}
            </div>
          </div>
        </Modal.Header>
        <Modal.Body
          style={{
            height: "85vh",
            background: "#f8f9fa",
            padding: "10px",
            borderRadius: "10px",
          }}
        >
          {previewUrl ? (
            <iframe
              src={previewUrl}
              width="100%"
              height="100%"
              title="PDF Preview"
              style={{
                border: "none",
                borderRadius: "8px",
                background: "#fff",
              }}
            />
          ) : (
            <div className="d-flex justify-content-center align-items-center h-100 text-muted">
              {t("messages:no_preview_available")}
            </div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};
export default MessageHistory;

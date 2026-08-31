import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import "../../../style/css/PreviewModal.css";
import masterApiService from "../../master/services/masterApiService";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

const DocumentViewerModal = ({
  show,
  onHide,
  document,
  onVerify,
  onReject,
  isZonalAbsent,
  isFromCompensationPool,
}) => {
  const { t } = useTranslation(["preview", "common", "validation"]);

  const [comment, setComment] = useState("");
  const [sasUrl, setSasUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ================= USER ROLE ================= */

  const privileges = useSelector((state) => state.user.privileges);

  const isZonalHr = privileges?.Verification;
  const isInterviewer = privileges?.Interview;
  const canCandidatePool = privileges?.["Candidate Pool"];

  const disableActions =
    isFromCompensationPool ||
    (!canCandidatePool && (isInterviewer || (isZonalHr && isZonalAbsent)));

  /* ================= FETCH SAS URL ================= */

  useEffect(() => {
    if (!show || !document?.fileUrl) return;

    let cancelled = false;

    const fetchSasUrl = async () => {
      try {
        setLoading(true);
        setSasUrl(null);

        const res = await masterApiService.getAzureBlobSasUrl(
          document.fileUrl,
          "candidate"
        );

        if (!cancelled) setSasUrl(res.trim());
      } catch (err) {
        console.error("Failed to fetch SAS URL", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchSasUrl();

    return () => {
      cancelled = true;
    };
  }, [show, document]);

  /* ================= RESET PER DOCUMENT ================= */

  useEffect(() => {
    if (show && document) {
      // ✅ If already VERIFIED → do not preload comment
      if (document.status === "VERIFIED") {
        setComment("");
      } else {
        setComment(document.docScreeningComments || "");
      }

      setError("");
    } else {
      setComment("");
      setError("");
      setSasUrl(null);
    }
  }, [show, document]);

  /* ================= FILE TYPE ================= */

  const getFileType = (url) => {
    if (!url) return "";
    return url.split("?")[0].split(".").pop().toLowerCase();
  };

  const fileType = getFileType(sasUrl);

  if (!document) return null;

  /* ================= ACTION HANDLERS ================= */

  const handleRejectClick = () => {
    if (disableActions) return;

    if (!comment.trim()) {
      setError("required");
      return;
    }

    setError("");
    onReject(comment.trim());
  };

  const handleVerifyClick = () => {
    if (disableActions) return;
    setError("");
    onVerify(comment.trim());
  };

  /* ================= UI ================= */

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="xl"
      centered
      backdrop="static"
      keyboard={false}
      dialogClassName="doc-viewer-dialog"
    >
      <div className="doc-viewer-container">
        {/* ===== HEADER ===== */}
        <div className="doc-viewer-header">
          <span className="doc-viewer-title">{document.name}</span>
          <button className="doc-viewer-close" onClick={onHide}>
            ×
          </button>
        </div>

        {/* ===== CONTENT ===== */}
        <div className="doc-viewer-content">
          {loading && (
            <div className="text-center">{t("loading_document")}</div>
          )}

          {!loading && sasUrl && (
            <>
              {["png", "jpg", "jpeg"].includes(fileType) && (
                <img
                  src={sasUrl}
                  alt={document.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              )}

              {fileType === "pdf" && (
                <iframe
                  src={`${sasUrl}#toolbar=0`}
                  title={document.name}
                  className="doc-pdf-frame"
                />
              )}

              {["doc", "docx"].includes(fileType) && (
                <div className="text-center p-4">
                  <p>{t("cannot_preview")}</p>
                  <a
                    href={sasUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                  >
                    {t("download_file")}
                  </a>
                </div>
              )}
            </>
          )}
        </div>

        {/* ===== FOOTER ===== */}
        <div className="doc-viewer-footer">
          {/* one-line row */}
          <div className="d-flex align-items-center gap-3 w-100">
            {/* comment box same height as buttons */}
            <div style={{ flex: 1 }}>
              <textarea
                placeholder={t("enter_comments")}
                rows={1}
                value={comment}
                disabled={disableActions}
                className={`doc-comment-input one-line ${error ? "input-error" : ""}`}
                onChange={(e) => {
                  setComment(e.target.value);
                  setError("");
                }}
              />

              {error && (
                <div className="field-error-text">
                  {t("validation:required")}
                </div>
              )}
            </div>

            {/* buttons */}
            <div className="doc-viewer-actions d-flex gap-2 ">
              <button
                className="btn-reject"
                onClick={handleRejectClick}
                disabled={disableActions}
                style={{
                  opacity: disableActions ? 0.5 : 1,
                  cursor: disableActions ? "not-allowed" : "pointer",
                }}
              >
                {t("REJECTED")}
              </button>

              <button
                className="btn-verify"
                onClick={handleVerifyClick}
                disabled={disableActions}
                style={{
                  opacity: disableActions ? 0.5 : 1,
                  cursor: disableActions ? "not-allowed" : "pointer",
                }}
              >
                {t("VERIFIED")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default DocumentViewerModal;

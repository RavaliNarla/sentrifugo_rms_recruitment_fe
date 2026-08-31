import React, { useEffect, useState } from "react";
import { Modal, Button, Spinner } from "react-bootstrap";
import jobPositionApiService from "../../jobPosting/services/jobPositionApiService";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const CommentsModal = ({ show, onClose, applicationId }) => {
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation(["preview", "common", "validation"]);

  useEffect(() => {
    if (!show || !applicationId) return;

    fetchComments();
  }, [show, applicationId]);

  const fetchComments = async () => {
    try {
      setLoading(true);

      const res =
        await jobPositionApiService.getScreeningComments(applicationId);

      setComments(res?.data?.comments || []);
    } catch (err) {
      console.error("Failed to fetch comments", err);
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    const trimmedComment = newComment.trim();

    // REQUIRED VALIDATION
    if (!trimmedComment) {
     toast.error(t("comment_required"));

      return;
    }

    // MAX LENGTH VALIDATION
    if (trimmedComment.length > 2000) {
toast.error(t("comment_max_length"));
      return;
    }

    try {
      await jobPositionApiService.postScreeningComment(applicationId, {
        commentText: trimmedComment,
      });
      setNewComment("");
      await fetchComments();
    } catch (err) {
      console.error("Failed to post comment", err);
toast.error(t("failed_post_comment"));
    }
  };

  const formatRole = (role) => {
    if (!role) return "-";

    return role
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <Modal show={show} onHide={onClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title
          style={{
            fontSize: "1rem",
            color: "#2f3a8f",
          }}
        >
          {t("comments")}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body
        style={{
          maxHeight: "400px",
          overflowY: "auto",
        }}
      >
        {loading ? (
          <div className="text-center py-4">
            <Spinner animation="border" size="sm" />
          </div>
        ) : comments.length === 0 ? (
          <div
            className="text-center py-3"
            style={{
              color: "#777",
              fontSize: "0.875rem",
            }}
          >
{t("no_comments_found")}          </div>
        ) : (
          <div className="d-flex flex-column gap-3 mb-3">
            {comments.map((c) => {
              const isCandidate = c.userRole?.toUpperCase() === "CANDIDATE";

              return (
                <div
                  key={c.id}
                  className={`d-flex ${
                    isCandidate
                      ? "justify-content-start"
                      : "justify-content-end"
                  }`}
                >
                  <div
                    style={{
                      maxWidth: "75%",
                      padding: "10px 14px",
                      borderRadius: "16px",
                      background: isCandidate ? "#f1f1f1" : "#dbeafe",
                      border: "1px solid #e5e7eb",
                    }}
                  >
                    {/* ROLE */}
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: "0.875rem",
                        color: "#2f3a8f",
                        marginBottom: "4px",
                      }}
                    >
                      {formatRole(c.userRole)}
                    </div>

                    {/* MESSAGE */}
                    <div
                      style={{
                        fontSize: "0.92rem",
                        color: "#222",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                      }}
                    >
                      {c.commentText}
                    </div>

                    {/* TIME */}
                    <div
                      style={{
                        fontSize: "0.72rem",
                        color: "#777",
                        marginTop: "6px",
                        textAlign: "right",
                      }}
                    >
                      {new Date(c.createdDate)
                        .toLocaleString("en-GB", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          hour12: true,
                        })
                        .replace(/\//g, "/")}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <textarea
          className="form-control"
          rows={3}
  placeholder={t("enter_your_comment")}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <div
          style={{
            textAlign: "right",
            fontSize: "0.75rem",
            color: "#777",
            marginTop: "4px",
          }}
        >
          {newComment.length}/2000
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button
          variant="btn"
          onClick={onClose}
          style={{
            fontSize: "0.875rem",
            border: "1px solid #333",
            color: "#333",
          }}
        >
            {t("close")}
        </Button>

        <Button
          variant="btn primary"
          onClick={handleAddComment}
          style={{
            fontSize: "0.875rem",
            backgroundColor: "#f47c2c",
            color: "#fff",
          }}
        >
        {t("send")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CommentsModal;

import React from "react";
import { Modal } from "react-bootstrap";
import { useTranslation } from "react-i18next";

export default function InterviewFeedbackHistoryModal({
  show,
  onHide,
  feedbackList = [],
  loading,
}) {
  const { t } = useTranslation(["candidateWorkflow", "common"]);

  return (
    <Modal show={show} onHide={onHide} centered size="lg" backdrop="static">
      <Modal.Header closeButton className="modalhead">
        <Modal.Title className="fs-15 fw-normal">
          {t("candidateWorkflow:interviewer_feedback_history")}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="padding-20">
        <table className="table mb-0">
          <thead>
            <tr>
              <th className="text-white fs-14 fw-normal blue-bg">
                {" "}
                {t("common:name")}
              </th>
              <th className="text-white fs-14 fw-normal blue-bg">
                {" "}
                {t("common:comments")}
              </th>
              <th className="text-white fs-14 fw-normal blue-bg">
                {t("common:time")}
              </th>
              <th className="text-white fs-14 fw-normal blue-bg">
                {t("common:score")}
              </th>
            </tr>
          </thead>

          <tbody>
            {feedbackList.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-4 text-muted fs-14">
                  {t("candidateWorkflow:no_feedback_available")}
                </td>
              </tr>
            ) : (
              feedbackList.map((f, idx) => (
                <tr key={idx}>
                  <td className="fw-normal fs-14 mb-0">{f.name}</td>
                  <td className="fw-normal fs-14 mb-0">{f.comment}</td>
                  <td className="fw-normal fs-14 mb-0">{f.time}</td>
                  <td className="fw-normal fs-14 mb-0">{f.score}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Modal.Body>
    </Modal>
  );
}

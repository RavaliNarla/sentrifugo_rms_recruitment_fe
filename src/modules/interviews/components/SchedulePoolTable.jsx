import React, { useState } from "react";
import { Person, FileText } from "react-bootstrap-icons";

import { OverlayTrigger, Tooltip, Modal, Button } from "react-bootstrap";

import { useTranslation } from "react-i18next";
import { formatDateDDMMYYYY } from "../../../shared/utils/dateUtils";
import I_icon from "../../../assets/I_icon.png";

const SchedulePoolTable = ({
  rows,
  onEdit,
  onSubmitApproval,
  submitting = false,
  page,
  pageSize,
  totalElements,
  onPageChange,
  onPageSizeChange,
  onViewProfile,
  onViewResume,
  onOpenZonalComments,
  position = [],
}) => {
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedRemarks, setSelectedRemarks] = useState("");
  const getStatusBadge = (status = "") => {
    switch (status) {
      case "REJECTED":
        return "danger";

      case "L1_PENDING":
        return "yellowwarning";

      case "PENDING":
        return "yellowwarning";

      default:
        return "secondary";
    }
  };
  const getApprovalStatus = (row) =>
    row?.interviewScheduleStaging?.interviewSchedulingApprovalStatus ||
    row?.interviewSchedulingApprovalStatus ||
    row?.interviewStatus ||
    "";

  const getRemarks = (row) =>
    row?.interviewScheduleStaging?.remarks || row?.remarks || "";

  const { t } = useTranslation([
    "candidateWorkflow",
    "common",
    "interviewSchedule",
  ]);

  return (
    <div className="card-body p-0 interview-pool">
      {/* HEADER */}
      <div className="d-flex justify-content-end align-items-center px-3 py-3 border-bottom">
        <div className="d-flex gap-2 schddis">
          <button
            className="btn btn-primary fs-14"
            onClick={onSubmitApproval}
            disabled={
              rows.length === 0 ||
              !rows.some((row) => getApprovalStatus(row) === "PENDING")
            }
          >
            {t("candidateWorkflow:submit_for_approval")}
          </button>

          <button
            className="btn btn-primary fs-14"
            onClick={onEdit}
            disabled={rows.length === 0 || submitting}
          >
            {t("candidateWorkflow:edit_schedule")}
          </button>
        </div>
      </div>

      {/* TABLE */}
      <table className="table table-hover mb-0">
        <thead className="bg-light">
          <tr>
            <th className="fs-14 fw-normal py-3 ps-4">
              {t("candidateWorkflow:candidate")}
            </th>

            <th className="fs-14 fw-normal py-3">{t("common:date")}</th>

            <th className="fs-14 fw-normal py-3">{t("common:time")}</th>

            <th className="fs-14 fw-normal py-3">
              {t("candidateWorkflow:zone")}
            </th>

            <th className="fs-14 fw-normal py-3">
              {t("candidateWorkflow:panel_details")}
            </th>

            <th className="fs-14 fw-normal py-3   ">
              {t("candidateWorkflow:interview_status")}
            </th>

            <th className="text-center fs-14 fw-normal py-3">
              {t("common:actions")}
            </th>
          </tr>
        </thead>

        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan="8" className="text-center py-4 text-muted fs-14">
               {t("candidateWorkflow:no_candidates_found_schedule")}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.id}>
                {/* Candidate */}
                <td className="align-content-center ps-4">
                  <p className="fw-normal fs-14 mb-0">{row.name}</p>

                  <p className="text-muted fs-12 mb-0">
                   {t("candidateWorkflow:application_number")}: {row.regNo}
                  </p>
                  <p className="text-muted fs-12 mb-0">
               {t("candidateWorkflow:position")}:{" "}
                    {position?.find((p) => p.positionId === row.positionId)
                      ?.positionName || "-"}
                  </p>
                </td>
                {/* Date */}
                <td className="fs-14 align-content-center">
                  {formatDateDDMMYYYY(row.date)}
                </td>

                {/* Time */}
                <td className="fs-14 align-content-center">{row.time}</td>

                {/* Zone */}
                <td className="fs-14 align-content-center">{row.zone}</td>

                {/* Panel */}
                <td className="fs-14 align-content-center">{row.panel}</td>

                {/* Interview Status */}
                <td className="align-content-center schstatus">
                  <span
                    className={`status-badge ${getStatusBadge(
                      getApprovalStatus(row)
                    )}`}
                  >
                    {getApprovalStatus(row)
                      ?.toLowerCase()
                      ?.replaceAll("_", " ")
                      ?.replace(/\b\w/g, (char) => char.toUpperCase())}
                  </span>

                  {getApprovalStatus(row) === "REJECTED" && (
                    <OverlayTrigger
                      placement="bottom"
                      overlay={
                        <Tooltip id={`tooltip-remarks-${row.id}`}>
                          {t("candidateWorkflow:view_rejection_remarks")}
                        </Tooltip>
                      }
                    >
                      <span>
                        <img
                          className="ms-2"
                          src={I_icon}
                          alt="View remarks"
                          style={{
                            width: "16px",
                            height: "16px",
                            cursor: "pointer",
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRemarks(getRemarks(row));
                            setShowCommentModal(true);
                          }}
                        />
                      </span>
                    </OverlayTrigger>
                  )}
                </td>

                {/* Actions */}
                <td className="text-center align-content-center">
                  <OverlayTrigger
                    placement="bottom"
                    overlay={<Tooltip>{t("candidateWorkflow:view_profile")}</Tooltip>}
                  >
                    <Person
                     size={16}
                      className="me-3 cursor-pointer"
                      onClick={() => onViewProfile?.(row)}
                    />
                  </OverlayTrigger>

                  <OverlayTrigger
                    placement="bottom"
                    overlay={<Tooltip>{t("candidateWorkflow:view_resume")}</Tooltip>}
                  >
                    <FileText
                     size={16}
                      className="cursor-pointer"
                      onClick={() => onViewResume?.(row)}
                    />
                  </OverlayTrigger>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* FOOTER */}
      <div className="d-flex justify-content-between align-items-center px-3 py-3 border-top">
        <div className="fs-14 text-muted">
         {t("candidateWorkflow:showing")}{rows.length === 0 ? 0 : page * pageSize + 1}–
          {Math.min((page + 1) * pageSize, totalElements)} {t("candidateWorkflow:of")}   {totalElements}
        </div>

        <div className="d-flex align-items-center gap-2">
          <select
            className="form-select fs-14"
            style={{ width: "90px" }}
            value={pageSize}
            onChange={(e) => {
              onPageSizeChange(Number(e.target.value));

              onPageChange(0);
            }}
          >
            {[10, 20, 50].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <button
            className="btn btn-sm btn-outline-secondary"
            disabled={page === 0}
            onClick={() => onPageChange(page - 1)}
          >
           {t("candidateWorkflow:prev")}
          </button>

          <button
            className="btn btn-sm btn-outline-secondary"
            disabled={(page + 1) * pageSize >= totalElements}
            onClick={() => onPageChange(page + 1)}
          >
          {t("candidateWorkflow:next")}
          </button>
        </div>
      </div>
      <Modal
        show={showCommentModal}
        onHide={() => setShowCommentModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title> {t("candidateWorkflow:rejection_remarks")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-0">
            {selectedRemarks || t("candidateWorkflow:no_remarks_available")}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowCommentModal(false)}
          >
          {t("candidateWorkflow:close")}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SchedulePoolTable;

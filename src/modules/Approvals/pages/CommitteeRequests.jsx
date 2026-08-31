import React, { useEffect, useState } from "react";
import { Container, Row, Col, Form, Button, Badge } from "react-bootstrap";
import { Search } from "react-bootstrap-icons";
import { useSelector } from "react-redux";
import "../../../style/css/ApprovalCommitee.css";
import history_icon from "../../../assets/history_icon.png";
import { formatDateDDMMYYYY } from "../../../shared/utils/dateUtils";

import ApprovalCommentModal from "../components/ApprovalCommentModal";
import ApprovalHistoryModal from "../components/ApprovalHistoryModal";
import { useTranslation } from "react-i18next";
import Select from "react-select";

import { toast } from "react-toastify";
import useCommitteeRequests from "../hooks/useCommitteeRequests";

//  Utilities
import { validateSelectedRequisitions } from "../validations/requisitionValidation";

//  Mapper

const CommitteeRequests = () => {
  const { t } = useTranslation([
    "jobPostingsList",
    "common",
    "approvalHistory",
  ]);
  const privileges = useSelector((state) => state.user.privileges);

  const isL1 = privileges?.["L1 Approval"];
  const isL2 = privileges?.["L2 Approval"];

  const approvalLevel = isL2 ? "L2" : isL1 ? "L1" : null;
  const {
    requisitionOptions,
    positionOptions,
    panelData,
    loadingRequisitions,
    loadingPositions,
    loadingPanels,
    fetchRequisitions,
    fetchPositions,
    fetchPanels,
    clearPanels,
    setPositionOptions,
    approvePanels,
    rejectPanels,
    fetchApprovalHistory,
  } = useCommitteeRequests();
  const [pageSize, setPageSize] = useState(5);

  const [showCommentModal, setShowCommentModal] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyData, setHistoryData] = useState([]);

  // Filters
  const [status, setStatus] = useState("ALL");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(0);

  const [selectedReqIds, setSelectedReqIds] = useState(new Set());

  // Requisition & Position state
  const [selectedRequisition, setSelectedRequisition] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState(null);

  const statusOptionsByApproval = {
    L1: [
      { value: "L1_PENDING", label: t("jobPostingsList:status_l1_pending") },
      { value: "L2_PENDING", label: t("jobPostingsList:status_l2_pending") },
      { value: "L1_REJECTED", label: t("jobPostingsList:status_l1_rejected") },
      { value: "L2_REJECTED", label: t("jobPostingsList:status_l2_rejected") },
      { value: "APPROVED", label: t("jobPostingsList:status_approved") },
    ],
    L2: [
      { value: "L2_PENDING", label: t("jobPostingsList:status_l2_pending") },
      { value: "L2_REJECTED", label: t("jobPostingsList:status_l2_rejected") },
      { value: "APPROVED", label: t("jobPostingsList:status_approved") },
    ],
  };
  const selectableStatus =
    approvalLevel === "L1"
      ? "L1_PENDING"
      : approvalLevel === "L2"
        ? "L2_PENDING"
        : null;

  const allowedStatuses = statusOptionsByApproval[approvalLevel] || [];

  const selectedRequisitionOption = selectedRequisition
    ? {
        label: `${selectedRequisition.requisitionCode}- ${selectedRequisition.requisitionTitle}`,
        value: selectedRequisition.id,
        raw: selectedRequisition,
      }
    : null;

  const selectedPositionOption = selectedPosition
    ? {
        label: selectedPosition.positionName,
        value: selectedPosition.id,
        raw: selectedPosition,
      }
    : null;
  const onRequisitionChange = async (req) => {
    setSelectedRequisition(req);
    setSelectedPosition(null);

    setPositionOptions([]);

    clearPanels();

    setSelectedReqIds(new Set());
    setSearchInput("");
    setPage(0);

    if (!req?.id) return;

    await fetchPositions(req.id);
  };
  const onPositionChange = async (pos) => {
    setSelectedPosition(pos);
    setPage(0);

    if (!pos?.positionId) {
      clearPanels();
      return;
    }

    await fetchPanels(pos.positionId);
  };

  const handleApprovalAction = async (modalComment) => {
    const ids = Array.from(selectedReqIds);

    if (ids.length === 0) return;

    const commentText = modalComment?.trim();

    if (!commentText) {
      toast.error("Comment is required");
      return;
    }

    let success = false;

    if (actionType === "approve") {
      success = await approvePanels(
        ids,
        commentText,
        selectedPosition?.positionId
      );
    } else {
      success = await rejectPanels(
        ids,
        commentText,
        selectedPosition?.positionId
      );
    }

    if (success) {
      setSelectedReqIds(new Set());

      setShowCommentModal(false);
    }
  };
  const getStatusBadge = (status = "") => {
    switch (status) {
      case "L1_PENDING":
        return "warning";

      case "L2_PENDING":
        return "info";

      case "APPROVED":
        return "success";

      case "L1_REJECTED":
      case "L2_REJECTED":
        return "danger";

      default:
        return "secondary";
    }
  };
  const handleOpenHistory = async (panelId) => {
    const history = await fetchApprovalHistory(panelId);

    setHistoryData(history);
    setShowHistoryModal(true);
  };
  useEffect(() => {
    fetchRequisitions();
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [status, searchInput, pageSize]);

  const allPanels = [
    ...panelData.interviewPanelList,
    ...panelData.screeningPanelList,
    ...panelData.compensationPanelList,
  ];

  const filteredPanels = allPanels.filter((panelItem) => {
    const panelName = panelItem.interviewPanel?.panelName?.toLowerCase() || "";
    const panelStatus = panelItem.positionPanelStatus;

    // role based allowed statuses
    const roleStatuses = allowedStatuses.map((s) => s.value);

    const roleMatch = roleStatuses.includes(panelStatus);

    const searchMatch = panelName.includes(searchInput.toLowerCase());

    const statusMatch = status === "ALL" || panelStatus === status;

    return roleMatch && searchMatch && statusMatch;
  });
  const totalPages = Math.ceil(filteredPanels.length / pageSize);

  const paginatedPanels = filteredPanels.slice(
    page * pageSize,
    page * pageSize + pageSize
  );

  const selectablePanels = filteredPanels.filter(
    (p) => p.positionPanelStatus === selectableStatus
  );

  const allSelected =
    selectablePanels.length > 0 &&
    selectablePanels.every((p) => selectedReqIds.has(p.positionPanelId));

  const getVisiblePages = (currentPage, totalPages) => {
    const windowSize = 3;

    let start = currentPage - 1;
    let end = currentPage + 2;

    if (start < 0) {
      start = 0;
      end = windowSize;
    }

    if (end > totalPages) {
      end = totalPages;
      start = Math.max(0, end - windowSize);
    }

    const pages = [];
    for (let i = start; i < end; i++) {
      pages.push(i);
    }

    return {
      pages,
      showStartEllipsis: start > 0,
      showEndEllipsis: end < totalPages,
    };
  };
  const formatStatusLabel = (status) => {
    if (!status) return "-";

    return status
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };
  const selectStyles = {
    control: (base) => ({
      ...base,
      height: "38px",
      minHeight: "38px", // 🔥 override default 38px
      fontSize: "14px",
    }),

    valueContainer: (base) => ({
      ...base,
      height: "38px",
      padding: "0 8px", // 🔥 remove vertical padding
    }),

    indicatorsContainer: (base) => ({
      ...base,
      height: "34px",
    }),

    input: (base) => ({
      ...base,
      margin: 0,
      padding: 0,
    }),

    singleValue: (base) => ({
      ...base,
      fontSize: "14px",
    }),

    placeholder: (base) => ({
      ...base,
      fontSize: "14px",
    }),

    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
    }),
  };

  return (
    <div className="committee-requests-page">
      <Container fluid className="committee-page">
        {/* ================= HEADER ================= */}
        <Row className="mb-3 align-items-center">
          <Col>
            <h5 className="page-title">
              {t("approvalHistory:committee_requests")}
            </h5>
            <p className="page-subtitle">
              {t(
                "approvalHistory:review_and_approve_or_reject_committee_requests"
              )}
            </p>
          </Col>
          <Col xs={12} md={4}>
            <div className="search-boxpost">
              <Search />
              <Form.Control
                type="text"
                placeholder={t("approvalHistory:search_by_panel_name")}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
          </Col>
        </Row>

        <Row className="mb-3 align-items-end filters-row">
          {/* Requisition */}
          <Col xs={12} md={4}>
            <div className="filter-label">
              {t("approvalHistory:requisition")}
            </div>
            <Select
              styles={selectStyles}
              classNamePrefix="react-select"
              menuPortalTarget={document.body}
              placeholder={t("approvalHistory:select_requisition")}
              options={requisitionOptions}
              isLoading={loadingRequisitions}
              value={selectedRequisitionOption}
              onChange={(opt) => {
                onRequisitionChange(opt?.raw || null);
                setPage(0);
              }}
            />
          </Col>

          {/* Position */}
          <Col xs={12} md={4}>
            <div className="filter-label">{t("approvalHistory:position")}</div>
            <Select
              styles={selectStyles}
              classNamePrefix="react-select"
              menuPortalTarget={document.body}
              placeholder={t("approvalHistory:select_position")}
              options={positionOptions}
              isLoading={loadingPositions}
              value={selectedPositionOption}
              isDisabled={!selectedRequisitionOption}
              onChange={(opt) => {
                onPositionChange(opt?.raw || null);
                setPage(0);
              }}
            />
          </Col>
          <Col xs={12} md={2} className="ms-auto">
            <Form.Select
              className="status-select"
              value={status}
              onChange={(e) => {
                const value = e.target.value || null;
                setStatus(value);
                setPage(0);
              }}
            >
              <option value="ALL">{t("jobPostingsList:status_all")}</option>

              {allowedStatuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </Form.Select>
          </Col>
        </Row>

        {/* ================= BULK ACTIONS ================= */}
        <Row className="bulk-actions align-items-center mt-3 mb-3">
          <Col xs={12} md={6} className="selectcheck">
            <Form.Check
              type="checkbox"
              id="select-all-requests"
              className="select-checkbox"
              label={t("approvalHistory:select_all")}
              checked={allSelected}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedReqIds(
                    new Set(selectablePanels.map((p) => p.positionPanelId))
                  );
                } else {
                  setSelectedReqIds(new Set());
                }
              }}
            />
          </Col>
          <Col xs={12} md={6} className="d-flex justify-content-end gap-2">
            <Button
              variant="outline-danger"
              className="px-4 reject-btn"
              disabled={selectedReqIds.size === 0}
              onClick={() => {
                const errors = validateSelectedRequisitions(selectedReqIds);

                if (errors.length > 0) {
                  errors.forEach((err) => toast.error(err));
                  return;
                }
                setActionType("reject");
                setShowCommentModal(true);
              }}
            >
              {t("approvalHistory:reject")}
            </Button>

            <Button
              variant="outline-success"
              className="px-4 approve-btn"
              disabled={selectedReqIds.size === 0}
              onClick={() => {
                const errors = validateSelectedRequisitions(selectedReqIds);

                if (errors.length > 0) {
                  errors.forEach((err) => toast.error(err));
                  return;
                }

                setActionType("approve");
                setShowCommentModal(true);
              }}
            >
              {t("approvalHistory:approve")}
            </Button>
          </Col>
        </Row>

        {loadingPanels ? (
          <div className="text-center my-4">
            {t("approvalHistory:loading_panels")}
          </div>
        ) : (
          <>
            {filteredPanels.length === 0 ? (
              <div className="text-center text-muted my-4">
                {t("approvalHistory:no_panels_found")}
              </div>
            ) : (
              paginatedPanels.map((panelItem) => {
                const panel =
                  panelItem.interviewPanel ||
                  panelItem.screeningPanel ||
                  panelItem.compensationPanel;
                const members = panel.panelMembers.map(
                  (m) => m.panelMember.name
                );

                return (
                  <div
                    key={panelItem.positionPanelId}
                    className="bulk-actions align-items-center mt-3 mb-1"
                  >
                    <Row className="align-items-center gx-2 d-flex">
                      {/* Checkbox */}
                      <Col xs="auto" className="checkbox-col pe-1 ms-2">
                        <Form.Check
                          type="checkbox"
                          className="select-checkbox"
                          checked={selectedReqIds.has(
                            panelItem.positionPanelId
                          )}
                          disabled={
                            panelItem.positionPanelStatus !== selectableStatus
                          }
                          onChange={(e) => {
                            setSelectedReqIds((prev) => {
                              const next = new Set(prev);

                              if (e.target.checked) {
                                next.add(panelItem.positionPanelId);
                              } else {
                                next.delete(panelItem.positionPanelId);
                              }

                              return next;
                            });
                          }}
                        />
                      </Col>

                      {/* Panel Name */}
                      <Col md={3} className="data-col">
                        <div className="field-label">
                          {t("approvalHistory:panel_name")}{" "}
                          <img
                            src={history_icon}
                            alt="History"
                            className="icon-history"
                            onClick={() =>
                              handleOpenHistory(panelItem.positionPanelId)
                            }
                          />
                        </div>
                        <div className="field-value">{panel.panelName}</div>
                      </Col>

                      {/* Panel Type */}
                      <Col md={2} className="data-col">
                        <div className="field-label">
                          {t("approvalHistory:panel_type")}
                        </div>
                        <div className="field-value">
                          {panel.committee?.committeeName}
                        </div>
                      </Col>

                      {/* Panel Members */}
                      <Col md={3} className="data-col">
                        <div className="field-label">
                          {t("approvalHistory:panel_members")}
                        </div>
                        <div className="field-value">{members.join(", ")}</div>
                      </Col>

                      {/* Start Date */}
                      <Col md={1} className="data-col">
                        <div className="field-label">
                          {t("approvalHistory:start_date")}
                        </div>
                        <div className="field-value">
                          {formatDateDDMMYYYY(panelItem.startDate)}
                        </div>
                      </Col>

                      {/* End Date */}
                      <Col md={1} className="data-col">
                        <div className="field-label">
                          {t("approvalHistory:end_date")}
                        </div>
                        <div className="field-value">
                          {formatDateDDMMYYYY(panelItem.endDate)}
                        </div>
                      </Col>

                      {/* Status */}
                      <Col className="d-flex align-items-center">
                        <Badge
                          bg={getStatusBadge(panelItem.positionPanelStatus)}
                          className="status-badge ms-auto"
                        >
                          {formatStatusLabel(panelItem.positionPanelStatus)}
                        </Badge>
                      </Col>
                    </Row>
                  </div>
                );
              })
            )}
            {totalPages > 1 && (
              <Row className="mt-4 mb-4">
                <Col className="d-flex justify-content-end align-items-center gap-3">
                  {/* Page size */}
                  <div className="d-flex align-items-center gap-2">
                    <span className="fw-semibold pagesize">Page Size:</span>
                    <Form.Select
                      size="sm"
                      style={{ width: "90px" }}
                      value={pageSize}
                      onChange={(e) => setPageSize(Number(e.target.value))}
                    >
                      {[5, 10, 15, 20].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </Form.Select>
                  </div>

                  {/* Pagination */}
                  <nav>
                    <ul className="pagination mb-0">
                      {/* Prev */}
                      <li
                        className={`page-item ${page === 0 ? "disabled" : ""}`}
                      >
                        <button
                          className="page-link"
                          onClick={() => setPage((p) => Math.max(p - 1, 0))}
                        >
                          &laquo;
                        </button>
                      </li>

                      {getVisiblePages(page, totalPages).pages.map((p) => (
                        <li
                          key={p}
                          className={`page-item ${page === p ? "active" : ""}`}
                        >
                          <button
                            className="page-link"
                            onClick={() => setPage(p)}
                          >
                            {p + 1}
                          </button>
                        </li>
                      ))}

                      {/* Next */}
                      <li
                        className={`page-item ${page >= totalPages - 1 ? "disabled" : ""}`}
                      >
                        <button
                          className="page-link"
                          onClick={() => setPage((p) => p + 1)}
                        >
                          &raquo;
                        </button>
                      </li>
                    </ul>
                  </nav>
                </Col>
              </Row>
            )}
          </>
        )}

        {/* Modals */}
        <ApprovalCommentModal
          show={showCommentModal}
          actionType={actionType}
          onClose={() => setShowCommentModal(false)}
          onConfirm={handleApprovalAction}
        />
        <ApprovalHistoryModal
          show={showHistoryModal}
          onClose={() => setShowHistoryModal(false)}
          historyData={historyData}
        />
      </Container>
    </div>
  );
};

export default CommitteeRequests;

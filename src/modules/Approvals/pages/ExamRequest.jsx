import React, { useEffect, useMemo, useState } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import Select from "react-select";
import useExamRequest from "../hooks/useExamRequest";
import "../../../style/css/ExamRequest.css";
import AddExaminationCutoffModal from "../../ExaminationCutoffConfiguration/components/AddExaminationCutoffModal";
import view_icon from "../../../assets/view_icon.png";
import ApprovalHistoryModal from "../../Approvals/components/ApprovalHistoryModal";
import { useTranslation } from "react-i18next";

const ExamRequest = () => {
  const {
    requisitionOptions,
    examConfigList,
    workflowHistory,
    users,

    loadingRequisitions,
    loadingExamConfigs,
    loadingWorkflowHistory,

    fetchRequisitions,
    fetchExamConfigList,
    fetchWorkflowHistory,
    fetchUsers,

    setExamConfigList,
    setWorkflowHistory,
  } = useExamRequest();

  const [showCutoffModal, setShowCutoffModal] = useState(false);
  const [decisionComments, setDecisionComments] = useState("");
  const [commentError, setCommentError] = useState("");
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const [cutoffEditData, setCutoffEditData] = useState(null);

  const [viewPosition, setViewPosition] = useState(null);
const { t } = useTranslation(["examRequest", "approvalHistory", "common"]);
  const getStatusBadge = (status = "") => {
    switch (status) {
      case "L1_PENDING":
        return "warning";

      case "L2_PENDING":
        return "info";

      case "APPROVED":
      case "FINALIZED":
        return "success";

      case "L1_REJECTED":
      case "L2_REJECTED":
        return "danger";

      default:
        return "secondary";
    }
  };
  const formatStatus = (status = "") => {
    return status
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const [selectedRequisition, setSelectedRequisition] = useState(null);

  useEffect(() => {
    fetchRequisitions();

    fetchUsers();
  }, [fetchRequisitions, fetchUsers]);

  const refreshExamConfigs = async () => {
    if (!selectedRequisition?.id) return;

    await fetchExamConfigList(selectedRequisition.id);
  };
  const handleHistoryClick = async (pos) => {
    const examConfigId = pos?.raw?.examConfigId;
    if (!examConfigId) return;

    await fetchWorkflowHistory(examConfigId);
    setShowHistoryModal(true);
  };

  const onRequisitionChange = async (req) => {
    setSelectedRequisition(req);

    setCutoffEditData(null);

    setViewPosition(null);

    if (!req?.id) {
      setExamConfigList([]);

      return;
    }

    await fetchExamConfigList(req.id);
  };

  const requisitionPositions = useMemo(() => {
    return examConfigList.map((item) => ({
      label:
        item.positionName ||
        item.masterPositions?.positionName ||
        item.positionId ||
        "-",
      value: item.positionId,
      raw: item,
    }));
  }, [examConfigList]);

  const userMap = useMemo(() => {
    return users.reduce((acc, user) => {
      acc[user.userId] = user.name;

      return acc;
    }, {});
  }, [users]);

  const handleViewClick = (pos) => {
    setViewPosition(pos);

    setCutoffEditData(pos.raw || null);

    setShowCutoffModal(true);
  };

  const selectedRequisitionOption = selectedRequisition
    ? {
        label: `${selectedRequisition.requisitionCode} - ${selectedRequisition.requisitionTitle}`,

        value: selectedRequisition.id,

        raw: selectedRequisition,
      }
    : null;

  const selectStyles = {
    control: (base) => ({
      ...base,

      height: "38px",

      minHeight: "38px",

      fontSize: "14px",
    }),

    valueContainer: (base) => ({
      ...base,

      height: "38px",

      padding: "0 8px",
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
    <div className="exam-request">
      <Container fluid className="exam-page">
        <Row className="mb-3 align-items-center">
          <Col>
            <h5 className="page-title">
              {t("examRequest:exam_requests_title")}
            </h5>

            <p className="page-subtitle">
             {t("examRequest:review_exam_requests")}
            </p>
          </Col>
        </Row>

        <Row className="mb-3 align-items-end filters-row border rounded p-3 bulk-actions">
          <Col xs={12} md={4}>
            <div className="field-label mb-2"> {t("approvalHistory:requisition")}</div>

            <Select
              placeholder={t("approvalHistory:select_requisition")}
              styles={selectStyles}
              classNamePrefix="react-select"
              menuPortalTarget={document.body}
              options={requisitionOptions}
              isLoading={loadingRequisitions}
              value={selectedRequisitionOption}
              onChange={(opt) => {
                onRequisitionChange(opt?.raw || null);
              }}
            />
          </Col>
        </Row>
        {selectedRequisition && (
          <Row className="mt-4">
            <Col>
              <div className="border rounded bg-white p-3">
                <div className="section-header mb-3">
                  {t("examRequest:position_wise_cutoff_configuration")}
                </div>

                {loadingExamConfigs ? (
                  <div className="text-muted"> {t("examRequest:loading_configurations")}</div>
                ) : requisitionPositions.length === 0 ? (
                  <div className="text-muted">
                     {t("examRequest:no_configuration_available")}
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-3">
                    {requisitionPositions.map((pos) => {
                      const badgeVariant = getStatusBadge(pos.raw?.status);

                      return (
                        <div
                          key={pos.value}
                          className="position-item-header d-flex justify-content-between align-items-center border rounded p-2"
                        >
                          <div className="d-flex align-items-center gap-2">
                            <span>{pos.label}</span>
                            <OverlayTrigger
                              placement="bottom"
                              overlay={
                                <Tooltip id={`tooltip-history-${pos.value}`}>
                                 {t("examRequest:view_approval_history")}
                                </Tooltip>
                              }
                            >
                              <button
                                type="button"
                                className="history-btn"
                                onClick={() => handleHistoryClick(pos)}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M3 12a9 9 0 1 0 3-6.7" />
                                  <path d="M3 3v6h6" />
                                  <path d="M12 7v5l4 2" />
                                </svg>
                              </button>
                            </OverlayTrigger>

                            <span
                              className={`status-badge status-${badgeVariant}`}
                            >
                              {formatStatus(pos.raw?.status || "")}
                            </span>
                          </div>

                          <Button
                            size="sm"
                            variant="none"
                            onClick={() => handleViewClick(pos)}
                          >
                            <img
                              src={view_icon}
                              alt="view_icon"
                              className="icon-14"
                            />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </Col>
          </Row>
        )}
        <AddExaminationCutoffModal
          show={showCutoffModal}
          onHide={() => {
            setShowCutoffModal(false);

            setCutoffEditData(null);

            setViewPosition(null);

            setDecisionComments("");

            setCommentError("");
          }}
          editData={cutoffEditData}
          viewOnly={true}
          showApprovalActions={true}
          refreshExamConfigs={refreshExamConfigs}
          selectedRequisition={selectedRequisition}
          selectedPosition={viewPosition?.raw ? [viewPosition.raw] : []}
        />

        <ApprovalHistoryModal
          show={showHistoryModal}
          onClose={() => {
            setShowHistoryModal(false);
            setWorkflowHistory([]);
          }}
          historyData={workflowHistory.map((item) => ({
            ...item,
            approverName: userMap[item.approverId] || item.approverRole || "-",
          }))}
          loading={loadingWorkflowHistory}
        />
      </Container>
    </div>
  );
};

export default ExamRequest;

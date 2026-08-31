import React, { useRef, useEffect } from "react";
import DropdownStripMultipleposition from "../candidatePreview/components/DropdownStripMultipleposition";
import MessageCard from "../Messages/components/messageCard";
import { useMessages } from "../Messages/hooks/useMessages";
import { mapMessagesData } from "../Messages/mappers/messagesMappers";
import "../../style/css/MessageCard.css";
import { useTranslation } from "react-i18next";
import candidateWorkflowServices from "../candidatePreview/services/CandidateWorkflowServices";
import committeeManagementService from "../committeeManagement/services/committeeManagementService";
import masterApiService from "../master/services/masterApiService";
import { toast } from "react-toastify";
import RequisitionStripformultiplepositions from "../candidatePreview/components/RequisitionStripformultiplepositions";
import { Form } from "react-bootstrap";
import { Search } from "react-bootstrap-icons";

const Messages = () => {
  const { t } = useTranslation(["messages", "common"]);
  const {
    selectedRequisitionId,
    selectedPositionId,
    openRow,
    setSelectedRequisitionId,
    setSelectedPositionId,
    toggleRow,
  } = useMessages();
  const [selectedStatus, setSelectedStatus] = React.useState("");
  const [selectedRequestType, setSelectedRequestType] = React.useState("");
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);
  const [requisitions, setRequisitions] = React.useState([]);
  const [loadingRequisitions, setLoadingRequisitions] = React.useState(false);
  const [positions, setPositions] = React.useState([]);
  const [loadingPositions, setLoadingPositions] = React.useState(false);
  const [requestTypes, setRequestTypes] = React.useState([]);
  const [threadMessagesMap, setThreadMessagesMap] = React.useState({});
  const [totalElements, setTotalElements] = React.useState(0);
  const [apiMessages, setApiMessages] = React.useState([]);
  const [loadingMessages, setLoadingMessages] = React.useState(false);
  const [searchText, setSearchText] = React.useState("");
  const [page, setPage] = React.useState(0);
  const [size, setSize] = React.useState(10);
  const [totalPages, setTotalPages] = React.useState(0);
  const filterRef = useRef(null);
  const [interviewCentres, setInterviewCentres] = React.useState([]);
  const selectedRequisitionName =
    requisitions.find((r) => r.id === selectedRequisitionId)
      ?.requisitionTitle || "";
  const messagesData = mapMessagesData(
    apiMessages,
    selectedRequisitionId,
    selectedPositionId,
    selectedRequisitionName,
    positions,
    requestTypes,
    threadMessagesMap,
    interviewCentres
  );

  const filteredMessages = messagesData.filter((item) => {
    const search = searchText.toLowerCase();
    const matchesSearch =
      item.name?.toLowerCase().includes(search) ||
      item.regNo?.toLowerCase().includes(search) ||
      item.requisitionName?.toLowerCase().includes(search) ||
      item.positionName?.toLowerCase().includes(search) ||
      item.type?.toLowerCase().includes(search);
    return (
      selectedPositionId?.length > 0 &&
      (!selectedRequisitionId ||
        item.requisitionId === selectedRequisitionId) &&
      (!selectedPositionId || selectedPositionId.includes(item.positionId)) &&
      (!selectedStatus || item.rawStatus === selectedStatus) &&
      (!selectedRequestType || item.requestTypeId === selectedRequestType) &&
      (!searchText || matchesSearch)
    );
  });
  const fetchMessages = async (
    payload,
    pageNo = page,
    pageSize = size,
    searchValue = ""
  ) => {
    try {
      setLoadingMessages(true);
      const finalPayload = {
        ...payload,
        ...(searchValue?.trim() ? { searchText: searchValue.trim() } : {}),
      };
      const res = await candidateWorkflowServices.getMessageHistory(
        finalPayload,
        pageNo,
        pageSize
      );
      const responseData = res?.data;
      setApiMessages(responseData?.content || []);
      setTotalPages(responseData?.page.totalPages || 0);
      setTotalElements(responseData?.page.totalElements || 0);
    } catch (err) {
      console.error("Messages API error", err);
    } finally {
      setLoadingMessages(false);
    }
  };
  const fetchPositions = async (requisitionId, search = "") => {
    try {
      setLoadingPositions(true);
      const res = await candidateWorkflowServices.getPositionsByRequisitionId(
        requisitionId,
        search
      );
      setPositions(res?.data || []);
    } catch (err) {
      console.error("Positions API error", err);
    } finally {
      setLoadingPositions(false);
    }
  };
  React.useEffect(() => {
    fetchRequisitions();
    fetchRequestTypes();
    fetchInterviewCentres();
  }, []);
  const fetchRequisitions = async (search = "") => {
    try {
      setLoadingRequisitions(true);
      const res = await candidateWorkflowServices.getRequisitions(search);
      setRequisitions(res?.data || []);
    } catch (err) {
      console.error("Requisition API error", err);
    } finally {
      setLoadingRequisitions(false);
    }
  };
  const fetchRequestTypes = async () => {
    try {
      const res = await masterApiService.getRequestTypes();

      if (res?.success) {
        setRequestTypes(res.data);
      }
    } catch (err) {
      console.error("RequestTypes API error", err);
    }
  };
  React.useEffect(() => {
    if (selectedPositionId?.length > 0) {
      toggleRow(null);
      fetchMessages(
        {
          positionsIds: selectedPositionId || [],
          requestTypeIds: selectedRequestType ? [selectedRequestType] : [],
          statusList: selectedStatus ? [selectedStatus] : [],
          searchText: searchText || "",
        },
        page,
        size
      );
    }
  }, [selectedPositionId, selectedStatus, selectedRequestType, page, size]);
  const fetchThreadMessages = async (threadId) => {
    try {
      const res =
        await candidateWorkflowServices.getMessagesByThreadId(threadId);
      return res?.data || [];
    } catch (err) {
      console.error("Thread messages error", err);
      return [];
    }
  };
  const handleToggle = async (id) => {
    const msgs = await fetchThreadMessages(id);
    const [approvalRes, usersRes] = await Promise.all([
      committeeManagementService.getApprovalHistoryByThreadId(id),
      masterApiService.getUser(),
    ]);
    const approvalData = approvalRes?.data?.data || approvalRes?.data || [];
    const users = usersRes?.data?.data || usersRes?.data || [];
    const userMap = {};
    users.forEach((u) => {
      userMap[u.userId] = u.name;
    });
    const approvalMapped = approvalData.map((a) => ({
      senderType: "APPROVER",
      approverName: userMap[a.approverId] || a.approverRole || "Approver",
      message: a.comments || a.comment || a.remarks || a.remark || "-",
      createdDate: a.actionDate || a.createdDate,
      status: a.status,
    }));
    const filteredMsgs = (msgs || []).filter((m) => {
      if (m.senderType !== "RECRUITER") {
        return true;
      }
      const recruiterMessage = (m.message || m.comments || "")
        .trim()
        .toLowerCase();
      const isDuplicate = approvalMapped.some((a) => {
        const approvalMessage = (a.message || a.comments || "")
          .trim()
          .toLowerCase();
        return recruiterMessage === approvalMessage;
      });
      return !isDuplicate;
    });
    const mergedHistory = [...filteredMsgs, ...approvalMapped];
    mergedHistory.sort(
      (a, b) => new Date(a.createdDate) - new Date(b.createdDate)
    );
    setThreadMessagesMap((prev) => ({
      ...prev,
      [id]: mergedHistory,
    }));
    toggleRow(id);
  };
  React.useEffect(() => {
    setPage(0);
  }, [selectedPositionId, selectedStatus, selectedRequestType, searchText]);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const handleSubmitApproval = async (threadId, status, comment) => {
    try {
      const payload = {
        conversationThreadId: [threadId],
        status,
        comments: comment || "",
      };
      const res =
        await candidateWorkflowServices.submitForMessageApproval(payload);
      if (res?.success || res?.data?.success) {
        if (status === "L1_PENDING") {
          toast.success(t("messages:approved_successfully"));
        }
        if (status === "REJECTED") {
          toast.success(t("messages:rejected_successfully"));
        }
      }
      const latestMessages = await fetchThreadMessages(threadId);

      setThreadMessagesMap((prev) => ({
        ...prev,
        [threadId]: Array.isArray(latestMessages) ? latestMessages : [],
      }));
      setApiMessages((prev) =>
        prev.map((item) =>
          item.conversationThreadId === threadId ? { ...item, status } : item
        )
      );
    } catch (err) {
      console.error("Submit approval error", err);
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          t("messages:something_went_wrong")
      );
    }
  };
  const getVisiblePages = () => {
    if (totalPages <= 3) {
      return Array.from({ length: totalPages }, (_, i) => i);
    }
    if (page <= 1) {
      return [0, 1, 2];
    }
    if (page >= totalPages - 2) {
      return [totalPages - 3, totalPages - 2, totalPages - 1];
    }
    return [page - 1, page, page + 1];
  };
  const fetchInterviewCentres = async () => {
    try {
      const res = await masterApiService.getInterviewCentresByState([], null);
      setInterviewCentres(res?.data || []);
    } catch (err) {
      console.error("Interview centre error", err);
    }
  };
  return (
    <div
      className="container-fluid py-3 px-3"
      style={{
        background: "#F5F7FA",
        minHeight: "100vh",
        marginBottom: "35px",
      }}
    >
      <div
        className="card"
        style={{
          borderRadius: "16px",
          overflow: "hidden",
          border: "1px solid #E0E0E0",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}
      >
        <div
          className="card-body p-0 d-flex flex-column"
          style={{ height: "100%" }}
        >
          {/* HEADER */}
          <div id="msg-card-1">
            <div className="d-flex justify-content-between align-items-center px-3 py-3 border-bottom">
              <div>
                <h6 className="blue-color fw-semibold mb-0">
                  {" "}
                  {t("messages:message_history")}
                </h6>
                <small className="text-muted">
                  {t("messages:manage_communications")}
                </small>
              </div>
              <div className="search-boxpost">
                <Search />
                <Form.Control
                  type="text"
                  placeholder={t("messages:search_candidates")}
                  value={searchText}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSearchText(value);
                    setPage(0);
                    if (selectedPositionId?.length > 0) {
                      fetchMessages(
                        {
                          positionsIds: selectedPositionId || [],
                          requestTypeIds: selectedRequestType
                            ? [selectedRequestType]
                            : [],
                          statusList: selectedStatus ? [selectedStatus] : [],
                          searchText: value || "",
                        },
                        0,
                        size,
                        value
                      );
                    }
                  }}
                />
              </div>
            </div>
          </div>
          {/* FILTERS */}
          <div className="px-3 pt-3" id="msg-card-1">
            <div className="d-flex align-items-end gap-3 w-100 flex-wrap">
              {/* LEFT */}
              <div className="d-flex flex-wrap gap-3 flex-grow-1 align-items-end">
                <DropdownStripMultipleposition
                  requisitions={requisitions}
                  positions={positions}
                  selectedRequisitionId={selectedRequisitionId}
                  selectedPositionId={selectedPositionId}
                  loadingRequisitions={loadingRequisitions}
                  loadingPositions={loadingPositions}
                  onRequisitionChange={(e) => {
                    const id = e.target.value;
                    setSelectedRequisitionId(id);
                    setSelectedPositionId([]);
                    setApiMessages([]);
                    setSearchText("");
                    setPage(0);
                    fetchPositions(id);
                  }}
                  onPositionChange={(values) => {
                    setSelectedPositionId(values);
                    setSearchText("");
                    setPage(0);
                  }}
                  onRequisitionSearch={(val) => fetchRequisitions(val)}
                />
                <div className="col-md-2 col-12" style={{ marginLeft: "auto" }}>
                  <select
                    className="status-select form-select"
                    value={selectedStatus || ""}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <option value="">{t("messages:all_status")}</option>
                    <option value="PENDING">Pending</option>
                    <option value="L1_PENDING">L1 Pending</option>
                    <option value="L2_PENDING">L2 Pending</option>
                    <option value="L1_REJECTED">L1 Rejected</option>
                    <option value="APPROVED">Approved</option>
                    <option value="L2_REJECTED">L2 Rejected</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
                <div className="col-md-2 col-12">
                  <select
                    className="status-select form-select"
                    value={selectedRequestType || ""}
                    onChange={(e) => setSelectedRequestType(e.target.value)}
                  >
                    <option value="">{t("messages:all_request_types")}</option>

                    {requestTypes.map((type) => (
                      <option
                        key={type.requestTypeId}
                        value={type.requestTypeId}
                      >
                        {type.requestTypeName || type.requestName || type.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {/* RIGHT: FILTER */}
            </div>
          </div>
          {selectedRequisitionId && selectedPositionId?.length > 0 && (
            <div className="mt-3">
              <RequisitionStripformultiplepositions
                requisition={requisitions.find(
                  (r) => r.id === selectedRequisitionId
                )}
                position={positions
                  .filter((p) =>
                    selectedPositionId.includes(p.jobPositions?.positionId)
                  )
                  .map((p) => ({
                    positionId: p.jobPositions?.positionId,
                    positionName: p.masterPositions?.positionName,
                  }))}
                onRemovePosition={(removedId) => {
                  const updatedPositions = selectedPositionId.filter(
                    (id) => id !== removedId
                  );
                  setSelectedPositionId(updatedPositions);
                  fetchMessages(
                    {
                      positionsIds: updatedPositions,
                      requestTypeIds: selectedRequestType
                        ? [selectedRequestType]
                        : [],
                      statusList: selectedStatus ? [selectedStatus] : [],
                      searchText: searchText || "",
                    },
                    0,
                    size
                  );
                }}
              />
            </div>
          )}
          {/* LIST */}
          <div
            className="px-3 py-3 flex-grow-1"
            style={{
              overflowY: "auto",
              minHeight: "300px",
              paddingBottom: "90px",
            }}
          >
            {filteredMessages.length > 0 ? (
              filteredMessages.map((item) => (
                <MessageCard
                  key={item.id}
                  item={item}
                  isOpen={openRow === item.id}
                  onToggle={handleToggle}
                  onSubmitApproval={handleSubmitApproval}
                />
              ))
            ) : (
              <div
                className="d-flex flex-column justify-content-center align-items-center"
                style={{ minHeight: "250px" }}
              >
                <div className="mb-2">
                  <i
                    className="bi bi-inbox"
                    style={{
                      fontSize: "28px",
                      color: "#A0A0A0",
                    }}
                  ></i>
                </div>

                <div className="fw-semibold text-muted">
                  {t("messages:no_data")}
                </div>
              </div>
            )}
          </div>
          <div
            className="d-flex justify-content-end align-items-center gap-3 col px-3 py-3 border-top flex-wrap"
            style={{
              position: "sticky",
              bottom: 0,
              background: "#fff",
              zIndex: 10,
              marginBottom: "10px",
              paddingBottom: "16px",
            }}
          >
            {/* Page size */}
            <div className="d-flex align-items-center gap-2">
              <span
                className="fw-semibold pagesize"
                style={{ color: "#162B75" }}
              >
                {t("messages:page_size")}:
              </span>
              <select
                className="form-select form-select-sm"
                style={{ width: "90px" }}
                value={size}
                onChange={(e) => {
                  setSize(Number(e.target.value));
                  setPage(0);
                }}
              >
                {[5, 10, 15, 20, 25, 30].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            {/* Pagination */}
            <nav aria-label="Page navigation">
              <ul className="pagination mb-0 justify-content-center">
                <li className={`page-item ${page === 0 ? "disabled" : ""}`}>
                  <button
                    className="page-link"
                    disabled={page === 0}
                    onClick={() => setPage((p) => Math.max(p - 1, 0))}
                  >
                    «
                  </button>
                </li>
                {page > 1 && (
                  <li className="page-item disabled">
                    <span className="page-link">...</span>
                  </li>
                )}
                {getVisiblePages().map((i) => (
                  <li
                    key={i}
                    className={`page-item ${page === i ? "active" : ""}`}
                  >
                    <button className="page-link" onClick={() => setPage(i)}>
                      {i + 1}
                    </button>
                  </li>
                ))}
                {page < totalPages - 2 && (
                  <li className="page-item disabled">
                    <span className="page-link">...</span>
                  </li>
                )}
                <li
                  className={`page-item ${page >= totalPages - 1 ? "disabled" : ""}`}
                >
                  <button
                    className="page-link"
                    disabled={page >= totalPages - 1}
                    onClick={() =>
                      setPage((p) => Math.min(p + 1, totalPages - 1))
                    }
                  >
                    »
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Messages;

import React, { useState } from "react";
import "../../../style/css/MessageCard.css";
import MessageHeader from "../../Messages/components/messageHeader.jsx";
import MessageHistory from "../../Messages/components/messageHistory.jsx";
import MessageActions from "../../Messages/components/messageActions.jsx";
import ApprovalHistoryModal from "../../Approvals/components/ApprovalHistoryModal.jsx";
import { useMessages } from "../../Messages/hooks/useMessages.js";
import committeeManagementService from "../../committeeManagement/services/committeeManagementService";
import masterApiService from "../../master/services/masterApiService.js";
const MessageCard = ({ item, isOpen, onToggle, onSubmitApproval }) => {
  const { getStatusClass, getHistoryColor } = useMessages();
  const [showApprovalHistory, setShowApprovalHistory] = useState(false);
  const [selectedHistoryData, setSelectedHistoryData] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const handleOpenApprovalHistory = async () => {
    if (!item.id) return;
    try {
      setShowApprovalHistory(true);
      setLoadingHistory(true);
      const [historyRes, usersRes] = await Promise.all([
        committeeManagementService.getApprovalHistoryByThreadId(item.id),
        masterApiService.getUser(),
      ]);
      const historyData = historyRes?.data?.data || historyRes?.data || [];
      const users = usersRes?.data?.data || usersRes?.data || [];
      const userMap = {};
      users.forEach((user) => {
        userMap[user.userId] = user.name;
      });
      const mappedHistory = Array.isArray(historyData)
        ? historyData.map((historyItem) => ({
            ...historyItem,
            approverName:
              userMap[historyItem.approverId] ||
              historyItem.approverName ||
              "Unknown User",
          }))
        : [];
      setSelectedHistoryData(mappedHistory);
    } catch (error) {
      console.error("HISTORY ERROR", error);
      setSelectedHistoryData([]);
    } finally {
      setLoadingHistory(false);
    }
  };
  return (
    <>
      <div className="msg-card" id="msg-card-1">
        <MessageHeader
          item={{
            ...item,
            onHistoryClick: handleOpenApprovalHistory,
          }}
          isOpen={isOpen}
          onToggle={onToggle}
          getStatusClass={getStatusClass}
        />
        {isOpen && (
          <div className="msg-expand">
            <MessageHistory item={item} getHistoryColor={getHistoryColor} />
            <MessageActions item={item} onSubmitApproval={onSubmitApproval} />
          </div>
        )}
      </div>
      <ApprovalHistoryModal
        show={showApprovalHistory}
        onClose={() => setShowApprovalHistory(false)}
        historyData={selectedHistoryData}
        loading={loadingHistory}
      />
    </>
  );
};
export default MessageCard;

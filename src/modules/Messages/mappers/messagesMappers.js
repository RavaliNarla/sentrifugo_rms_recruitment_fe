export const mapMessagesData = (
  apiMessages = [],
  selectedRequisitionId,
  selectedPositionId,
  selectedRequisitionName,
  positions = [],
  requestTypes = [],
  threadMessagesMap = {},
  interviewCentres = []
) => {
  const requestTypeMap = {};
  requestTypes.forEach((rt) => {
    requestTypeMap[rt.requestTypeId] = rt.requestName;
  });
  const zonalMap = {};
  interviewCentres.forEach((z) => {
    zonalMap[z.interviewCentreId] = z.displayName;
  });
  return (apiMessages || []).map((item) => {
    const createdDate = item?.createdDate ? new Date(item.createdDate) : null;
    return {
      id: item?.conversationThreadId,
      applicationId: item?.applicationId || "",
      name: item?.candidateName || "",
      regNo: item?.applicationNo || "",
      requisitionId: selectedRequisitionId,
      requisitionName: selectedRequisitionName || "-",
      positionId: item?.positionId || "",
      positionName:
        positions.find((p) => p.jobPositions?.positionId === item?.positionId)
          ?.masterPositions?.positionName || "-",

      date: createdDate
        ? `${String(createdDate.getDate()).padStart(2, "0")}-${String(
            createdDate.getMonth() + 1
          ).padStart(2, "0")}-${createdDate.getFullYear()}`
        : "-",
      time: createdDate
        ? createdDate
            .toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })
            .replace(/am/i, "AM")
            .replace(/pm/i, "PM")
        : "-",

      dateExtension: item?.dateExtension
        ? `${String(new Date(item.dateExtension).getDate()).padStart(
            2,
            "0"
          )}-${String(new Date(item.dateExtension).getMonth() + 1).padStart(
            2,
            "0"
          )}-${new Date(item.dateExtension).getFullYear()}`
        : "-",
      status: (() => {
        switch (item?.status) {
          case "PENDING":
            return "Pending";
          case "L1_PENDING":
            return "L1 Pending";
          //   case "L2_PENDING": return "L2 Pending";
          case "L1_REJECTED":
            return "L1 Rejected";
          case "L2_PENDING":
            return "L2 Pending";
          case "L2_APPROVED":
            return "L2 Approved";
          case "L2_REJECTED":
            return "L2 Rejected";
          case "REJECTED":
            return "Rejected";
          default:
            return item?.status || "-";
        }
      })(),
      rawStatus: item?.status,
      requestTypeId: item?.requestTypeId || "",
      type:
        item?.requestTypeName ||
        requestTypeMap[item?.requestTypeId] ||
        item?.requestTypeId ||
        "-",
      zonalId: zonalMap[item?.zonalId] || item?.zonalId || "-",
      history: (threadMessagesMap[item?.conversationThreadId] || []).map(
        (msg) => {
          const msgDate = msg?.actionDate
            ? new Date(msg.actionDate)
            : msg?.createdDate
              ? new Date(msg.createdDate)
              : null;
          return {
            type: msg?.status
              ? "approval"
              : msg.senderType === "CANDIDATE"
                ? "candidate"
                : "request",
            title: msg?.approverName || msg?.senderType || "-",
            comment:
              msg?.comments ||
              msg?.comment ||
              msg?.approvalComments ||
              msg?.remarks ||
              msg?.remark ||
              msg?.message ||
              "-",
            attachmentPath: msg.attachmentPath || null,
            approverName:
              msg.approverName || msg.approver || msg.createdByName || "-",
            approvalStatus: msg.status || "-",
            approvalDate: msgDate
              ? `${String(msgDate.getDate()).padStart(2, "0")}-${String(
                  msgDate.getMonth() + 1
                ).padStart(2, "0")}-${msgDate.getFullYear()} ${msgDate
                  .toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })
                  .toUpperCase()}`
              : "-",
            time: msgDate
              ? msgDate
                  .toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })
                  .toUpperCase()
              : "-",
            file: false,
          };
        }
      ),
    };
  });
};

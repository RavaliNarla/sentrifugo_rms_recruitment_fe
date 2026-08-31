import React from "react";
import { Modal, Table, Spinner } from "react-bootstrap";
import "../../../style/css/ApprovalHistoryModal.css";
import { useTranslation } from "react-i18next";

const formatDateTime = (iso) => {
  if (!iso) return "-";

  const d = new Date(iso);

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, "0");

  const ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12 || 12;

  return `${day}-${month}-${year} ${hours}.${minutes}${ampm}`;
};
const formatStatusLabel = (status = "") =>
  status
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

const ApprovalHistoryModal = ({
  show,
  onClose,
  historyData = [],
  loading = false,
}) => {
  const historyArray = Array.isArray(historyData) ? historyData : [];
  const { t } = useTranslation("approvalHistory");

  return (
    <Modal
      show={show}
      onHide={onClose}
      centered
      size="lg"
      className="approval-history-modal"
    >
      <Modal.Header closeButton>
        <div>
          <Modal.Title className="approval-history-title">
            {t("approvalHistory:approval_history")}
          </Modal.Title>
          <p className="approval-history-subtitle">
            {t("approvalHistory:track_approvals_and_decisions")}
          </p>
        </div>
      </Modal.Header>

      <Modal.Body>
        {loading ? (
          <div className="text-center py-4">
            <Spinner animation="border" />
          </div>
        ) : (
          <div className="table-responsive">
            <Table className="approval-history-table">
              <thead>
                <tr>
                  
                  <th className="text-white fs-14 fw-normal blue-bg">
                    {t("approvalHistory:approver")}
                  </th>
                  <th className="text-white fs-14 fw-normal blue-bg">
                    {t("approvalHistory:approval_date")}
                  </th>
                  <th className="text-white fs-14 fw-normal blue-bg">
                    {t("approvalHistory:status")}
                  </th>
                  <th className="text-white fs-14 fw-normal blue-bg">
                    {t("approvalHistory:comments")}
                  </th>
                </tr>
              </thead>

              <tbody>
                {historyArray.length > 0 ? (
                  [...historyArray]
                    .sort(
                      (a, b) => new Date(b.actionDate) - new Date(a.actionDate)
                    )
                    .map((item) => (
                      <tr key={item.approvalId}>
                        <td className="fw-normal fs-14 mb-0">
                          {item.approverName || "-"}
                        </td>

                        <td className="fw-normal fs-14 mb-0">
                          {formatDateTime(item.actionDate)}
                        </td>

                        <td className="fw-normal fs-14 mb-0">
                          {formatStatusLabel(item.status)}
                        </td>

                        <td className="fw-normal fs-14 mb-0">
                          {item.comments || "-"}
                        </td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="text-center py-4 text-muted fs-14"
                    >
                      {t("approvalHistory:no_history_available")}
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default ApprovalHistoryModal;

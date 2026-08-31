import React from "react";
import { useTranslation } from "react-i18next";
import history_icon from "../../../assets/history_icon.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarDays,
  faLayerGroup,
  faLocationDot,
} from "@fortawesome/free-solid-svg-icons";
import endIcon from "../../../../src/assets/end_icon.png";
const MessageHeader = ({ item, isOpen, onToggle, getStatusClass }) => {
  const { t } = useTranslation(["messages", "common"]);
  return (
    <div
      className="msg-row"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "16px",
        width: "100%",
        flexWrap: "wrap",
      }}
    >
      <div
        style={{
          display: "flex",
          flex: 1,
          gap: "16px",
          minWidth: 0,
          flexWrap: "wrap",
        }}
      >
        {/* LEFT */}
        <div
          className="msg-left"
          style={{
            display: "flex",
            gap: "12px",
            alignItems: "flex-start",
            flex: "1 1 50px",
            minWidth: 0,
          }}
        >
          <div className="msg-avatar">
            {item.name
              ?.split(" ")
              .filter(Boolean)
              .map((word) => word.charAt(0).toUpperCase())
              .slice(0, 2)
              .join("")}
          </div>
          <div
            style={{
              flex: 1,
              minWidth: 0,
            }}
          >
            <div
              className="msg-name"
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "8px",
                width: "100%",
                flexWrap: "wrap",
              }}
            >
              <h6
                className="mb-0"
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  minWidth: 0,
                  wordBreak: "break-word",
                  overflowWrap: "break-word",
                  whiteSpace: "normal",
                  margin: 0,
                  lineHeight: "20px",
                }}
                title={item.name}
              >
                {item.name}
              </h6>
              <img
                src={history_icon}
                alt="history_icon"
                className="icon-18 mb-2 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  item.onHistoryClick?.();
                }}
              />
            </div>
            <div className="msg-sub">
              {t("messages:reg_no")}: {item.regNo}
            </div>
            <div
              className="msg-sub"
              style={{
                marginTop: "1px",
              }}
            >
              {t("messages:position")} : {item.positionName || "-"}
            </div>
            <div
              className="msg-sub"
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "4px",
                alignItems: "center",
              }}
            >
              <i
                className="bi bi-calendar-event"
                style={{
                  color: "#6B7280",
                  fontSize: "14px",
                }}
              ></i>
              <span>{item.date || "-"}</span>
              <span>|</span>
              <img src={endIcon} alt="endIcon" className="icon-14" />
              <span>{item.time || "-"}</span>
            </div>
          </div>
        </div>
        <div
          className="msg-right"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "16px",
            flex: "2 1 500px",
            minWidth: 0,
            width: "100%",
          }}
        >
          <div
            className="msg-label"
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
              minWidth: 0,
            }}
          >
            <FontAwesomeIcon
              icon={faCalendarDays}
              className="mt-1"
              style={{ fontSize: "16px" }}
            />
            <div style={{ minWidth: 0 }}>
              <span>{t("messages:extension_date")}</span>
              <div
                className="msg-value"
                style={{
                  wordBreak: "break-word",
                  fontSize: "13px",
                }}
              >
                {item.dateExtension || "-"}
              </div>
            </div>
          </div>
          <div
            className="msg-label"
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
              minWidth: 0,
            }}
          >
            <FontAwesomeIcon
              icon={faLayerGroup}
              style={{
                fontSize: "16px",
                marginTop: "3px",
                flexShrink: 0,
              }}
            />
            <div style={{ minWidth: 0 }}>
              <div className="msg-label">{t("messages:request_type")}</div>
              <div
                className="msg-value"
                style={{
                  wordBreak: "break-word",
                  fontSize: "13px",
                }}
              >
                {item.type || "-"}
              </div>
            </div>
          </div>
          <div
            className="msg-label"
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
              minWidth: 0,
            }}
          >
            <FontAwesomeIcon
              icon={faLocationDot}
              style={{
                fontSize: "16px",
                marginTop: "3px",
                flexShrink: 0,
              }}
            />
            <div style={{ minWidth: 0 }}>
              <div className="msg-label">{t("messages:zone")}</div>
              <div
                className="msg-value"
                style={{
                  wordBreak: "break-word",
                  fontSize: "13px",
                }}
              >
                {item.zonalId || "-"}
              </div>
            </div>
          </div>
          <div
            className="msg-status-wrap"
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <span className={`msg-status ${getStatusClass(item.status)}`}>
              {item.status || "-"}
            </span>
          </div>
        </div>
      </div>
      <div
        className="msg-arrow"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          alignSelf: "center",
        }}
      >
        <button
          type="button"
          className={`msg-arrow-btn ${isOpen ? "open" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggle(item.id);
          }}
        >
          <i className="bi bi-chevron-down"></i>
        </button>
      </div>
    </div>
  );
};
export default MessageHeader;

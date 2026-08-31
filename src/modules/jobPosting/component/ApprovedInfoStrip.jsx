import React, { useState, useEffect } from "react"; import {
    Modal,
    Accordion,
    Form,
    OverlayTrigger,
    Popover
} from "react-bootstrap";
import "../../../style/css/ApprovedInfoModal.css";
import { useTranslation } from "react-i18next";


const ApprovedInfoStrip = ({
    show,
    onHide,
    requisition,
}) => {
    const { t } = useTranslation(["common", "approvalHistory"]);
    const [showRemaining, setShowRemaining] = useState({});

    const requisitionData = requisition || {};




    const positions = Array.isArray(requisitionData?.positions)
        ? requisitionData.positions
        : [];
    const formatDate = (date) => {
        if (!date) return "-";

        const d = new Date(date);

        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();

        return `${day}-${month}-${year}`;
    };
    useEffect(() => {
        if (show) {
            setShowRemaining({});
        }
    }, [show]);

    return (
        <Modal
            show={show}
            onHide={onHide}
            centered
            size="lg"
        >
            <Modal.Header closeButton className="approved-modal-header">
                <div className="w-100">
                    <div className="approved-header-row">
                        <span className="approved-header-id">
                            {requisition?.requisitionId} - {requisition?.code}
                        </span>

                        <span className="approved-header-date">
                            <i className="bi bi-calendar3"></i>
                            {t("approvalHistory:start_date")}: {formatDate(requisition?.startDate)}
                        </span>

                        <span className="approved-header-divider">|</span>

                        <span className="approved-header-date">
                            <i className="bi bi-clock"></i>
                            {t("approvalHistory:end_date")}: {formatDate(requisition?.endDate)}
                        </span>
                    </div>

                    {/* <div className="approved-header-position">
                        {requisition?.positionName}
                    </div> */}
                </div>
            </Modal.Header>

            <Modal.Body>


                {/* Position Accordions */}
                {/* <Accordion
                    className="approved-accordion"
                    defaultActiveKey={positions.map((_, index) => String(index))}
                    alwaysOpen
                    
                > */}
                <Accordion className="approved-accordion">
                    {positions.map((position, index) => (
                        <Accordion.Item
                            key={position?.id || index}
                            eventKey={String(index)}
                            className="mb-3"
                        >
                            {/* <Accordion.Header>
                                {requisition?.positionName}
                            </Accordion.Header> */}

                            <Accordion.Header>
                                {position?.positionName || `${t("approvalHistory:position")} ${index + 1}`}
                            </Accordion.Header>

                            <Accordion.Body>
                                <div className="approved-stats-container mb-3">
                                    <div className="row g-2 small">

                                        <div className="col-12 col-md-4">
                                            <span className="approved-stat-label">
                                                {t("approvalHistory:employment_type")}:
                                            </span>{" "}
                                            <span className="approved-stat-value">
                                                {position?.employmentType || "-"}
                                            </span>
                                        </div>

                                        <div className="col-12 col-md-4">
                                            <span className="approved-stat-label">
                                                {t("approvalHistory:contract_period")}:
                                            </span>{" "}
                                            <span className="approved-stat-value">
                                                {position?.contractPeriod !== undefined
                                                    ? position.contractPeriod
                                                    : "-"}
                                            </span>
                                        </div>

                                        <div className="col-12 col-md-4">
                                            <span className="approved-stat-label">
                                                {t("approvalHistory:eligibility_age")}:
                                            </span>{" "}
                                            <span className="approved-stat-value">
                                                {position?.eligibilityAge || "-"}
                                            </span>
                                        </div>

                                        <div className="col-12 col-md-4">
                                            <span className="approved-stat-label">
                                                {t("approvalHistory:vacancies")}:
                                            </span>{" "}
                                            <span className="approved-stat-value">
                                                {position?.vacancies || "-"}
                                            </span>
                                        </div>

                                        <div className="col-12 col-md-4">
                                            <span className="approved-stat-label">
                                                {t("common:department")}:
                                            </span>{" "}
                                            <span className="approved-stat-value">
                                                {position?.department || "-"}
                                            </span>
                                        </div>

                                        <div className="col-12 col-md-4">
                                            <span className="approved-stat-label">
                                                {t("approvalHistory:experience")}:
                                            </span>{" "}
                                            <span className="approved-stat-value">
                                                {position?.experience || "-"}
                                            </span>
                                        </div>

                                    </div>
                                </div>

                                {/* Category Wise Reservation (State-wise) */}
                                {position?.reservationType === "STATE_WISE" ? (
                                    <div className="approved-reservation-card">
                                        <div className="approved-reservation-title">
                                            {t("approvalHistory:category_wise_reservation_state")}
                                        </div>

                                        <div className="table-responsive">
                                            <table className="approved-reservation-table">
                                                <thead>
                                                    <tr>
                                                        <th rowSpan="2">{t("approvalHistory:state")}</th>
                                                        <th rowSpan="2">{t("approvalHistory:city")}</th>
                                                        <th colSpan="6">{t("approvalHistory:category")}</th>
                                                        <th colSpan="4">{t("approvalHistory:disability")}</th>
                                                    </tr>


                                                    <tr>
                                                        <th>SC</th>
                                                        <th>ST</th>
                                                        <th>OBC</th>
                                                        <th>EWS</th>
                                                        <th>GEN</th>
                                                        <th>{t("common:total")}</th>
                                                        <th>HI</th>
                                                        <th>OC</th>
                                                        <th>VI</th>
                                                        <th>ID</th>
                                                    </tr>
                                                </thead>

                                                <tbody>
                                                    {position?.stateWiseReservation?.map((row, idx) => (
                                                        <tr key={idx}>
                                                            <td>{row.state}</td>
                                                            <td>{row.city}</td>

                                                            <td>{row.sc}</td>
                                                            <td>{row.st}</td>
                                                            <td>{row.obc}</td>
                                                            <td>{row.ews}</td>
                                                            <td>{row.gen}</td>
                                                            <td>{row.total}</td>

                                                            <td>{row.hi}</td>
                                                            <td>{row.oc}</td>
                                                            <td>{row.vi}</td>
                                                            <td>{row.idd}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="approved-reservation-card">
                                        <div className="approved-reservation-title">
                                            {t("approvalHistory:category_wise_reservation")}
                                        </div>

                                        <div className="table-responsive">
                                            <table className="approved-reservation-table">
                                                <thead>
                                                    <tr>
                                                        <th>SC</th>
                                                        <th>ST</th>
                                                        <th>OBC</th>
                                                        <th>EWS</th>
                                                        <th>GEN</th>
                                                        <th>{t("common:total")}</th>
                                                    </tr>
                                                </thead>

                                                <tbody>
                                                    <tr>
                                                        <td>{position?.nationalReservation?.sc ?? 0}</td>
                                                        <td>{position?.nationalReservation?.st ?? 0}</td>
                                                        <td>{position?.nationalReservation?.obc ?? 0}</td>
                                                        <td>{position?.nationalReservation?.ews ?? 0}</td>
                                                        <td>{position?.nationalReservation?.gen ?? 0}</td>
                                                        <td>{position?.nationalReservation?.total ?? 0}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* Candidates Onboarded / Remaining */}
                                <div className="approved-onboarded-card">


                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <div className="approved-onboarded-title mb-0">
                                            {showRemaining[index]
                                                ? t("approvalHistory:remaining_vacancies")
                                                : t("approvalHistory:candidates_onboarded")}
                                        </div>
                                        <div className="approved-info-toggle-switch form-check form-switch">
                                            <input
                                                className="approved-info-toggle-input form-check-input"
                                                type="checkbox"
                                                id={`remaining-switch-${index}`}
                                                checked={showRemaining[index] || false}
                                                onChange={(e) => {


                                                    // console.log(position?.stateWiseReservation);
                                                    // console.log(position?.stateWiseOnboarded);
                                                    setShowRemaining((prev) => ({
                                                        ...prev,
                                                        [index]: e.target.checked,
                                                    }))
                                                }
                                                }
                                            />

                                            <label
                                                className="approved-info-toggle-label form-check-label"
                                                htmlFor={`remaining-switch-${index}`}
                                            >
                                                <span className="approved-info-toggle-text">
                                                    {t("approvalHistory:show_remaining_vacancies")}
                                                </span>
                                            </label>
                                        </div>
                                    </div>

                                    {position?.reservationType === "STATE_WISE" ? (
                                        <div className="table-responsive">
                                            <table className="approved-onboarded-table">
                                                <thead>
                                                    <tr>
                                                        <th rowSpan="2">{t("approvalHistory:state")}</th>
                                                        <th rowSpan="2">{t("approvalHistory:city")}</th>
                                                        <th colSpan="6">{t("approvalHistory:category")}</th>
                                                        <th colSpan="4">{t("approvalHistory:disability")}</th>
                                                    </tr>

                                                    <tr>
                                                        <th>SC</th>
                                                        <th>ST</th>
                                                        <th>OBC</th>
                                                        <th>EWS</th>
                                                        <th>GEN</th>
                                                        <th>{t("common:total")}</th>
                                                        <th>HI</th>
                                                        <th>OC</th>
                                                        <th>VI</th>
                                                        <th>ID</th>
                                                    </tr>
                                                </thead>

                                                <tbody>
                                                    {(
                                                        showRemaining[index]
                                                            ? position?.stateWiseRemaining
                                                            : position?.stateWiseOnboarded
                                                    )?.map((row, idx) => (
                                                        <tr key={idx}>
                                                            <td>{row.state}</td>
                                                            <td>{row.city}</td>

                                                            <td>{row.sc}</td>
                                                            <td>{row.st}</td>
                                                            <td>{row.obc}</td>
                                                            <td>{row.ews}</td>
                                                            <td>{row.gen}</td>
                                                            <td>{row.total}</td>

                                                            <td>{row.hi}</td>
                                                            <td>{row.oc}</td>
                                                            <td>{row.vi}</td>
                                                            <td>{row.idd}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="table-responsive">
                                            <table className="approved-onboarded-table">
                                                <thead>
                                                    <tr>
                                                        <th>SC</th>
                                                        <th>ST</th>
                                                        <th>OBC</th>
                                                        <th>EWS</th>
                                                        <th>GEN</th>
                                                        <th>{t("common:total")}</th>
                                                    </tr>
                                                </thead>

                                                <tbody>
                                                    <tr>
                                                        <td>
                                                            {showRemaining[index]
                                                                ? (position?.nationalReservation?.sc ?? 0) -
                                                                (position?.nationalOnboarded?.sc ?? 0)
                                                                : (position?.nationalOnboarded?.sc ?? 0)}
                                                        </td>

                                                        <td>
                                                            {showRemaining[index]
                                                                ? (position?.nationalReservation?.st ?? 0) -
                                                                (position?.nationalOnboarded?.st ?? 0)
                                                                : (position?.nationalOnboarded?.st ?? 0)}
                                                        </td>

                                                        <td>
                                                            {showRemaining[index]
                                                                ? (position?.nationalReservation?.obc ?? 0) -
                                                                (position?.nationalOnboarded?.obc ?? 0)
                                                                : (position?.nationalOnboarded?.obc ?? 0)}
                                                        </td>

                                                        <td>
                                                            {showRemaining[index]
                                                                ? (position?.nationalReservation?.ews ?? 0) -
                                                                (position?.nationalOnboarded?.ews ?? 0)
                                                                : (position?.nationalOnboarded?.ews ?? 0)}
                                                        </td>

                                                        <td>
                                                            {showRemaining[index]
                                                                ? (position?.nationalReservation?.gen ?? 0) -
                                                                (position?.nationalOnboarded?.gen ?? 0)
                                                                : (position?.nationalOnboarded?.gen ?? 0)}
                                                        </td>

                                                        <td>
                                                            {showRemaining[index]
                                                                ? (position?.nationalReservation?.total ?? 0) -
                                                                (position?.nationalOnboarded?.total ?? 0)
                                                                : (position?.nationalOnboarded?.total ?? 0)}
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    )}

                                </div>

                                <div className="approved-onboarded-card">
                                    <div className="approved-onboarded-title mb-3">
                                        {t("approvalHistory:offers_sent")}
                                    </div>

                                    {position?.reservationType === "STATE_WISE" ? (
                                        <div className="table-responsive">
                                            <table className="approved-onboarded-table">
                                                <thead>
                                                    <tr>
                                                        <th rowSpan="2">{t("approvalHistory:state")}</th>
                                                        <th rowSpan="2">{t("approvalHistory:city")}</th>
                                                        <th colSpan="6">{t("approvalHistory:category")}</th>
                                                        <th colSpan="4">{t("approvalHistory:disability")}</th>
                                                    </tr>

                                                    <tr>
                                                        <th>SC</th>
                                                        <th>ST</th>
                                                        <th>OBC</th>
                                                        <th>EWS</th>
                                                        <th>GEN</th>
                                                        <th>{t("common:total")}</th>
                                                        <th>HI</th>
                                                        <th>OC</th>
                                                        <th>VI</th>
                                                        <th>ID</th>
                                                    </tr>
                                                </thead>

                                                <tbody>
                                                    {position?.stateWiseOffersSent?.map((row, idx) => (
                                                        <tr key={idx}>
                                                            <td>{row.state}</td>
                                                            <td>{row.city}</td>

                                                            <td>{row.sc}</td>
                                                            <td>{row.st}</td>
                                                            <td>{row.obc}</td>
                                                            <td>{row.ews}</td>
                                                            <td>{row.gen}</td>
                                                            <td>{row.total}</td>

                                                            <td>{row.hi}</td>
                                                            <td>{row.oc}</td>
                                                            <td>{row.vi}</td>
                                                            <td>{row.idd}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="table-responsive">
                                            <table className="approved-onboarded-table">
                                                <thead>
                                                    <tr>
                                                        <th>SC</th>
                                                        <th>ST</th>
                                                        <th>OBC</th>
                                                        <th>EWS</th>
                                                        <th>GEN</th>
                                                        <th>{t("common:total")}</th>
                                                    </tr>
                                                </thead>

                                                <tbody>
                                                    <tr>
                                                        <td>{position?.nationalOffersSent?.sc ?? 0}</td>
                                                        <td>{position?.nationalOffersSent?.st ?? 0}</td>
                                                        <td>{position?.nationalOffersSent?.obc ?? 0}</td>
                                                        <td>{position?.nationalOffersSent?.ews ?? 0}</td>
                                                        <td>{position?.nationalOffersSent?.gen ?? 0}</td>
                                                        <td>{position?.nationalOffersSent?.total ?? 0}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>

                                <div className="approved-onboarded-card">
                                    <div className="approved-onboarded-title mb-3">
                                        {t("approvalHistory:offers_accepted")}
                                    </div>

                                    {position?.reservationType === "STATE_WISE" ? (
                                        <div className="table-responsive">
                                            <table className="approved-onboarded-table">
                                                <thead>
                                                    <tr>
                                                        <th rowSpan="2">{t("approvalHistory:state")}</th>
                                                        <th rowSpan="2">{t("approvalHistory:city")}</th>
                                                        <th colSpan="6">{t("approvalHistory:category")}</th>
                                                        <th colSpan="4">{t("approvalHistory:disability")}</th>
                                                    </tr>

                                                    <tr>
                                                        <th>SC</th>
                                                        <th>ST</th>
                                                        <th>OBC</th>
                                                        <th>EWS</th>
                                                        <th>GEN</th>
                                                        <th>{t("common:total")}</th>
                                                        <th>HI</th>
                                                        <th>OC</th>
                                                        <th>VI</th>
                                                        <th>ID</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {position?.stateWiseOffersAccepted?.map((row, idx) => (
                                                        <tr key={idx}>
                                                            <td>{row.state}</td>
                                                            <td>{row.city}</td>

                                                            <td>{row.sc}</td>
                                                            <td>{row.st}</td>
                                                            <td>{row.obc}</td>
                                                            <td>{row.ews}</td>
                                                            <td>{row.gen}</td>
                                                            <td>{row.total}</td>

                                                            <td>{row.hi}</td>
                                                            <td>{row.oc}</td>
                                                            <td>{row.vi}</td>
                                                            <td>{row.idd}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="table-responsive">
                                            <table className="approved-onboarded-table">
                                                <thead>
                                                    <tr>
                                                        <th>SC</th>
                                                        <th>ST</th>
                                                        <th>OBC</th>
                                                        <th>EWS</th>
                                                        <th>GEN</th>
                                                        <th>{t("common:total")}</th>
                                                    </tr>
                                                </thead>

                                                <tbody>
                                                    <tr>
                                                        <td>{position?.nationalOffersAccepted?.sc ?? 0}</td>
                                                        <td>{position?.nationalOffersAccepted?.st ?? 0}</td>
                                                        <td>{position?.nationalOffersAccepted?.obc ?? 0}</td>
                                                        <td>{position?.nationalOffersAccepted?.ews ?? 0}</td>
                                                        <td>{position?.nationalOffersAccepted?.gen ?? 0}</td>
                                                        <td>{position?.nationalOffersAccepted?.total ?? 0}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>

                            </Accordion.Body>
                        </Accordion.Item>
                    ))}

                    {positions.length === 0 && (
                        <div className="text-center text-muted py-3">
                            {t("approvalHistory:no_position_data")}
                        </div>
                    )}
                </Accordion>

            </Modal.Body>

            <Modal.Footer className="justify-content-center">
                <button
                    className="ok-btn"
                    onClick={onHide}
                >
                    {t("common:ok")}
                </button>
            </Modal.Footer>
        </Modal>
    );
};

export default ApprovedInfoStrip;
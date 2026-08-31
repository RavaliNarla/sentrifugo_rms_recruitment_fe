import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import "../../../style/css/ApprovedInfoModal.css";
import { useTranslation } from "react-i18next";

const SinglePositionInfoModal = ({
    show,
    onHide,
    requisition,
    position,
}) => {
    const { t } = useTranslation(["common", "approvalHistory"]);


    const formatDate = (date) => {
        if (!date) return "-";

        const d = new Date(date);

        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();

        return `${day}-${month}-${year}`;
    };
    const [showRemaining, setShowRemaining] = useState(false);

    useEffect(() => {
        if (show) {
            setShowRemaining(false);
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
                            <i className="bi bi-calendar3 me-1"></i>
                            {t("approvalHistory:start_date")}: {formatDate(requisition?.startDate)}
                        </span>

                        <span className="approved-header-divider">|</span>

                        <span className="approved-header-date">
                            <i className="bi bi-clock me-1"></i>
                            {t("approvalHistory:end_date")}:{formatDate(requisition?.endDate)}
                        </span>
                    </div>

                    {/* <div className="approved-header-position">
                        {position?.positionName || "-"}
                    </div> */}
                </div>
            </Modal.Header>

            <Modal.Body>

                {/* Stats */}
                <div className="approved-stats-container mb-3">
                    <div className="row g-2 small">

                        <div className="col-md-4">
                            <span className="approved-stat-label">
                                {t("approvalHistory:employment_type")}:
                            </span>{" "}
                            <span className="approved-stat-value">
                                {position?.employmentType || "-"}
                            </span>
                        </div>

                        <div className="col-md-4">
                            <span className="approved-stat-label">
                                {t("approvalHistory:contract_period")}:
                            </span>{" "}
                            <span className="approved-stat-value">
                                {position?.contractYears || "0"}
                            </span>
                        </div>

                        <div className="col-md-4">
                            <span className="approved-stat-label">
                                {t("approvalHistory:eligibility_age")}:
                            </span>{" "}
                            <span className="approved-stat-value">
                                {position?.eligibilityAge || "-"}
                            </span>
                        </div>

                        <div className="col-md-4">
                            <span className="approved-stat-label">
                                {t("approvalHistory:vacancies")}:
                            </span>{" "}
                            <span className="approved-stat-value">
                                {position?.vacancies || "-"}
                            </span>
                        </div>

                        <div className="col-md-4">
                            <span className="approved-stat-label">
                                {t("common:department")}:
                            </span>{" "}
                            <span className="approved-stat-value">
                                {position?.departmentName || "-"}
                            </span>
                        </div>

                        <div className="col-md-4">
                            <span className="approved-stat-label">
                                {t("approvalHistory:experience")}:
                            </span>{" "}
                            <span className="approved-stat-value">
                                {position?.mandatoryExperienceMonths || "-"}
                            </span>
                        </div>

                    </div>
                </div>

                {/* Reservation */}
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
                            {showRemaining
                                ? t("approvalHistory:remaining_vacancies")
                                : t("approvalHistory:candidates_onboarded")}
                        </div>
                        <div className="approved-info-toggle-switch form-check form-switch">
                            <input
                                className="approved-info-toggle-input form-check-input"
                                type="checkbox"
                                id="remaining-switch" checked={showRemaining} onChange={(e) => {


                                    // console.log(position?.stateWiseReservation);
                                    // console.log(position?.stateWiseOnboarded);
                                    setShowRemaining(e.target.checked)
                                }
                                }
                            />

                            <label
                                className="approved-info-toggle-label form-check-label"
                                htmlFor="remaining-switch"                            >
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
                                        showRemaining
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
                                            {showRemaining
                                                ? (position?.nationalReservation?.sc ?? 0) -
                                                (position?.nationalOnboarded?.sc ?? 0)
                                                : (position?.nationalOnboarded?.sc ?? 0)}
                                        </td>

                                        <td>
                                            {showRemaining
                                                ? (position?.nationalReservation?.st ?? 0) -
                                                (position?.nationalOnboarded?.st ?? 0)
                                                : (position?.nationalOnboarded?.st ?? 0)}
                                        </td>

                                        <td>
                                            {showRemaining
                                                ? (position?.nationalReservation?.obc ?? 0) -
                                                (position?.nationalOnboarded?.obc ?? 0)
                                                : (position?.nationalOnboarded?.obc ?? 0)}
                                        </td>

                                        <td>
                                            {showRemaining
                                                ? (position?.nationalReservation?.ews ?? 0) -
                                                (position?.nationalOnboarded?.ews ?? 0)
                                                : (position?.nationalOnboarded?.ews ?? 0)}
                                        </td>

                                        <td>
                                            {showRemaining
                                                ? (position?.nationalReservation?.gen ?? 0) -
                                                (position?.nationalOnboarded?.gen ?? 0)
                                                : (position?.nationalOnboarded?.gen ?? 0)}
                                        </td>

                                        <td>
                                            {showRemaining
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
                </div>

                <div className="approved-onboarded-card">
                    <div className="approved-onboarded-title mb-3">
                        {t("approvalHistory:offers_accepted")}
                    </div>

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
                </div>

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

export default SinglePositionInfoModal;
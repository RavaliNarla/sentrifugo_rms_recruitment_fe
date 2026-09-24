import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import recruiterApiService from "../../core/recruiterApiService";

const QUICK_ACCESS = [
  { to: "/job-postings", privilege: "JobPostings", icon: "bi-briefcase-fill", label: "Job Postings", desc: "Requisitions & positions" },
  { to: "/candidate-workflow", anyPrivilege: ["CandidatePool", "InterviewPool", "CompensationPool", "OfferPool"], icon: "bi-people-fill", label: "Candidate Management", desc: "Screening to offer" },
  { to: "/committee-management", privilege: "CommitteeManagement", icon: "bi-diagram-3-fill", label: "Committee Management", desc: "Panels & schedules" },
  { to: "/approvals", anyPrivilege: ["L1Approval", "L2Approval"], icon: "bi-check2-square", label: "Approvals", desc: "Requisition sign-off" },
  { to: "/offer-approvals", anyPrivilege: ["L1Approval", "L2Approval"], icon: "bi-envelope-check", label: "Offer Approvals", desc: "Offer letter sign-off" },
  { to: "/interviewer", privilege: "Interview", icon: "bi-person-video3", label: "My Interviews", desc: "Score candidates" },
  { to: "/admin/users", privilege: "Admin", icon: "bi-gear-fill", label: "Admin", desc: "Users & master data" },
];

/** SCL_38: tip under Quick access, matched to what that login can actually do.
 * Approvers (L1/L2) are checked before JobPostings so Admin+Approver users don't get the recruiter strip. */
const roleTip = (privileges = {}) => {
  const isApprover = !!(privileges.L1Approval || privileges.L2Approval);
  if (isApprover && privileges.Admin) {
    return "Use the navigation on the left to approve requisitions and offer letters, and to manage users and master data.";
  }
  if (isApprover) {
    return "Use the navigation on the left to review and approve pending requisitions and offer letters.";
  }
  if (privileges.JobPostings || privileges.CandidatePool || privileges.OfferPool) {
    return "Use the navigation on the left to manage job postings, candidates, interviews, and offers.";
  }
  if (privileges.Interview) {
    return "Use the navigation on the left to view your scheduled interviews and submit candidate scores.";
  }
  if (privileges.Admin) {
    return "Use the navigation on the left to manage users and master data such as departments, locations, position titles, and specializations.";
  }
  if (privileges.CommitteeManagement) {
    return "Use the navigation on the left to manage interview committees and panel assignments.";
  }
  return "Use the navigation on the left to explore the sections available for your account.";
};

const METRICS = [
  { key: "TOTAL_REQUISITIONS", label: "Total Requisitions", field: "totalRequisitions", icon: "bi-file-earmark-text", colorClass: "stat-icon-neutral" },
  { key: "PENDING_APPROVAL", label: "Pending Approval", field: "pendingApprovalRequisitions", icon: "bi-hourglass-split", colorClass: "stat-icon-warn" },
  { key: "APPROVED", label: "Approved", field: "approvedRequisitions", icon: "bi-check-circle", colorClass: "stat-icon-completed" },
  { key: "FULFILLED", label: "Fulfilled", field: "fulfilledRequisitions", icon: "bi-flag-fill", colorClass: "stat-icon-progress" },
  { key: "TOTAL_CANDIDATES", label: "Total Candidates", field: "totalCandidates", icon: "bi-people", colorClass: "stat-icon-neutral" },
  { key: "SHORTLISTED", label: "Shortlisted", field: "shortlistedCandidates", icon: "bi-star-fill", colorClass: "stat-icon-warn" },
  { key: "SCHEDULED", label: "Scheduled for Interview", field: "scheduledCandidates", icon: "bi-calendar-event", colorClass: "stat-icon-progress" },
  { key: "QUALIFIED", label: "Qualified", field: "qualifiedCandidates", icon: "bi-award-fill", colorClass: "stat-icon-completed" },
  { key: "OFFERS_SENT", label: "Offers Sent", field: "offersSent", icon: "bi-envelope-paper-fill", colorClass: "stat-icon-purple" },
];

const StatTile = ({ label, value, icon, colorClass, onClick }) => (
  <button type="button" className="stat-tile-v2 stat-tile-clickable" onClick={onClick} title={`View ${label} details`}>
    <div>
      <div className="stat-num-v2">{value ?? "-"}</div>
      <div className="stat-label-v2">{label}</div>
    </div>
    <div className={`stat-icon-v2 ${colorClass}`}>
      <i className={`bi ${icon}`} />
    </div>
  </button>
);

const DashboardDetailModal = ({ open, loading, detail, onClose }) => {
  if (!open) return null;
  const columns = detail?.columns || [];
  const rows = detail?.rows || [];
  return (
    <div className="modal show d-block" tabIndex={-1} style={{ background: "rgba(0,0,0,0.45)" }} onClick={onClose}>
      <div className="modal-dialog modal-xl modal-dialog-scrollable" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{detail?.title || "Details"}{!loading ? ` (${rows.length})` : ""}</h5>
            <button type="button" className="btn-close" aria-label="Close" onClick={onClose} />
          </div>
          <div className="modal-body">
            {loading ? (
              <div className="text-muted py-4 text-center">Loading…</div>
            ) : rows.length === 0 ? (
              <div className="text-muted py-4 text-center">No records for this metric.</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead>
                    <tr className="text-muted fs-13">
                      {columns.map((col) => <th key={col}>{col}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, idx) => (
                      <tr key={idx}>
                        {columns.map((col) => <td key={col}>{row[col] ?? "-"}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const user = useSelector((state) => state.user);
  const privileges = user.privileges || {};
  const [summary, setSummary] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    if (!privileges.JobPostings) return;
    recruiterApiService.getDashboardSummary()
      .then((res) => setSummary(res.data.data))
      .catch(() => setSummary(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [privileges.JobPostings]);

  const openMetric = async (metric) => {
    setDetailOpen(true);
    setDetailLoading(true);
    setDetail({ title: metric.label, columns: [], rows: [] });
    try {
      const res = await recruiterApiService.getDashboardDetails(metric.key);
      setDetail(res.data.data);
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to load metric details");
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const quickAccessItems = QUICK_ACCESS.filter((item) => {
    if (item.privilege) return !!privileges[item.privilege];
    if (item.anyPrivilege) return item.anyPrivilege.some((p) => privileges[p]);
    return false;
  });

  const requisitionMetrics = METRICS.slice(0, 4);
  const candidateMetrics = METRICS.slice(4, 8);
  const offerMetrics = METRICS.slice(8);

  return (
    <div>
      {quickAccessItems.length > 0 && (
        <>
          <div className="section-title-mini">Quick access</div>
          <div className="row g-3 mb-3">
            {quickAccessItems.map((item) => (
              <div className="col-6 col-md-4 col-lg-2" key={item.to}>
                <Link to={item.to} className="app-card qa-card">
                  <span className="qa-icon"><i className={`bi ${item.icon}`} /></span>
                  <span className="fw-bold">{item.label}</span>
                  <span className="qa-desc">{item.desc}</span>
                </Link>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="app-card mb-4">
        <p className="text-muted m-0">{roleTip(privileges)}</p>
      </div>

      {summary && (
        <>
          <div className="section-title-mini">Recruitment overview</div>
          <p className="text-muted fs-13 mb-2">Click a metric to view the underlying records.</p>
          <div className="stat-row-v2 mb-4">
            {requisitionMetrics.map((m) => (
              <StatTile
                key={m.key}
                label={m.label}
                value={summary[m.field]}
                icon={m.icon}
                colorClass={m.colorClass}
                onClick={() => openMetric(m)}
              />
            ))}
          </div>
          <div className="stat-row-v2">
            {candidateMetrics.map((m) => (
              <StatTile
                key={m.key}
                label={m.label}
                value={summary[m.field]}
                icon={m.icon}
                colorClass={m.colorClass}
                onClick={() => openMetric(m)}
              />
            ))}
          </div>
          <div className="stat-row-v2 mt-3" style={{ gridTemplateColumns: "repeat(1, 1fr)", maxWidth: 260 }}>
            {offerMetrics.map((m) => (
              <StatTile
                key={m.key}
                label={m.label}
                value={summary[m.field]}
                icon={m.icon}
                colorClass={m.colorClass}
                onClick={() => openMetric(m)}
              />
            ))}
          </div>
        </>
      )}

      <DashboardDetailModal
        open={detailOpen}
        loading={detailLoading}
        detail={detail}
        onClose={() => setDetailOpen(false)}
      />
    </div>
  );
};

export default Dashboard;

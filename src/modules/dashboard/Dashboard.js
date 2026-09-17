import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import recruiterApiService from "../../core/recruiterApiService";

const QUICK_ACCESS = [
  { to: "/job-postings", privilege: "JobPostings", icon: "bi-briefcase-fill", label: "Job Postings", desc: "Requisitions & positions" },
  { to: "/candidate-workflow", anyPrivilege: ["CandidatePool", "InterviewPool", "CompensationPool", "OfferPool"], icon: "bi-people-fill", label: "Candidate Management", desc: "Screening to offer" },
  { to: "/committee-management", privilege: "CommitteeManagement", icon: "bi-diagram-3-fill", label: "Committee Management", desc: "Interview panels" },
  { to: "/approvals", anyPrivilege: ["L1Approval", "L2Approval"], icon: "bi-check2-square", label: "Approvals", desc: "Requisition sign-off" },
  { to: "/interviewer", privilege: "Interview", icon: "bi-person-video3", label: "My Interviews", desc: "Score candidates" },
  { to: "/admin/users", privilege: "Admin", icon: "bi-gear-fill", label: "Admin", desc: "Users & master data" },
];

const StatTile = ({ label, value, icon, colorClass }) => (
  <div className="stat-tile-v2">
    <div>
      <div className="stat-num-v2">{value ?? "-"}</div>
      <div className="stat-label-v2">{label}</div>
    </div>
    <div className={`stat-icon-v2 ${colorClass}`}>
      <i className={`bi ${icon}`} />
    </div>
  </div>
);

const Dashboard = () => {
  const user = useSelector((state) => state.user);
  const privileges = user.privileges || {};
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    if (!privileges.JobPostings) return;
    recruiterApiService.getDashboardSummary()
      .then((res) => setSummary(res.data.data))
      .catch(() => setSummary(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [privileges.JobPostings]);

  const quickAccessItems = QUICK_ACCESS.filter((item) => {
    if (item.privilege) return !!privileges[item.privilege];
    if (item.anyPrivilege) return item.anyPrivilege.some((p) => privileges[p]);
    return false;
  });

  return (
    <div>
      {quickAccessItems.length > 0 && (
        <>
          <div className="section-title-mini">Quick access</div>
          <div className="row g-3 mb-4">
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

      {summary ? (
        <>
          <div className="section-title-mini">Recruitment overview</div>
          <div className="stat-row-v2 mb-4">
            <StatTile label="Total Requisitions" value={summary.totalRequisitions} icon="bi-file-earmark-text" colorClass="stat-icon-neutral" />
            <StatTile label="Pending Approval" value={summary.pendingApprovalRequisitions} icon="bi-hourglass-split" colorClass="stat-icon-warn" />
            <StatTile label="Approved" value={summary.approvedRequisitions} icon="bi-check-circle" colorClass="stat-icon-completed" />
            <StatTile label="Fulfilled" value={summary.fulfilledRequisitions} icon="bi-flag-fill" colorClass="stat-icon-progress" />
          </div>
          <div className="stat-row-v2">
            <StatTile label="Total Candidates" value={summary.totalCandidates} icon="bi-people" colorClass="stat-icon-neutral" />
            <StatTile label="Shortlisted" value={summary.shortlistedCandidates} icon="bi-star-fill" colorClass="stat-icon-warn" />
            <StatTile label="Scheduled for Interview" value={summary.scheduledCandidates} icon="bi-calendar-event" colorClass="stat-icon-progress" />
            <StatTile label="Qualified" value={summary.qualifiedCandidates} icon="bi-award-fill" colorClass="stat-icon-completed" />
          </div>
          <div className="stat-row-v2 mt-3" style={{ gridTemplateColumns: "repeat(1, 1fr)", maxWidth: 260 }}>
            <StatTile label="Offers Sent" value={summary.offersSent} icon="bi-envelope-paper-fill" colorClass="stat-icon-purple" />
          </div>
        </>
      ) : (
        <div className="app-card">
          <p className="text-muted m-0">
            Use the navigation on the left to manage job postings, candidates, interviews, and offers.
          </p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

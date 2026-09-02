import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import recruiterApiService from "../../core/recruiterApiService";

const StatCard = ({ label, value, color }) => (
  <div className="col-md-3 mb-3">
    <div className="card p-3 text-center h-100">
      <div className="fs-2 fw-bold" style={{ color: color || "var(--app-primary-color)" }}>{value}</div>
      <div className="text-muted">{label}</div>
    </div>
  </div>
);

const Dashboard = () => {
  const user = useSelector((state) => state.user);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    if (!user.privileges?.JobPostings) return;
    recruiterApiService.getDashboardSummary()
      .then((res) => setSummary(res.data.data))
      .catch(() => setSummary(null));
  }, [user.privileges]);

  return (
    <div>
      <h3 className="mb-4">Welcome, {user.name}</h3>

      {summary ? (
        <div className="row">
          <StatCard label="Total Requisitions" value={summary.totalRequisitions} />
          <StatCard label="Pending Approval" value={summary.pendingApprovalRequisitions} color="#f0ad4e" />
          <StatCard label="Approved" value={summary.approvedRequisitions} color="#28a745" />
          <StatCard label="Fulfilled" value={summary.fulfilledRequisitions} color="#6c757d" />
          <StatCard label="Total Candidates" value={summary.totalCandidates} />
          <StatCard label="Shortlisted" value={summary.shortlistedCandidates} />
          <StatCard label="Scheduled for Interview" value={summary.scheduledCandidates} />
          <StatCard label="Qualified" value={summary.qualifiedCandidates} color="#28a745" />
          <StatCard label="Offers Sent" value={summary.offersSent} />
        </div>
      ) : (
        <div className="card p-4">
          <p className="text-muted m-0">
            Use the navigation above to manage job postings, candidates, interviews, and offers.
          </p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

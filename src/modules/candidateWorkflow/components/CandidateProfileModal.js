import React from "react";
import recruiterApiService from "../../../core/recruiterApiService";

const CandidateProfileModal = ({ candidate, onClose, onShortlist }) => {
  if (!candidate) return null;

  return (
    <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Candidate Profile</h5>
            <button className="btn-close" onClick={onClose} />
          </div>
          <div className="modal-body">
            <table className="table table-borderless mb-0">
              <tbody>
                <tr><td className="fw-bold" style={{ width: 140 }}>Name</td><td>{candidate.name}</td></tr>
                <tr><td className="fw-bold">Phone</td><td>{candidate.phone}</td></tr>
                <tr><td className="fw-bold">Email</td><td>{candidate.email}</td></tr>
                <tr><td className="fw-bold">Status</td><td><span className="badge bg-secondary">{candidate.status}</span></td></tr>
                <tr>
                  <td className="fw-bold">Resume</td>
                  <td>
                    {candidate.hasResume ? (
                      <a href={recruiterApiService.fileUrl(candidate.resumeUrl)} target="_blank" rel="noreferrer">View Resume</a>
                    ) : "-"}
                  </td>
                </tr>
                <tr>
                  <td className="fw-bold">ID Proof</td>
                  <td>
                    {candidate.hasIdProof ? (
                      <a href={recruiterApiService.fileUrl(candidate.idProofUrl)} target="_blank" rel="noreferrer">View ID Proof</a>
                    ) : "-"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>Close</button>
            {candidate.status === "ADDED" && (
              <button className="btn btn-primary" onClick={() => onShortlist(candidate.id)}>Shortlist</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateProfileModal;

import React, { useEffect, useState } from "react";
import recruiterApiService from "../../../core/recruiterApiService";
import { getStatusLabel } from "./CandidatePoolTab";

const CandidateProfileModal = ({ candidate, onClose, onShortlist, onViewFile }) => {
  const [photoUrl, setPhotoUrl] = useState(null);

  useEffect(() => {
    let blobUrl;
    if (candidate?.hasPhoto) {
      recruiterApiService.fetchFileBlobUrl(candidate.photoUrl)
        .then((url) => { blobUrl = url; setPhotoUrl(url); })
        .catch(() => setPhotoUrl(null));
    } else {
      setPhotoUrl(null);
    }
    return () => { if (blobUrl) URL.revokeObjectURL(blobUrl); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidate?.id, candidate?.hasPhoto]);

  if (!candidate) return null;

  return (
    <div className="modal show d-block" style={{ background: "rgba(15,60,30,0.45)" }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Candidate Profile</h5>
            <button className="btn-close" onClick={onClose} />
          </div>
          <div className="modal-body">
            <div className="d-flex align-items-center gap-3 mb-3">
              <div className="candidate-avatar-lg">
                {photoUrl ? (
                  <img src={photoUrl} alt={candidate.name} />
                ) : (
                  <i className="bi bi-person-fill" />
                )}
              </div>
              <div>
                <div className="fw-bold fs-5">{candidate.name}</div>
                <span className="status-pill status-pill-secondary">{getStatusLabel(candidate.status)}</span>
              </div>
            </div>

            <table className="table table-borderless mb-0">
              <tbody>
                <tr><td className="fw-bold" style={{ width: 140 }}>Phone</td><td>{candidate.phone}</td></tr>
                <tr><td className="fw-bold">Email</td><td>{candidate.email}</td></tr>
                <tr>
                  <td className="fw-bold">Resume</td>
                  <td>
                    {candidate.hasResume ? (
                      <button type="button" className="btn btn-link p-0" onClick={() => onViewFile(candidate.resumeUrl, "Resume Preview")}>
                        View Resume
                      </button>
                    ) : "-"}
                  </td>
                </tr>
                <tr>
                  <td className="fw-bold">ID Proof</td>
                  <td>
                    {candidate.hasIdProof ? (
                      <button type="button" className="btn btn-link p-0" onClick={() => onViewFile(candidate.idProofUrl, "ID Proof Preview")}>
                        View ID Proof
                      </button>
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

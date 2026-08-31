import { forwardRef } from "react";
import deleteIcon from "../../../../../assets/delete_icon.png";
import viewIcon from "../../../../../assets/view_icon.png";
import greenCheck from "../../../../../assets/green-check.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload } from "@fortawesome/free-solid-svg-icons";

const UploadField = forwardRef(
  (
    {
      label,
      required,
      file,
      customName,
      customNameValue,
      onCustomNameChange,
      onBrowse,
      onChange,
      onDelete,
      onView,
      disabled = false,
    },
    ref
  ) => {
    const formatFileSize = (bytes) => {
      if (!bytes) return "0 KB";
      return bytes < 1024
        ? `${bytes} B`
        : bytes < 1024 * 1024
          ? `${(bytes / 1024).toFixed(1)} KB`
          : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
      <div className="col-md-6 col-sm-12 mt-3">
        <div className="d-flex align-items-center mb-2">
          <label className="grey-label mb-0">
            {label} {required && <span className="text-danger">*</span>}
          </label>
        </div>

        {/* BEFORE UPLOAD */}
        {!file && (
          <div
            className="border rounded d-flex align-items-center gap-2 px-3"
            style={{
              minHeight: "90px",
              cursor: disabled ? "not-allowed" : "pointer",
              backgroundColor: disabled ? "#f5f5f5" : "#fff",
              borderColor: disabled ? "#d0d0d0" : "#bfc8e2",
              opacity: disabled ? 0.6 : 1,
            }}
            onClick={!disabled ? onBrowse : undefined}
          >
            <FontAwesomeIcon
              icon={faUpload}
              alt="Upload"
              style={{ width: "24px", height: "24px" }}
            />

            <div className="d-flex flex-column" style={{ marginTop: "-10px" }}>
              <div
                className="mt-2"
                style={{
                  color: "#7b7b7b",
                  fontWeight: "500",
                  fontSize: "14px",
                }}
              >
                Click to upload
              </div>
              <div className="text-muted" style={{ fontSize: "12px" }}>
                PDF (Max 2MB)
              </div>
            </div>

            <input
              type="file"
              accept=".pdf"
              style={{ display: "none" }}
              ref={ref}
              onChange={onChange}
            />
          </div>
        )}

        {/* AFTER UPLOAD */}
        {file && (
          <div
            className="uploaded-file-box p-3 d-flex justify-content-between align-items-center"
            style={{
              border: "2px solid #bfc8e2",
              borderRadius: "8px",
              background: "#f7f9fc",
            }}
          >
            <div className="d-flex align-items-center">
              <img
                src={greenCheck}
                alt="Success"
                style={{
                  marginRight: "10px",
                  width: "22px",
                  height: "22px",
                }}
              />

              <div className="p-2">
                <div style={{ fontWeight: 600, color: "#42579f" }}>
                  {file?.name || "Uploaded file"}
                </div>
                <div className="text-muted" style={{ fontSize: "12px" }}>
                  {file?.size && formatFileSize(file.size)}
                </div>
              </div>
            </div>

            <div className="d-flex gap-2">
              <div onClick={onView}>
                <img
                  src={viewIcon}
                  alt="View"
                  style={{ width: "25px", cursor: "pointer" }}
                />
              </div>

              <div onClick={onDelete}>
                <img
                  src={deleteIcon}
                  alt="Delete"
                  style={{ width: "25px", cursor: "pointer" }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

export default UploadField;

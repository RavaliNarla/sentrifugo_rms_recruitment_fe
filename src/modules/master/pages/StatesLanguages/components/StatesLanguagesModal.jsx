import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Modal, Button } from "react-bootstrap";
import { ChevronDown } from "react-bootstrap-icons";
const StatesLanguagesModal = ({
  show,
  handleCloseModal,
  formData = { state: "", languages: [] },
  onChange,
  saveData,
  isViewing,
  isEditing,
  errors = {},
  states = [],
  languages = [],
   isSubmitting
}) => {
  const { t } = useTranslation(["common", "stateLanguages"]);
  const [openDropdown, setOpenDropdown] = useState(false);
  const dropdownRef = useRef(null);
  useEffect(() => {
    setOpenDropdown(false);
  }, [show]);
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const toggleLanguage = (lang) => {
    let updated = [...(formData.languages || [])];

    if (updated.includes(lang)) {
      updated = updated.filter((l) => l !== lang);
    } else {
      updated.push(lang);
    }
    onChange("setLanguages", updated);
  };
  return (
    <Modal show={show} onHide={handleCloseModal} size="lg" centered>
      <Modal.Header closeButton className="modal-header-custom">
        <Modal.Title className="cerhead">
          {isViewing
            ? t("stateLanguages:view")
            : isEditing
              ? t("stateLanguages:edit")
              : t("common:add")}{" "}
          {t("common:stateLanguages")}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="border rounded p-3 mb-3">
          <div className="row g-3">
            {/* STATE */}
            <div className="col-md-5">
              <label className="form-label">
                {t("stateLanguages:state")}{" "}
                <span className="text-danger">*</span>
              </label>
              {isViewing ? (
                <div className="form-control-view">
                  {" "}
                  {states.find((s) => s.stateId === formData.state)
                    ?.stateName || "-"}
                </div>
              ) : (
                <>
                  <select
                    className={`form-select ${errors?.state ? "is-invalid" : ""}`}
                    value={formData.state}
                    onChange={(e) => onChange("state", e.target.value)}
                    style={{
                      paddingRight: "40px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      width: "100%",
                    }}
                  >
                    <option value="">{t("common:select")}</option>
                    {states.map((s) => (
                      <option key={s.stateId} value={s.stateId}>
                        {s.stateName}
                      </option>
                    ))}
                  </select>
                  <small className="text-danger">{errors?.state}</small>
                </>
              )}
            </div>
            {/* LANGUAGES */}
            <div className="col-md-7">
              <label className="form-label">
                {t("stateLanguages:languages")}{" "}
                <span className="text-danger">*</span>
              </label>
              {isViewing ? (
                <div className="form-control-view">
                  {formData.languages
                    ?.map(
                      (id) =>
                        languages.find((l) => l.languageId === id)?.languageName
                    )
                    .filter(Boolean)
                    .join(", ") || "-"}
                </div>
              ) : (
                <>
                  <div className="position-relative" ref={dropdownRef}>
                    <div
                      className={`form-control d-flex align-items-center justify-content-between ${errors?.languages ? "is-invalid" : ""}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenDropdown((prev) => !prev);
                      }}
                      style={{
                        cursor: "pointer",
                        minHeight: "38px",
                      }}
                    >
                      <span
                        style={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: "90%",
                        }}
                        title={
                          formData.languages?.length
                            ? formData.languages
                                .map(
                                  (id) =>
                                    languages.find((l) => l.languageId === id)
                                      ?.languageName
                                )
                                .filter(Boolean)
                                .join(", ")
                            : ""
                        }
                      >
                        {formData.languages?.length
                          ? formData.languages
                              .map(
                                (id) =>
                                  languages.find((l) => l.languageId === id)
                                    ?.languageName
                              )
                              .filter(Boolean)
                              .join(", ")
                          : t("stateLanguages:select_languages")}
                      </span>

                      <span style={{ marginLeft: "10px", flexShrink: 0 }}>
                        <ChevronDown size={14} />
                      </span>
                    </div>
                    {/* DROPDOWN */}
                    {openDropdown && (
                      <div
                        className="border bg-white position-absolute w-100"
                        style={{
                          zIndex: 1000,
                          maxHeight: "200px",
                          overflowY: "auto",
                          top: "100%",
                          left: 0,
                          marginTop: "4px",
                        }}
                      >
                        {languages.map((lang, i) => (
                          <div
                            key={i}
                            className="px-3 py-2 d-flex align-items-center"
                            onClick={() => toggleLanguage(lang.languageId)}
                            style={{ cursor: "pointer" }}
                          >
                            <input
                              type="checkbox"
                              checked={formData.languages?.includes(
                                lang.languageId
                              )}
                              readOnly
                              className="me-2"
                            />
                            {lang.languageName}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <small className="text-danger">{errors?.languages}</small>
                </>
              )}
            </div>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer className="modal-footer-custom">
        <Button
          variant="outline-secondary"
          onClick={() => {
            setOpenDropdown(false);
            handleCloseModal();
          }}
        >
          {isViewing ? t("common:close") : t("common:cancel")}
        </Button>
        {!isViewing && (
          <Button
              variant="primary"
              disabled={isSubmitting}
              onClick={() => {
                if (isSubmitting) return;

                setOpenDropdown(false);
                saveData();
              }}
          >
            {isEditing ? t("common:update") : t("common:save")}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};
export default StatesLanguagesModal;

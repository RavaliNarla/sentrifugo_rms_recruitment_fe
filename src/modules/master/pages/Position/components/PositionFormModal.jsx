// src/modules/master/pages/Position/components/PositionFormModal.jsx
import React from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import ErrorMessage from "../../../../../shared/components/ErrorMessage";
import PositionImportModal from "./PositionImportModal";
import {
  handleValidatedInput,
  INPUT_PATTERNS,
} from "../../../../../shared/utils/inputHandlers";

const handleTwoDigitNumberInput = ({ e, fieldName, handleInputChange }) => {
  let value = e.target.value;

  // Allow only digits
  value = value.replace(/\D/g, "");

  // Limit to 2 characters
  if (value.length > 2) {
    value = value.slice(0, 2);
  }

  handleInputChange({
    target: {
      name: fieldName,
      value,
    },
  });
};

const PositionFormModal = ({
  show,
  onHide,
  isEditing,
  isViewing,
  activeTab,
  setActiveTab,
  formData,
  errors,
  setErrors,
  handleInputChange,
  handleSave,

  /*  DEFAULTS ADDED */
  departments = [],

  jobGrades = [],
  fetchPositions,
  t,
  isSubmitting
}) => {
  const title = isViewing
    ? t("view")
    : isEditing
      ? t("edit_position")
      : t("add_position");

  const isCreateMode = !isViewing && !isEditing;

  const handleSubmit = (e) => {
    if (isViewing) {
      e.preventDefault();
      onHide();
    } else {
      handleSave(e);
    }
  };

  const renderFooter = () => {
    return (
      <Modal.Footer className="modal-footer-custom px-0 pt-3 pb-0">
        <Button variant="outline-secondary" onClick={onHide}>
          {isViewing ? t("close") : t("cancel")}
        </Button>

        {!isViewing && (
          <Button variant="primary" type="submit" disabled={isSubmitting}>
            {isEditing ? t("update") : t("save")}
          </Button>
        )}
      </Modal.Footer>
    );
  };

  const renderContent = () => {
    if (activeTab === "manual") {
      return (
        <Form onSubmit={handleSubmit}>
          <Row className="g-3">
            <Col xs={6}>
              <Form.Group className="form-group">
                <Form.Label>
                  {t("department")} <span className="text-danger">*</span>
                </Form.Label>

                {isViewing ? (
                  <div className="form-control-view">
                    {departments.find((d) => d.id === formData.departmentId)
                      ?.name || "-"}
                  </div>
                ) : (
                  <Form.Select
                    name="departmentId"
                    value={formData.departmentId}
                    onChange={handleInputChange}
                    className="form-control-custom"
                  >
                    <option value="">{t("select_department")}</option>

                    {departments.length > 0 &&
                      departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                  </Form.Select>
                )}

                {!isViewing && (
                  <ErrorMessage>{errors.departmentId}</ErrorMessage>
                )}
              </Form.Group>
            </Col>
            <Col xs={6}>
              <Form.Group className="form-group">
                <Form.Label>
                  {t("position_title")} <span className="text-danger">*</span>
                </Form.Label>

                {isViewing ? (
                  <div className="form-control-view">
                    {formData.title || "-"}
                  </div>
                ) : (
                  <Form.Control
                    name="title"
                    maxLength={200}
                    value={formData.title}
                    placeholder={t("enter_position_title")}
                    className="form-control-custom"
                    onChange={(e) =>
                      handleValidatedInput({
                        e,
                        fieldName: "title",
                        setErrors,
                        pattern: INPUT_PATTERNS.ALPHA_NUMERIC_SPACE_DASH_AMP,
                        errorMessage: t("validation:only_alpha_numeric"),
                        onValidChange: (value) =>
                          handleInputChange({
                            target: { name: "title", value },
                          }),
                      })
                    }
                  />
                )}

                {!isViewing && <ErrorMessage>{errors.title}</ErrorMessage>}
              </Form.Group>
            </Col>
            <Col xs={4} md={6}>
              <Form.Group className="form-group">
                <Form.Label>
                  {t("job_grade")} <span className="text-danger">*</span>
                </Form.Label>

                {isViewing ? (
                  <div className="form-control-view">
                    {jobGrades.find((g) => g.id === formData.jobGradeId)
                      ?.gradeCode || "-"}
                  </div>
                ) : (
                  <Form.Select
                    name="jobGradeId"
                    value={formData.jobGradeId}
                    onChange={handleInputChange}
                    className="form-control-custom"
                  >
                    <option value="">{t("select_job_grade")}</option>
                    {jobGrades.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.gradeCode}
                      </option>
                    ))}
                  </Form.Select>
                )}

                {!isViewing && <ErrorMessage>{errors.jobGradeId}</ErrorMessage>}
              </Form.Group>
            </Col>

            {/* Min / Max Age */}
            <Col xs={6} md={6}>
              <Form.Group className="form-group">
                <Form.Label>
                  {t("min_age")} <span className="text-danger">*</span>
                </Form.Label>

                {isViewing ? (
                  <div className="form-control-view">
                    {formData.eligibilityAgeMin || "-"}
                  </div>
                ) : (
                  <Form.Control
                    type="text"
                    inputMode="numeric"
                    name="eligibilityAgeMin"
                    value={formData.eligibilityAgeMin ?? ""}
                    placeholder={t("enter_min_age")}
                    className="form-control-custom"
                    onChange={(e) =>
                      handleTwoDigitNumberInput({
                        e,
                        fieldName: "eligibilityAgeMin",
                        handleInputChange,
                      })
                    }
                  />
                )}

                {!isViewing && (
                  <ErrorMessage>{errors.eligibilityAgeMin}</ErrorMessage>
                )}
              </Form.Group>
            </Col>

            <Col xs={6} md={6}>
              <Form.Group className="form-group">
                <Form.Label>
                  {t("max_age")} <span className="text-danger">*</span>
                </Form.Label>

                {isViewing ? (
                  <div className="form-control-view">
                    {formData.eligibilityAgeMax || "-"}
                  </div>
                ) : (
                  <Form.Control
                    type="text"
                    inputMode="numeric"
                    name="eligibilityAgeMax"
                    value={formData.eligibilityAgeMax ?? ""}
                    placeholder={t("enter_max_age")}
                    className="form-control-custom"
                    onChange={(e) =>
                      handleTwoDigitNumberInput({
                        e,
                        fieldName: "eligibilityAgeMax",
                        handleInputChange,
                      })
                    }
                  />
                )}

                {!isViewing && (
                  <ErrorMessage>{errors.eligibilityAgeMax}</ErrorMessage>
                )}
              </Form.Group>
            </Col>

            <Col xs={6} md={6}>
              <Form.Group className="form-group">
                <Form.Label>
                  {t("mandatory_experience")}{" "}
                  <span className="text-danger">*</span>
                </Form.Label>

                {isViewing ? (
                  <div
                    className="form-control-view manscroll"
                    style={{ whiteSpace: "pre-line" }}
                  >
                    {formData.mandatoryExperience || "-"}
                  </div>
                ) : (
                  <Form.Control
                    as="textarea"
                    maxLength={2000}
                    rows={2}
                    name="mandatoryExperience"
                    value={formData.mandatoryExperience}
                    placeholder={t("enter_mandatory_experience")}
                    className="form-control-custom"
                    onChange={(e) =>
                      handleValidatedInput({
                        e,
                        fieldName: "mandatoryExperience",
                        setErrors,
                        pattern: INPUT_PATTERNS.TEXTAREA_BASIC,
                        errorMessage: t(
                          "validation:invalid_mandatory_experience"
                        ),
                        onValidChange: (value) =>
                          handleInputChange({
                            target: { name: "mandatoryExperience", value },
                          }),
                      })
                    }
                  />
                )}

                {!isViewing && (
                  <ErrorMessage>{errors.mandatoryExperience}</ErrorMessage>
                )}
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group className="form-group">
                <Form.Label>{t("preferred_experience")}</Form.Label>

                {isViewing ? (
                  <div
                    className="form-control-view manscroll"
                    style={{ whiteSpace: "pre-line" }}
                  >
                    {formData.preferredExperience || "NA"}
                  </div>
                ) : (
                  <Form.Control
                    as="textarea"
                    maxLength={2000}
                    rows={2}
                    name="preferredExperience"
                    value={formData.preferredExperience}
                    placeholder={t("enter_preferred_experience")}
                    className="form-control-custom"
                    onChange={(e) =>
                      handleValidatedInput({
                        e,
                        fieldName: "preferredExperience",
                        setErrors,
                        pattern: INPUT_PATTERNS.TEXTAREA_BASIC,
                        errorMessage: t(
                          "validation:invalid_preferred_experience"
                        ),
                        onValidChange: (value) =>
                          handleInputChange({
                            target: { name: "preferredExperience", value },
                          }),
                      })
                    }
                  />
                )}

                {!isViewing && (
                  <ErrorMessage>{errors.preferredExperience}</ErrorMessage>
                )}
              </Form.Group>
            </Col>

            <Col xs={6}>
              <Form.Group className="form-group">
                <Form.Label>
                  {t("roles_responsibilities")}{" "}
                  <span className="text-danger">*</span>
                </Form.Label>

                {isViewing ? (
                  <div
                    className="form-control-view manscroll"
                    style={{ whiteSpace: "pre-line" }}
                  >
                    {formData.rolesResponsibilities || "-"}
                  </div>
                ) : (
                  <Form.Control
                    as="textarea"
                    rows={2}
                    maxLength={2000}
                    name="rolesResponsibilities"
                    value={formData.rolesResponsibilities}
                    placeholder={t("enter_roles_responsibilities")}
                    className="form-control-custom"
                    onChange={(e) =>
                      handleValidatedInput({
                        e,
                        fieldName: "rolesResponsibilities",
                        setErrors,
                        pattern: INPUT_PATTERNS.TEXTAREA_BASIC,
                        errorMessage: t(
                          "validation:invalid_roles_responsibilities"
                        ),
                        onValidChange: (value) =>
                          handleInputChange({
                            target: { name: "rolesResponsibilities", value },
                          }),
                      })
                    }
                  />
                )}

                {!isViewing && (
                  <ErrorMessage>{errors.rolesResponsibilities}</ErrorMessage>
                )}
              </Form.Group>
            </Col>
          </Row>

          {renderFooter()}
        </Form>
      );
    }

    return (
      <PositionImportModal
        t={t}
        onClose={onHide}
        onSuccess={async () => {
          await fetchPositions();
          setActiveTab("manual");
        }}
      />
    );
  };
  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      centered
      className="user-modal pos"
      fullscreen="sm-down"
      scrollable
    >
      <Modal.Header closeButton className="modal-header-custom">
        <div>
          <Modal.Title>{title}</Modal.Title>

          {isCreateMode && (
            <p className="mb-0 small text-muted para">
              {t("choose_add_method")}
            </p>
          )}
        </div>
      </Modal.Header>

      <Modal.Body className="p-4">
        {isCreateMode && (
          <div className="tab-buttons mb-4">
            <Button
              variant={activeTab === "manual" ? "light" : "outline-light"}
              className={`tab-button ${activeTab === "manual" ? "active" : ""}`}
              onClick={() => setActiveTab("manual")}
            >
              {t("manual_entry")}
            </Button>

            <Button
              variant={activeTab === "import" ? "light" : "outline-light"}
              className={`tab-button ${activeTab === "import" ? "active" : ""}`}
              onClick={() => setActiveTab("import")}
            >
              {t("import_file")}
            </Button>
          </div>
        )}

        {renderContent()}
      </Modal.Body>
    </Modal>
  );
};

export default PositionFormModal;

// src/modules/master/pages/JobGrade/components/JobGradeFormModal.jsx

import React, { useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import ErrorMessage from "../../../../../shared/components/ErrorMessage";
import JobGradeImportModal from "./JobGradeImportModal";
import {
  handleValidatedInput,
  INPUT_PATTERNS,
} from "../../../../../shared/utils/inputHandlers";

const formatSalary = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === "" ||
    Number(value) === 0
  ) {
    return "";
  }

  const raw = String(value).replace(/,/g, "");
  if (isNaN(raw)) return "";

  return Number(raw).toLocaleString("en-IN");
};

const JobGradeFormModal = ({
  show,
  onHide,
  isEditing,
  isViewing,
  activeTab,
  setActiveTab,
  formData,
  setFormData,
  handleInputChange,
  errors,
  setErrors,
  handleSave,
  editingId,
  t,
  ...importProps
}) => {
  const title = isViewing ? t("view") : isEditing ? t("edit") : t("added");

  const isCreateMode = !isViewing && !isEditing;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async (e) => {
  if (isViewing) {
    e.preventDefault();
    onHide();
    return;
  }

  if (isSubmitting) return;

  try {
    setIsSubmitting(true);
    await handleSave(e);
  } finally {
    setIsSubmitting(false);
  }
};

  const renderContent = () => {
    if (activeTab === "manual") {
      return (
        <Form onSubmit={handleSubmit}>
          <Row className="g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>
                  {t("scale")} <span className="text-danger">*</span>
                </Form.Label>
                {isViewing ? (
                  <div className="form-control-view">
                    {formData.scale || "-"}
                  </div>
                ) : (
                  <Form.Control
                    name="scale"
                    value={formData.scale}
                    maxLength={200}
                    className="form-control-custom"
                    placeholder={t("jobGrade:enter_scale")}
                    onChange={(e) =>
                      handleValidatedInput({
                        e,
                        fieldName: "scale",
                        setFormData,
                        setErrors,
                        pattern: INPUT_PATTERNS.ALPHA_NUMERIC_SPACE,
                        errorMessage: t("validation:invalid_scale"),
                      })
                    }
                  />
                )}
                {!isViewing && <ErrorMessage>{errors.scale}</ErrorMessage>}
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>
                  {t("gradeCode")} <span className="text-danger">*</span>
                </Form.Label>

                {isViewing ? (
                  <div className="form-control-view">
                    {formData.gradeCode || "-"}
                  </div>
                ) : (
                  <Form.Control
                    name="gradeCode"
                    maxLength={200}
                    value={formData.gradeCode || ""}
                    className="form-control-custom"
                    placeholder={t("jobGrade:enter_grade_code")}
                    onChange={(e) =>
                      handleValidatedInput({
                        e,
                        fieldName: "gradeCode",
                        setFormData,
                        setErrors,
                        pattern: INPUT_PATTERNS.ALPHA_NUMERIC_SPACE,
                        errorMessage: t("validation:invalid_grade_code"),
                      })
                    }
                  />
                )}

                {!isViewing && <ErrorMessage>{errors.gradeCode}</ErrorMessage>}
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>
                  {t("minSalary")} <span className="text-danger">*</span>
                </Form.Label>

                {isViewing ? (
                  <div className="form-control-view">
                    {formatSalary(formData.minSalary) || "-"}
                  </div>
                ) : (
                  <Form.Control
                    name="minSalary"
                    maxLength={10}
                    value={formatSalary(formData.minSalary)}
                    className="form-control-custom"
                    placeholder={t("jobGrade:enter_min_salary")}
                    onChange={(e) => {
                      const rawValue = e.target.value
                        .replace(/,/g, "")
                        .replace(/\D/g, "");

                      handleValidatedInput({
                        e: { target: { value: rawValue } },
                        fieldName: "minSalary",
                        setFormData,
                        setErrors,
                        pattern: INPUT_PATTERNS.NUMBERS_ONLY,
                        errorMessage: t("validation:invalid_salary"),
                      });
                    }}
                  />
                )}
                {!isViewing && <ErrorMessage>{errors.minSalary}</ErrorMessage>}
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>{t("maxSalary")}</Form.Label>

                {isViewing ? (
                  <div className="form-control-view">
                    {formatSalary(formData.maxSalary) || "-"}
                  </div>
                ) : (
                  <Form.Control
                    name="maxSalary"
                    maxLength={10}
                    value={formatSalary(formData.maxSalary)}
                    className="form-control-custom"
                    placeholder={t("jobGrade:enter_max_salary")}
                    onChange={(e) => {
                      const rawValue = e.target.value
                        .replace(/,/g, "")
                        .replace(/\D/g, "");

                      // ✅ allow empty value
                      if (rawValue === "") {
                        setFormData((prev) => ({
                          ...prev,
                          maxSalary: "",
                        }));

                        setErrors((prev) => {
                          const copy = { ...prev };
                          delete copy.maxSalary;
                          return copy;
                        });
                        return;
                      }

                      handleValidatedInput({
                        e: { target: { value: rawValue } },
                        fieldName: "maxSalary",
                        setFormData,
                        setErrors,
                        pattern: INPUT_PATTERNS.NUMBERS_ONLY,
                        errorMessage: t("validation:invalid_salary"),
                      });
                    }}
                  />
                )}
              </Form.Group>
            </Col>

            <Col xs={12}>
              <Form.Group>
                <Form.Label>
                  {t("description")} <span className="text-danger">*</span>
                </Form.Label>

                {isViewing ? (
                  <div
                    className="form-control-view"
                    style={{ whiteSpace: "pre-line" }}
                  >
                    {formData.description || "-"}
                  </div>
                ) : (
                  <Form.Control
                    as="textarea"
                    rows={3}
                    maxLength={2000}
                    name="description"
                    value={formData.description}
                    //onChange={handleInputChange}
                    onChange={(e) =>
                        handleValidatedInput({
                          e,
                          fieldName: "description",
                          setFormData,
                          setErrors,
                          pattern: INPUT_PATTERNS.DESCRIPTION,
                          errorMessage: t("validation:invalid_description"),
                        })
                      }
                    className="form-control-custom"
                    placeholder={t("jobGrade:enter_description")}
                  />
                )}
                {!isViewing && (
                  <ErrorMessage>{errors.description}</ErrorMessage>
                )}
              </Form.Group>
            </Col>
          </Row>

          {renderFooter()}
        </Form>
      );
    }

    return <JobGradeImportModal t={t} {...importProps} onClose={onHide} />;
  };

  const renderFooter = () => {
    if (isViewing) {
      return (
        <Modal.Footer className="px-0 pt-3 pb-0 modal-footer-custom">
          <Button variant="outline-secondary" onClick={onHide}>
            {t("close")}
          </Button>
        </Modal.Footer>
      );
    }

    return (
      <Modal.Footer className="px-0 pt-3 pb-0 modal-footer-custom">
        <Button variant="outline-secondary" onClick={onHide}>
          {t("cancel")}
        </Button>

        <Button variant="primary" type="submit" disabled={isSubmitting}>
          {t("save")}
        </Button>
      </Modal.Footer>
    );
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      centered
      className="user-modal"
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
              className={`tab-button ${activeTab === "manual" ? "active" : ""}`}
              variant={activeTab === "manual" ? "light" : "outline-light"}
              onClick={() => setActiveTab("manual")}
            >
              {t("manual_entry")}
            </Button>

            <Button
              className={`tab-button ${activeTab === "import" ? "active" : ""}`}
              variant={activeTab === "import" ? "light" : "outline-light"}
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

export default JobGradeFormModal;

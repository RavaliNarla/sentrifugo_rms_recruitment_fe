import React from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import ErrorMessage from "../../../../../shared/components/ErrorMessage";
import DepartmentImportView from "../components/DepartmentImportModal";
import {
  handleValidatedInput,
  INPUT_PATTERNS,
} from "../../../../../shared/utils/inputHandlers";
const DepartmentFormModal = (props) => {
  const {
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
    isSubmitting,
    t,
    ...importProps
  } = props;

  const getModalTitle = (isViewing, isEditing, t) => {
    if (isViewing) return t("viewDepartment");
    if (isEditing) return t("editDepartment");
    return t("addDepartment");
  };
  const getSubmitHandler = (isViewing, onHide, handleSave) => {
    if (isViewing) {
      return (e) => {
        e.preventDefault();
        onHide();
      };
    }
    return handleSave;
  };
  const title = getModalTitle(isViewing, isEditing, t);
  const isCreateMode = !isEditing && !isViewing;
  const onSubmitHandler = getSubmitHandler(isViewing, onHide, handleSave);

  const renderContent = () => {
    if (activeTab === "manual") {
      return (
        <Form onSubmit={onSubmitHandler}>
          <Row className="g-3">
            <Col xs={12}>
              <Form.Group className="form-group">
                <Form.Label>
                  {t("name")}{" "}
                  {!isViewing && <span className="text-danger">*</span>}
                </Form.Label>

                {isViewing ? (
                  <div className="form-control-view">
                    {formData.name || "-"}
                  </div>
                ) : (
                  <Form.Control
                    name="name"
                    maxLength={200}
                    value={formData.name}
                    className="form-control-custom"
                    placeholder={t("department:enterName")}
                    onChange={(e) =>
                      handleValidatedInput({
                        e,
                        fieldName: "name",
                        setFormData,
                        setErrors,
                        pattern:
                          INPUT_PATTERNS.ALPHA_NUMERIC_SPACE_ambersent_Dash_underscore_at,
                        errorMessage: t("validation:no_special_charss"),
                      })
                    }
                  />
                )}
                {!isViewing && <ErrorMessage>{errors.name}</ErrorMessage>}
              </Form.Group>
            </Col>

            <Col xs={12}>
              <Form.Group className="form-group">
                <Form.Label>
                  {t("description")}{" "}
                  {!isViewing && <span className="text-danger">*</span>}
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
                    className="form-control-custom"
                    value={formData.description}
                   // onChange={handleInputChange}
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
                    placeholder={t("department:enterDescription")}
                    readOnly={isViewing}
                  />
                )}
                {!isViewing && (
                  <ErrorMessage>{errors.description}</ErrorMessage>
                )}
              </Form.Group>
            </Col>
          </Row>

          <Modal.Footer className="px-0 pt-3 pb-0 modal-footer-custom">
            <Button variant="outline-secondary" onClick={onHide}>
              {isViewing ? t("close") : t("cancel")}
            </Button>

            {!isViewing && (
              <Button variant="primary" type="submit" disabled={isSubmitting}>
                {isEditing ? t("updateDepartment") : t("save")}
              </Button>
            )}
          </Modal.Footer>
        </Form>
      );
    }

    return (
      <DepartmentImportView
        t={t}
        onClose={onHide}
        onSuccess={importProps.onSuccess}
      />
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

export default DepartmentFormModal;

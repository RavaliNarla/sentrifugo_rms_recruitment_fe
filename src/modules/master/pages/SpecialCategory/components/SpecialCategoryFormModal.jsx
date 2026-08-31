// src/modules/master/pages/SpecialCategory/components/SpecialCategoryFormModal.jsx
import {
  handleValidatedInput,
  INPUT_PATTERNS,
} from "../../../../../shared/utils/inputHandlers";
import React from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import ErrorMessage from "../../../../../shared/components/ErrorMessage";
import SpecialCategoryImportModal from "./SpecialCategoryImportModal";

const SpecialCategoryFormModal = ({
  show,
  onHide,
  isEditing,
  isViewing,
  activeTab,
  setActiveTab,
  formData,
  setFormData,
  errors,
  setErrors,
  handleSave,
  t,
  ...importProps
}) => {
  const isCreateMode = !isEditing && !isViewing;
  const handleFormSubmit = (e) => {
    if (isViewing) {
      e.preventDefault();
      onHide();
    } else {
      handleSave(e);
    }
  };
  const renderField = (name, value, placeholder, pattern, errorMessage) => {
    if (isViewing) {
      return <div className="form-control-view">{value || "-"}</div>;
    }

    return (
      <Form.Control
        name={name}
        value={value}
        placeholder={placeholder}
        className="form-control-custom"
        onChange={(e) =>
          handleValidatedInput({
            e,
            fieldName: name,
            setFormData,
            setErrors,
            pattern,
            errorMessage,
          })
        }
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
          <Modal.Title>
            {isViewing ? t("view") : isEditing ? t("edit") : t("added")}
          </Modal.Title>
          {isCreateMode && (
            <p className="small text-muted para">{t("choose_add_method")}</p>
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

        {activeTab === "manual" ? (
          <Form onSubmit={handleFormSubmit}>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>
                    {t("code")} <span className="text-danger">*</span>
                  </Form.Label>

                  {renderField(
                    "code",
                    formData.code,
                    t("enter_code"),
                    INPUT_PATTERNS.ALPHA_NUMERIC_SPACE,
                    t("validation:no_special_charses")
                  )}

                  {!isViewing && <ErrorMessage>{errors.code}</ErrorMessage>}
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>
                    {t("name")} <span className="text-danger">*</span>
                  </Form.Label>

                  {renderField(
                    "name",
                    formData.name,
                    t("enter_name"),
                    INPUT_PATTERNS.ALPHA_NUMERIC_SPACE_ambersent_Dash_underscore_at,
                    t("validation:no_special_charsess")
                  )}

                  {!isViewing && <ErrorMessage>{errors.name}</ErrorMessage>}
                </Form.Group>
              </Col>

              <Col xs={12}>
                <Form.Group>
                  <Form.Label>
                    {t("description")} <span className="text-danger">*</span>
                  </Form.Label>

                  {/* {renderDescription()} */}

                  {!isViewing && (
                    <ErrorMessage>{errors.description}</ErrorMessage>
                  )}
                </Form.Group>
              </Col>
            </Row>

            <Modal.Footer className="modal-footer-custom px-0 pt-3 pb-0">
              <Button variant="outline-secondary" onClick={onHide}>
                {isViewing ? t("close") : t("cancel")}
              </Button>

              {!isViewing && (
                <Button variant="primary" type="submit">
                  {isEditing ? t("update") : t("save")}
                </Button>
              )}
            </Modal.Footer>
          </Form>
        ) : (
          <>
            <SpecialCategoryImportModal
              t={t}
              onClose={onHide}
              onSuccess={importProps.onSuccess}
            />
          </>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default SpecialCategoryFormModal;

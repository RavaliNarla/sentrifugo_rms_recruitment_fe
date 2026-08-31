// src/modules/master/pages/Document/components/DocumentFormModal.jsx

import React from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import ErrorMessage from "../../../../../shared/components/ErrorMessage";
import {
  handleValidatedInput,
  INPUT_PATTERNS,
} from "../../../../../shared/utils/inputHandlers";

const DocumentFormModal = ({
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
  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      centered
      className="user-modal"
    >
      <Modal.Header closeButton className="modal-header-custom">
        <Modal.Title>
          {isViewing ? t("view") : isEditing ? t("edit") : t("added")}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-4">
        {/*  Manual Entry Form – shown by default */}
        <Form
          onSubmit={
            isViewing
              ? (e) => {
                  e.preventDefault();
                  onHide();
                }
              : handleSave
          }
        >
          <Row className="g-3">
            <Col xs={12}>
              <Form.Group>
                <Form.Label>
                  {t("document_name")} <span className="text-danger">*</span>
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
                    placeholder={t("enter_document_name")}
                    onChange={(e) =>
                      handleValidatedInput({
                        e,
                        fieldName: "name",
                        setFormData,
                        setErrors,
                        pattern: INPUT_PATTERNS.ALPHA_NUMERIC_SPACE,
                        errorMessage: t("validation:no_special_charsees"),
                      })
                    }
                  />
                )}

                {!isViewing && <ErrorMessage>{errors.name}</ErrorMessage>}
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
                    maxLength={2000}
                    rows={3}
                    name="description"
                    value={formData.description}
                    className="form-control-custom"
                    placeholder={t("enter_description")}
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
                  />
                )}

                {!isViewing && (
                  <ErrorMessage>{errors.description}</ErrorMessage>
                )}
              </Form.Group>
            </Col>
            <Col xs={12}>
              <Form.Group>
                <div className="d-flex align-items-center gap-2">
                  {/*  Checkbox */}
                  <Form.Check
                    type="checkbox"
                    disabled={isViewing}
                    checked={!!formData.isRequiredConfirmed}
                    onChange={(e) => {
                      if (isViewing) return;

                      setFormData((prev) => ({
                        ...prev,
                        isRequiredConfirmed: e.target.checked,
                      }));

                      if (errors.isRequiredConfirmed) {
                        setErrors((prev) => ({
                          ...prev,
                          isRequiredConfirmed: null,
                        }));
                      }
                    }}
                  />

                  {/*  Label text (same style as other labels) */}
                  <Form.Label className="mb-0">
                    {t("documents:confirm_required")}
                  </Form.Label>
                </div>

                {/*  Error message */}
                {!isViewing && (
                  <ErrorMessage>{errors.isRequiredConfirmed}</ErrorMessage>
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
      </Modal.Body>
    </Modal>
  );
};

export default DocumentFormModal;

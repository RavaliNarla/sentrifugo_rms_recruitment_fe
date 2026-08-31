// src/modules/master/pages/Category/components/CategoryFormModal.jsx
import {
  handleValidatedInput,
  INPUT_PATTERNS,
} from "../../../../../shared/utils/inputHandlers";
import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import ErrorMessage from "../../../../../shared/components/ErrorMessage";
import { validateCategoryForm } from "../../../../../shared/utils/category-validations";
import CategoryImportModal from "./CategoryImportModal";
const CategoryFormModal = ({
  show,
  onHide,
  isEditing,
  isViewing,
  editingCategory,
  onSave,
  onUpdate,
  onImport,

  //  IMPORTANT: pass categories list from parent
  categories = [],
  ...importProps
}) => {
  const { t } = useTranslation(["category"]);

  const [activeTab, setActiveTab] = useState("manual");
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
  });
  const [errors, setErrors] = useState({});

  /* ---------------- LOAD EDIT DATA ---------------- */
  useEffect(() => {
    if (editingCategory) {
      setFormData({
        code: editingCategory.code || "",
        name: editingCategory.name || "",
        description: editingCategory.description || "",
      });
    } else {
      setFormData({ code: "", name: "", description: "" });
    }

    setErrors({});
    setActiveTab("manual");
  }, [editingCategory, show]);

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = (e) => {
    e.preventDefault();
    const { valid, errors: vErrors } = validateCategoryForm(formData, {
      existing: categories,
      currentId: isEditing ? editingCategory?.id : null, //  THIS LINE FIXES IT
    });

    if (!valid) {
      setErrors(vErrors);
      return;
    }

    if (isEditing) {
      onUpdate(editingCategory.id, formData);
    } else {
      onSave(formData);
    }

    onHide();
  };

  const title = isViewing
    ? t("view_category")
    : isEditing
      ? t("edit_category")
      : t("add_category");

  const isCreateMode = !isEditing && !isViewing;
  const handleFormSubmit = (e) => {
    if (isViewing) {
      e.preventDefault();
      onHide();
    } else {
      handleSubmit(e);
    }
  };

  const renderContent = () => {
    if (activeTab === "manual") {
      return (
        <Form onSubmit={handleFormSubmit}>
          <Row className="g-3">
            <Col md={6}>
              <Form.Label>
                {t("code")} <span className="text-danger">*</span>
              </Form.Label>
              {isViewing ? (
                <div className="form-control-view">{formData.code || "-"}</div>
              ) : (
                <Form.Control
                  name="code"
                  maxLength={200}
                  value={formData.code}
                  placeholder={t("enter_code")}
                  className="form-control-custom"
                  onChange={(e) =>
                    handleValidatedInput({
                      e,
                      fieldName: "code",
                      setFormData,
                      setErrors,
                      pattern: INPUT_PATTERNS.ALPHA_NUMERIC_SPACE,
                      errorMessage: t("validation:no_special_charses"),
                    })
                  }
                />
              )}
              {!isViewing && <ErrorMessage>{errors.code}</ErrorMessage>}
            </Col>

            <Col md={6}>
              <Form.Label>
                {t("name")} <span className="text-danger">*</span>
              </Form.Label>
              {isViewing ? (
                <div className="form-control-view">{formData.name || "-"}</div>
              ) : (
                <Form.Control
                  name="name"
                  maxLength={200}
                  value={formData.name}
                  placeholder={t("enter_name")}
                  className="form-control-custom"
                  onChange={(e) =>
                    handleValidatedInput({
                      e,
                      fieldName: "name",
                      setFormData,
                      setErrors,
                      pattern:
                        INPUT_PATTERNS.ALPHA_NUMERIC_SPACE_ambersent_Dash_underscore_at,
                      errorMessage: t("validation:no_special_charsess"),
                    })
                  }
                />
              )}
              {!isViewing && <ErrorMessage>{errors.name}</ErrorMessage>}
            </Col>

            <Col md={12}>
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
                  placeholder={t("enter_description")}
                  className="form-control-custom"
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
              {!isViewing && <ErrorMessage>{errors.description}</ErrorMessage>}
            </Col>
          </Row>

          <Modal.Footer className="px-0 pt-4 modal-footer-custom">
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
      );
    }

    return (
      <CategoryImportModal
        onImport={onImport}
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
      {/* ---------------- HEADER ---------------- */}
      <Modal.Header closeButton className="modal-header-custom">
        <div>
          <Modal.Title>{title}</Modal.Title>
          {isCreateMode && (
            <p className="mb-0 small text-muted">{t("choose_add_method")}</p>
          )}
        </div>
      </Modal.Header>

      {/* ---------------- BODY ---------------- */}
      <Modal.Body className="p-4">
        {/* -------- Tabs (Add Only) -------- */}
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

        {/* -------- MANUAL ENTRY -------- */}
        {renderContent()}
      </Modal.Body>
    </Modal>
  );
};

export default CategoryFormModal;

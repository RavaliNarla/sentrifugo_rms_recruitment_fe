import React from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { Upload } from "react-bootstrap-icons";
import { useTranslation } from "react-i18next";
import ErrorMessage from "../../../../../shared/components/ErrorMessage";

const GenericOrAnnexuresFormModal = ({
  show,
  onHide,
  isEditing,
  isViewing,
  formData,
  handleInputChange,
  errors,
  setErrors,
  handleSave,
}) => {
  const { t } = useTranslation(["genericOrAnnexures"]);
  const isTypeSelected = !!formData?.type;
  const MAX_PDF_SIZE = 5 * 1024 * 1024; // 5 MB
  const handleFormSubmit = (e) => {
    if (isViewing) {
      e.preventDefault();
      onHide();
    } else {
      handleSave(e);
    }
  };

  const handleFileClick = () => {
    if (isTypeSelected) {
      document.getElementById("pdfUpload").click();
    }
  };
  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      centered
      className="user-modal"
    >
      {/* ===== HEADER ===== */}
      <Modal.Header closeButton className="modal-header-custom">
        <div>
          <Modal.Title>
            {isViewing
              ? t("view", "View Generic / Annexures")
              : isEditing
                ? t("edit", "Edit Generic / Annexures")
                : t("addgenAnn", "Add Generic / Annexures")}
          </Modal.Title>

          {!isViewing && (
            <p className="mb-0 small text-muted para">
              {t("choose_add_method", "Select type and upload PDF")}
            </p>
          )}
        </div>
      </Modal.Header>

      {/* ===== BODY ===== */}
      <Modal.Body className="p-4">
        <Form onSubmit={handleFormSubmit}>
          <Row className="g-3">
            {/* ===== TYPE FIELD (REQUIRED) ===== */}
            <Col xs={12}>
              <Form.Group className="form-group">
                <Form.Label>
                  {t("type", "Type")}{" "}
                  {!isViewing && <span className="text-danger">*</span>}
                </Form.Label>

                {isViewing ? (
                  <div className="form-control-view">
                    {formData?.type || "-"}
                  </div>
                ) : (
                  <Form.Select
                    name="type"
                    value={formData?.type || ""}
                    onChange={handleInputChange}
                    className="form-control-custom"
                  >
                    <option value="">{t("select_type", "Select Type")}</option>
                    <option value="Generic">{t("generic", "Generic")}</option>
                    <option value="Annexures">
                      {t("annexures", "Annexures")}
                    </option>
                  </Form.Select>
                )}

                {!isViewing && <ErrorMessage>{errors?.type}</ErrorMessage>}
              </Form.Group>
            </Col>

            {/* ===== PDF UPLOAD (TEXT FIELD STYLE, REQUIRED) ===== */}
            <Col xs={12}>
              <Form.Group className="form-group">
                <Form.Label>
                  {t("upload_pdf", "Upload PDF")}{" "}
                  {!isViewing && <span className="text-danger">*</span>}
                </Form.Label>

                {isViewing ? (
                  <div className="form-control-view">
                    {formData?.file?.name || "-"}
                  </div>
                ) : (
                  <>
                    {/* hidden file input */}
                    <input
                      type="file"
                      id="pdfUpload"
                      name="file"
                      accept="application/pdf"
                      hidden
                      disabled={!isTypeSelected}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        //  file too large
                        if (file.size > MAX_PDF_SIZE) {
                          setErrors((prev) => ({
                            ...prev,
                            file: t(
                              "pdf_size_5mb",
                              "PDF size must be less than or equal to 5 MB"
                            ),
                          }));

                          // clear file from formData
                          handleInputChange({
                            target: {
                              name: "file",
                              value: null,
                            },
                          });

                          e.target.value = "";
                          return;
                        }
                        handleInputChange({
                          target: {
                            name: "file",
                            value: file,
                          },
                        });

                        // clear file error
                        setErrors((prev) => {
                          const copy = { ...prev };
                          delete copy.file;
                          return copy;
                        });
                      }}
                    />

                    {/* visible text-field style uploader */}
                    <div
                      className={`form-control-custom d-flex align-items-center justify-content-between ${
                        !isTypeSelected ? "disabled" : ""
                      }`}
                      style={{
                        cursor: isTypeSelected ? "pointer" : "not-allowed",
                      }}
                      onClick={handleFileClick}
                    >
                      <span className="text-muted">
                        {formData?.file?.name || t("upload_pdf", "Upload PDF")}
                      </span>
                      <Upload size={18} />
                    </div>
                  </>
                )}

                {!isViewing && <ErrorMessage>{errors?.file}</ErrorMessage>}
              </Form.Group>
            </Col>
          </Row>

          {/* ===== FOOTER ===== */}
          <Modal.Footer className="px-0 pt-3 pb-0 modal-footer-custom">
            <Button variant="outline-secondary" onClick={onHide}>
              {isViewing ? t("close", "Close") : t("cancel", "Cancel")}
            </Button>

            {!isViewing && (
              <Button variant="primary" type="submit">
                {isEditing ? t("update", "Update") : t("save", "Save")}
              </Button>
            )}
          </Modal.Footer>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default GenericOrAnnexuresFormModal;

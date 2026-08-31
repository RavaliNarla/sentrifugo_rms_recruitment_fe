import React, { useState } from "react";
import { Container, Form, Button } from "react-bootstrap";
import { Search, Plus } from "react-bootstrap-icons";
import { useTranslation } from "react-i18next";
import { useDocuments } from "./hooks/useDocuments";
import DocumentTable from "./components/DocumentTable";
import DocumentFormModal from "./components/DocumentFormModal";
import DeleteConfirmModal from "./components/DeleteConfirmModal";
import { validateDocumentForm } from "../../../../shared/utils/document-validations";
import { mapDocumentToApi } from "./mappers/documentMapper";
import "../../../../style/css/user.css";

const DocumentPage = () => {
  const { t } = useTranslation(["documents", "validation"]);

  const {
    documents,
    fetchDocuments,
    addDocument,
    updateDocument,
    deleteDocument,
  } = useDocuments();

  // UI states
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [activeTab, setActiveTab] = useState("manual");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isRequiredConfirmed: false,
  });
  const [errors, setErrors] = useState({});

  const [isViewing, setIsViewing] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  /* ---------- handlers ---------- */
  const openViewModal = (doc) => {
    setIsViewing(true);
    setIsEditing(false);
    setEditingId(null);

    setFormData({
      name: doc.name,
      description: doc.description || "",
      isRequiredConfirmed: doc.isRequiredConfirmed ?? false,
    });

    setErrors({});
    setActiveTab("manual");
    setShowAddModal(true);
  };

  const openAddModal = () => {
    setIsViewing(false);
    setIsEditing(false);
    setEditingId(null);
    setFormData({ name: "", description: "", isRequiredConfirmed: false });
    setErrors({});
    setActiveTab("manual");
    setShowAddModal(true);
  };

  const openEditModal = (doc) => {
    setIsViewing(false); //  RESET VIEW MODE
    setIsEditing(true); //  ENABLE EDIT MODE
    setEditingId(doc.id);
    setFormData({
      name: doc.name,
      description: doc.description || "",
      isRequiredConfirmed: doc.isRequiredConfirmed ?? false,
    });

    setErrors({});
    setActiveTab("manual");
    setShowAddModal(true);
  };
  const handleSave = async (e) => {
    e.preventDefault();
    // 2️ Other validations
    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      isRequired: formData.isRequiredConfirmed,
      isEditable: true,
      isActive: true,
    };

    const { valid, errors: vErrors } = validateDocumentForm(payload, {
      existing: documents,
      currentId: isEditing ? editingId : null,
    });

    if (!valid) {
      setErrors(vErrors);
      return;
    }
    const apiPayload = mapDocumentToApi(payload);

    // 3️ Save
    if (isEditing) {
      await updateDocument(editingId, apiPayload);
    } else {
      await addDocument(apiPayload);
    }

    setShowAddModal(false);
  };

  return (
    <Container fluid className="user-container">
      <div className="user-header">
        <h2>{t("documents:title")}</h2>

        <div className="user-actions">
          <div className="search-box">
            <Search className="search-icon" />
            <Form.Control
              placeholder={t("documents:search_placeholder")}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="search-input"
            />
          </div>

          <Button className="add-button" onClick={openAddModal}>
            <Plus size={20} /> {t("documents:add")}
          </Button>
        </div>
      </div>
      <DocumentTable
        data={documents}
        searchTerm={searchTerm}
        onEdit={openEditModal}
        onView={openViewModal}
        onDelete={(d) => {
          setDeleteTarget(d);
          setShowDeleteModal(true);
        }}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        itemsPerPage={itemsPerPage}
        setItemsPerPage={setItemsPerPage}
      />
      <DocumentFormModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        isEditing={isEditing}
        isViewing={isViewing}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        formData={formData}
        setFormData={setFormData}
        errors={errors}
        setErrors={setErrors}
        handleSave={handleSave}
        t={t}
        onSuccess={() => {
          fetchDocuments(); // refresh list immediately
          setShowAddModal(false); // ensure modal closes
        }}
      />
      <DeleteConfirmModal
        show={showDeleteModal}
        target={deleteTarget}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={() => {
          deleteDocument(deleteTarget.id);
          setShowDeleteModal(false);
        }}
      />
    </Container>
  );
};

export default DocumentPage;

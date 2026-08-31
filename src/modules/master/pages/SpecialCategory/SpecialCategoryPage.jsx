import React, { useState } from "react";
import { Container, Form, Button } from "react-bootstrap";
import { Search, Plus } from "react-bootstrap-icons";
import { useTranslation } from "react-i18next";

import { useSpecialCategories } from "./hooks/useSpecialCategories";
import SpecialCategoryTable from "./components/SpecialCategoryTable";
import SpecialCategoryFormModal from "./components/SpecialCategoryFormModal";
import DeleteConfirmModal from "./components/DeleteConfirmModal";
import "../../../../style/css/user.css";

import { validateSpecialCategoryForm } from "../../../../shared/utils/specialcategory-validations";
import { mapSpecialCategoryToApi } from "./mappers/specialCategoryMapper";

const SpecialCategoryPage = () => {
  const { t } = useTranslation(["specialCategory"]);

  const {
    categories,
    fetchCategories,
    addCategory,
    updateCategory,
    deleteCategory,
  } = useSpecialCategories();

  // UI states
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isViewing, setIsViewing] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [activeTab, setActiveTab] = useState("manual");
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
  });
  const [errors, setErrors] = useState({});
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const openView = (row) => {
    setIsViewing(true);
    setIsEditing(false);
    setEditingId(null);

    setFormData({
      code: row.code || "",
      name: row.name || "",
      description: row.description || "",
    });

    setErrors({});
    setActiveTab("manual");
    setShowModal(true);
  };
  /* ===================== ADD ====================== */
  const openAdd = () => {
    setIsViewing(false);
    setIsEditing(false);
    setEditingId(null);
    setFormData({ code: "", name: "", description: "" });
    setErrors({});
    setActiveTab("manual");
    setShowModal(true);
  };

  /* ===================== EDIT (IMPORTANT FIX) ====================== */
  const openEdit = (row) => {
    setIsEditing(true);
    setIsViewing(false);
    setEditingId(row.id);

    setFormData({
      code: row.code || "",
      name: row.name || "",
      description: row.description || "",
    });

    setErrors({});
    setActiveTab("manual");
    setShowModal(true);
  };

  /* =====================  SAVE ====================== */
  const handleSave = (e) => {
    e.preventDefault();

    const { valid, errors: vErrors } = validateSpecialCategoryForm(formData, {
      existing: categories,
      currentId: isEditing ? editingId : null,
    });

    if (!valid) {
      setErrors(vErrors);
      return;
    }

    setErrors({});

    const payload = mapSpecialCategoryToApi(formData, { id: editingId });

    if (isEditing) {
      //  EDIT → update existing row
      updateCategory(editingId, payload);
    } else {
      //  ADD → create new row
      addCategory(payload);
    }

    setShowModal(false);
  };
  /* ===================== IMPORT ====================== */

  return (
    <Container fluid className="user-container">
      {/* Header */}
      <div className="user-header">
        <h2>{t("title")}</h2>

        <div className="user-actions">
          <div className="search-box">
            <Search className="search-icon" />
            <Form.Control
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t("search_placeholder")}
              className="search-input"
            />
          </div>

          <Button className="add-button" onClick={openAdd}>
            <Plus size={20} /> {t("add")}
          </Button>
        </div>
      </div>

      {/* Table */}
      <SpecialCategoryTable
        data={categories}
        searchTerm={searchTerm}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        itemsPerPage={itemsPerPage}
        setItemsPerPage={setItemsPerPage}
        onView={openView}
        onEdit={openEdit}
        onDelete={(row) => {
          setDeleteTarget(row);
          setShowDeleteModal(true);
        }}
      />

      {/* Add / Edit Modal */}
      <SpecialCategoryFormModal
        show={showModal}
        onHide={() => setShowModal(false)}
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
        //  ADD THIS
        onSuccess={() => {
          fetchCategories(); // refresh list immediately
          setShowModal(false); // ensure modal closes
        }}
      />

      {/* Delete Confirm Modal */}
      <DeleteConfirmModal
        show={showDeleteModal}
        target={deleteTarget}
        title="Delete Special Category"
        message="Are you sure you want to delete this special category?"
        onHide={() => setShowDeleteModal(false)}
        onConfirm={() => {
          deleteCategory(deleteTarget.id);
          setShowDeleteModal(false);
        }}
      />
    </Container>
  );
};

export default SpecialCategoryPage;

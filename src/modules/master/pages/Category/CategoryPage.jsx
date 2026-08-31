// CategoryPage.jsx
import React, { useState } from "react";
import { Container, Form, Button } from "react-bootstrap";
import { Search, Plus } from "react-bootstrap-icons";
import { useTranslation } from "react-i18next";

import { useCategories } from "./hooks/useCategories";
import CategoryTable from "./components/CategoryTable";
import CategoryFormModal from "./components/CategoryFormModal";
import DeleteConfirmModal from "./components/DeleteConfirmModal";
import "../../../../style/css/user.css";

const CategoryPage = () => {
  const { t } = useTranslation(["category"]);

  const {
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    importCategories,
    fetchCategories,
  } = useCategories();

  // UI state
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const openAddModal = () => {
    setIsViewing(false);
    setIsEditing(false);
    setEditingCategory(null);
    setShowModal(true);
  };

  const openEditModal = (cat) => {
    setIsViewing(false);
    setIsEditing(true);
    setEditingCategory(cat);
    setShowModal(true);
  };

  const openViewModal = (cat) => {
    setIsViewing(true);
    setIsEditing(false);
    setEditingCategory(cat);
    setShowModal(true);
  };

  const [isViewing, setIsViewing] = useState(false);

  return (
    <Container fluid className="user-container">
      <div className="user-header">
        <h2>{t("categories")}</h2>

        <div className="user-actions">
          <div className="search-box">
            <Search className="search-icon" />
            <Form.Control
              placeholder={t("search_placeholder")}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="search-input"
            />
          </div>

          <Button className="add-button" onClick={openAddModal}>
            <Plus size={20} /> {t("add")}
          </Button>
        </div>
      </div>

      <CategoryTable
        data={categories}
        searchTerm={searchTerm}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        itemsPerPage={itemsPerPage}
        setItemsPerPage={setItemsPerPage}
        onEdit={openEditModal}
        onView={openViewModal}
        onDelete={(cat) => {
          setDeleteTarget(cat);
          setShowDeleteModal(true);
        }}
      />

      <CategoryFormModal
        show={showModal}
        onHide={() => setShowModal(false)}
        isEditing={isEditing}
        isViewing={isViewing}
        editingCategory={editingCategory}
        onSave={addCategory}
        onUpdate={updateCategory}
        onImport={importCategories}
        categories={categories}
        //  ADD THIS
        onSuccess={() => {
          fetchCategories();
          // refresh list immediately
          setShowModal(false); // ensure modal closes
        }}
      />

      <DeleteConfirmModal
        show={showDeleteModal}
        target={deleteTarget}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteCategory(deleteTarget.id);
          setShowDeleteModal(false);
        }}
      />
    </Container>
  );
};

export default CategoryPage;

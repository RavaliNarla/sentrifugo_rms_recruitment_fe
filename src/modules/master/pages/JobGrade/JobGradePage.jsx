import React, { useState } from "react";
import { Container, Form, Button } from "react-bootstrap";
import { Search, Plus } from "react-bootstrap-icons";
import { useTranslation } from "react-i18next";

import { useJobGrades } from "./hooks/useJobGrades";
import JobGradeTable from "./components/JobGradeTable";
import JobGradeFormModal from "./components/JobGradeFormModal";
import DeleteConfirmModal from "./components/DeleteConfirmModal";

import { validateJobGradeForm } from "../../../../shared/utils/jobgrade-validations";
import { mapJobGradeToApi } from "./mappers/jobGradeMapper";
import "../../../../style/css/user.css";

const JobGradePage = () => {
  const { t } = useTranslation(["jobGrade", "validation"]);

  const {
    jobGrades,
    addJobGrade,
    updateJobGrade,
    deleteJobGrade,
    fetchJobGrades,
  } = useJobGrades();

  // UI state
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("manual");
  const [isViewing, setIsViewing] = useState(false);

  const [formData, setFormData] = useState({
    scale: "",
    gradeCode: "",
    minSalary: "",
    maxSalary: "",
    description: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const openAddModal = () => {
    setIsViewing(false);
    setIsEditing(false);
    setFormData({
      scale: "",
      gradeCode: "",
      minSalary: "",
      maxSalary: "",
      description: "",
    });
    setErrors({}); //  CLEAR OLD ERRORS
    setActiveTab("manual");
    setShowAddModal(true);
  };
  const openViewModal = (row) => {
    setIsViewing(true);
    setIsEditing(false);

    setFormData({
      scale: row.scale ?? "",
      gradeCode: row.gradeCode ?? "",
      minSalary: row.minSalary ?? "",
      maxSalary: row.maxSalary ?? "",
      description: row.description ?? "",
    });

    setActiveTab("manual");
    setShowAddModal(true);
  };

  const openEditModal = (row) => {
    setIsViewing(false);
    setIsEditing(true);
    setEditingId(row.id);
    setFormData({
      scale: row.scale ?? "",
      gradeCode: row.gradeCode ?? "",
      minSalary: row.minSalary ?? "",
      maxSalary: row.maxSalary ?? "",
      description: row.description ?? "",
    });
    setErrors({}); //  CLEAR OLD ERRORS
    setActiveTab("manual");
    setShowAddModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const { valid, errors: vErrors } = validateJobGradeForm(formData, {
      existing: jobGrades,
      currentId: isEditing ? editingId : null,
    });

    if (!valid) return setErrors(vErrors);

    const payload = mapJobGradeToApi(formData);

    if (isEditing) {
      await updateJobGrade(editingId, payload);
    } else {
      await addJobGrade(payload);
      setCurrentPage(1);
    }

    setShowAddModal(false);
  };

  const searchableFields = [
    "scale",
    "gradeCode",
    "minSalary",
    "maxSalary",
    "description",
  ];

  const filteredJobGrades = jobGrades.filter((j) =>
    searchableFields.some((key) =>
      String(j[key] ?? "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    )
  );
  return (
    <Container fluid className="user-container">
      <div className="user-header">
        <h2>{t("jobGrade:title")}</h2>

        <div className="user-actions">
          <div className="search-box">
            <Search className="search-icon" />
            <Form.Control
              placeholder={t("jobGrade:search_placeholder")}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="search-input"
            />
          </div>

          <Button className="add-button" onClick={openAddModal}>
            <Plus size={20} /> {t("jobGrade:add")}
          </Button>
        </div>
      </div>

      <JobGradeTable
        data={filteredJobGrades}
        searchTerm={searchTerm}
        onEdit={openEditModal}
        onView={openViewModal}
        onDelete={(row) => {
          setDeleteTarget(row);
          setShowDeleteModal(true);
        }}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
      />

      <JobGradeFormModal
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
        handleInputChange={(e) => {
          const { name, value } = e.target;

          setFormData((prev) => ({
            ...prev,
            [name]: value,
          }));

          //  clear error for this field only
          setErrors((prev) => ({
            ...prev,
            [name]: "",
          }));
        }}
        handleSave={handleSave}
        t={t}
        fetchJobGrades={fetchJobGrades}
      />

      <DeleteConfirmModal
        show={showDeleteModal}
        target={deleteTarget}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={() => {
          deleteJobGrade(deleteTarget.id);
          setShowDeleteModal(false);
        }}
      />
    </Container>
  );
};

export default JobGradePage;

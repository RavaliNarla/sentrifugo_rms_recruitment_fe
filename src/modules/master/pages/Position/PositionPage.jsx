// src/modules/master/pages/Position/PositionPage.jsx
import React, { useState } from "react";
import { Container, Form, Button } from "react-bootstrap";
import { Search, Plus } from "react-bootstrap-icons";
import { useTranslation } from "react-i18next";
import { usePositions } from "./hooks/usePositions";
import PositionTable from "./components/PositionTable";
import PositionFormModal from "./components/PositionFormModal";
import DeleteConfirmModal from "./components/DeleteConfirmModal";
import { validatePositionForm } from "../../../../shared/utils/position-validations";
import { mapPositionToApi } from "./mappers/positionMapper";
import "../../../../style/css/user.css";
import { useDepartments } from "../Department/hooks/useDepartments";
import { useJobGrades } from "../JobGrade/hooks/useJobGrades";

const PositionPage = () => {
  const { t } = useTranslation(["position"]);
  const {
    positions,
    addPosition,
    updatePosition,
    deletePosition,
    fetchPositions,
  } = usePositions();

  /* ---------------- UI STATE ---------------- */
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [activeTab, setActiveTab] = useState("manual");
  const [isViewing, setIsViewing] = useState(false);
const [isSubmitting, setIsSubmitting] = useState(false);
  /* ---------------- FORM STATE ---------------- */
  const [formData, setFormData] = useState({
    departmentId: "",
    title: "",
    jobGradeId: "",
    mandatoryExperience: "",
    preferredExperience: "",
    rolesResponsibilities: "",
    eligibilityAgeMin: "",
    eligibilityAgeMax: "",
  });
  const [errors, setErrors] = useState({});

  /* ---------------- HANDLERS ---------------- */

  const openViewModal = (p) => {
    setIsViewing(true);
    setIsEditing(false);
    setEditingId(p.id);

    setFormData({
      departmentId: p.departmentId || "",
      title: p.title || "",
      jobGradeId: p.jobGradeId || "",
      mandatoryEducation: p.mandatoryEducation || "",
      preferredEducation: p.preferredEducation || "",
      mandatoryExperience: p.mandatoryExperience || "",
      preferredExperience: p.preferredExperience || "",
      rolesResponsibilities: p.rolesResponsibilities || "",
      eligibilityAgeMin: p.eligibilityAgeMin ?? "",
      eligibilityAgeMax: p.eligibilityAgeMax ?? "",
    });

    setErrors({});
    setActiveTab("manual");
    setShowAddModal(true);
  };

  const openAddModal = () => {
    setIsEditing(false);
    setIsViewing(false);
    setShowAddModal(true);
    setEditingId(null);
    setFormData({
      departmentId: "",
      title: "",
      jobGradeId: "",
      mandatoryExperience: "",
      preferredExperience: "",
      rolesResponsibilities: "",
      code: "",
      eligibilityAgeMin: "",
      eligibilityAgeMax: "",
    });
    setErrors({});
    setActiveTab("manual");
    setShowAddModal(true);
  };

  const { departments } = useDepartments();
  const { jobGrades } = useJobGrades();

  const openEditModal = (p) => {
    setIsViewing(false);
    setIsEditing(true);
    setEditingId(p.id);
    setFormData({
      departmentId: p.departmentId || "",
      title: p.title || "",
      jobGradeId: p.jobGradeId || "",

      mandatoryExperience: p.mandatoryExperience || "",
      preferredExperience: p.preferredExperience || "",

      rolesResponsibilities: p.rolesResponsibilities || "",
      code: p.code || "",
      eligibilityAgeMin: p.eligibilityAgeMin ?? "",
      eligibilityAgeMax: p.eligibilityAgeMax ?? "",
    });

    setErrors({});
    setActiveTab("manual");
    setShowAddModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
if (isSubmitting) return; // Prevent double click
    // TRIM TEXT FIELDS HERE (single source of truth)
    const cleanedFormData = {
      ...formData,
      title: formData.title?.trim(),
      mandatoryExperience: formData.mandatoryExperience?.trim(),
      preferredExperience: formData.preferredExperience?.trim(),
      rolesResponsibilities: formData.rolesResponsibilities?.trim(),
    };

    const { valid, errors: vErrors } = validatePositionForm(cleanedFormData, {
      existing: positions,
      currentId: isEditing ? editingId : null,
    });

    if (!valid) {
      setErrors(vErrors);
      return;
    }
  try {
  setIsSubmitting(true);
    const payload = mapPositionToApi(
      { ...cleanedFormData, id: editingId },
      isEditing
    );

    if (isEditing) {
      await updatePosition(editingId, payload);
    } else {
      await addPosition(payload);
      setCurrentPage(1);
    }

    setShowAddModal(false);
    }catch (err) {
    console.error("Save failed", err);
  } finally {
    setIsSubmitting(false);
  }
  };
  return (
    <Container fluid className="user-container">
      <div className="user-header">
        <h2>{t("positions")}</h2>

        <div className="user-actions">
          {/*  SEARCH BAR – SAME AS DEPARTMENT */}
          <div className="search-box">
            <Search className="search-icon" />
            <Form.Control
              placeholder={t("search_placeholder")}
              value={searchTerm}
              className="search-input"
              onChange={(e) => {
                const value = e.target.value;
                setSearchTerm(value);
              }}
            />
          </div>

          <Button className="add-button" onClick={openAddModal}>
            <Plus size={20} /> {t("add")}
          </Button>
        </div>
      </div>

      <PositionTable
        data={positions}
        searchTerm={searchTerm}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
        onView={openViewModal}
        onEdit={openEditModal}
        onDelete={(p) => {
          setDeleteTarget(p);
          setShowDeleteModal(true);
        }}
        t={t}
      />

      <PositionFormModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        isViewing={isViewing}
        isEditing={isEditing}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        formData={formData}
        errors={errors}
        setErrors={setErrors}
        isSubmitting={isSubmitting}
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
        departments={departments}
        jobGrades={jobGrades}
        t={t}
        fetchPositions={fetchPositions}
      />

      <DeleteConfirmModal
        show={showDeleteModal}
        target={deleteTarget}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={() => {
          deletePosition(deleteTarget.id);
          setShowDeleteModal(false);
        }}
      />
    </Container>
  );
};

export default PositionPage;

import React, { useState } from "react";
import { Container, Button, Form } from "react-bootstrap";
import { Plus, Search } from "react-bootstrap-icons";
import { useTranslation } from "react-i18next";

import { useCertifications } from "./hooks/useCertifications";
import CertificationTable from "./components/CertificationTable";
import CertificationFormModal from "./components/CertificationFormModal";
import DeleteConfirmModal from "./components/DeleteConfirmModal";
import "../../../../style/css/user.css";

const CertificationPage = () => {
  const { t } = useTranslation(["certification"]);

  const {
    certifications,
    fetchCertifications,
    addCertification,
    updateCertification,
    deleteCertification,
  } = useCertifications();

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [selectedCertification, setSelectedCertification] = useState(null);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  /* ---------- ADD ---------- */
  const openAdd = () => {
    setSelectedCertification(null);
    setIsEditing(false);
    setIsViewing(false);
    setShowModal(true);
  };

  /* ---------- EDIT ---------- */
  const openEdit = (row) => {
    setSelectedCertification(row); //  full mapped object
    setIsEditing(true);
    setIsViewing(false);
    setShowModal(true);
  };

  /* ---------- VIEW ---------- */
  const openView = (row) => {
    setSelectedCertification(row); //  full mapped object
    setIsEditing(false);
    setIsViewing(true);
    setShowModal(true);
  };

  return (
    <Container fluid className="user-container">
      <div className="user-header">
        <h2>{t("certifications")}</h2>

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

          <Button className="add-button" onClick={openAdd}>
            <Plus size={20} /> {t("add")}
          </Button>
        </div>
      </div>

      <CertificationTable
        data={certifications}
        searchTerm={searchTerm}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        itemsPerPage={itemsPerPage}
        setItemsPerPage={setItemsPerPage}
        onEdit={openEdit}
        onView={openView}
        onDelete={(row) => {
          setDeleteTarget(row);
          setShowDelete(true);
        }}
      />
      <CertificationFormModal
        show={showModal}
        onHide={() => setShowModal(false)}
        isEditing={isEditing}
        isViewing={isViewing}
        editingCertification={selectedCertification}
        certifications={certifications}
        onSave={addCertification}
        onUpdate={updateCertification}
        onSuccess={fetchCertifications}
      />

      <DeleteConfirmModal
        show={showDelete}
        target={deleteTarget}
        onHide={() => {
          setShowDelete(false);
          setDeleteTarget(null);
        }}
        onConfirm={() => {
          deleteCertification(deleteTarget.id);
          setShowDelete(false);
          setDeleteTarget(null);
        }}
      />
    </Container>
  );
};

export default CertificationPage;

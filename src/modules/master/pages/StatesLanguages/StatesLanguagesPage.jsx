import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import { Search, Plus } from "react-bootstrap-icons";
import StatesLanguagesModal from "../../../master/pages/StatesLanguages/components/StatesLanguagesModal";
import StatesLanguagesTable from "../../../master/pages/StatesLanguages/components/StatesLanguagesTable";
import { useStateLanguages } from "../../../master/pages/StatesLanguages/hooks/useStateLanguages";
import { useTranslation } from "react-i18next";
const StatesLanguagesPage = () => {
  const { t } = useTranslation(["common", "stateLanguages"]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const {
    stateLangList,
    showModal,
    searchTerm,
    formData,
    errors,
    isEditMode,
    isViewing,
    states,
    languages,
    setSearchTerm,
    handleAddClick,
    handleCloseModal,
    saveStateLanguage,
    handleEditClick,
    handleViewClick,
    handleChange,
    isSubmitting
  } = useStateLanguages();
  return (
    <div className="px-4 py-3 border rounded user-container">
      <div className="user-header d-flex justify-content-between align-items-center mb-3">
        <h2>{t("common:stateLanguages")}</h2>
        <div className="user-actions">
          <div className="search-box">
            <Search className="search-icon" />
            <Form.Control
              placeholder={t("stateLanguages:search_by_state")}
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button className="add-button" onClick={handleAddClick}>
            <Plus size={20} /> {t("common:add")}
          </Button>
        </div>
      </div>
      <StatesLanguagesTable
        data={stateLangList}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
        onEdit={handleEditClick}
        onView={handleViewClick}
         isSubmitting={isSubmitting}
      />
      <StatesLanguagesModal
        show={showModal}
        handleCloseModal={handleCloseModal}
        formData={formData}
        onChange={handleChange}
        saveData={saveStateLanguage}
        isViewing={isViewing}
        isEditing={isEditMode}
        errors={errors}
        states={states}
        languages={languages}
      />
    </div>
  );
};

export default StatesLanguagesPage;

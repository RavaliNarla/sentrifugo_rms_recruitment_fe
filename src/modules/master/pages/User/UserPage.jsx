import React, { useState } from "react";
import { Container, Form, Button } from "react-bootstrap";
import { Search, Plus } from "react-bootstrap-icons";
import { useTranslation } from "react-i18next";
import "../../../../style/css/user.css";
import { useUsers } from "./hooks/useUsers";
import UserTable from "./components/UserTable";
import UserFormModal from "./components/UserFormModal";
import DeleteConfirmModal from "./components/DeleteConfirmModal";

const UserPage = () => {
  const { t } = useTranslation(["user", "validation"]);
  const {
    users,
    loading,
    fetchUsers,
    addUser,
    updateUser,
    deleteUser,
    interviewCentres,
    bulkAddUsers,
    downloadUserTemplate,
  } = useUsers();

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const [showModal, setShowModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [mode, setMode] = useState("add"); // add | edit | view
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const openAdd = () => {
    setSelectedUser(null);
    setMode("add");
    setShowModal(true);
  };

  const openViewModal = (row) => {
    setSelectedUser(row);
    setMode("view");
    setShowModal(true);
  };

  const openEditModal = (row) => {
    setSelectedUser(row);
    setMode("edit");
    setShowModal(true);
  };

  return (
    <Container fluid className="user-container">
      <div className="user-header">
        <h2>{t("users")}</h2>

        <div className="user-actions">
          <div className="search-box">
            <Search className="search-icon" />

            <Form.Control
              placeholder={t("search_by_user")}
              value={searchTerm}
              onChange={(e) => {
                const value = e.target.value;

                setSearchTerm(value);
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

      <UserTable
        data={users}
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
        interviewCentres={interviewCentres}
      />
      <UserFormModal
        show={showModal}
        onHide={() => setShowModal(false)}
        mode={mode}
        selectedUser={selectedUser}
        onSave={async (data) => {
          if (mode === "edit") {
            await updateUser(selectedUser.userId, data);
          } else {
            await addUser(data);
          }

          setShowModal(false);
          setCurrentPage(1);
        }}
        existingUsers={users}
        interviewCentres={interviewCentres}
        fetchUsers={fetchUsers}
        bulkAddUsers={bulkAddUsers}
        downloadUserTemplate={downloadUserTemplate}
        loading={loading}
      />

      <DeleteConfirmModal
        show={showDeleteModal}
        target={deleteTarget}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={() => {
          deleteUser(deleteTarget.userId);
          setShowDeleteModal(false);
        }}
      />
    </Container>
  );
};

export default UserPage;

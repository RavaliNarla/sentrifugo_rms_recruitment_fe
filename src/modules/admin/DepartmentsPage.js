import React from "react";
import NamedMasterCrudPage from "../../shared/NamedMasterCrudPage";
import masterApiService from "../../core/masterApiService";

const DepartmentsPage = () => (
  <NamedMasterCrudPage
    title="Department"
    getAll={masterApiService.searchDepartments}
    add={masterApiService.addDepartment}
    update={masterApiService.updateDepartment}
    remove={masterApiService.deleteDepartment}
  />
);

export default DepartmentsPage;

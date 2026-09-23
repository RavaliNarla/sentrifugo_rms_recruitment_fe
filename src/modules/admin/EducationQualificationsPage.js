import React from "react";
import NamedMasterCrudPage from "../../shared/NamedMasterCrudPage";
import masterApiService from "../../core/masterApiService";

const EducationQualificationsPage = () => (
  <NamedMasterCrudPage
    title="Education Qualification"
    getAll={masterApiService.searchEducationQualifications}
    add={masterApiService.addEducationQualification}
    update={masterApiService.updateEducationQualification}
    remove={masterApiService.deleteEducationQualification}
  />
);

export default EducationQualificationsPage;

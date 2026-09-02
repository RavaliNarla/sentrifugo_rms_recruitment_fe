import React from "react";
import NamedMasterCrudPage from "../../shared/NamedMasterCrudPage";
import masterApiService from "../../core/masterApiService";

const PositionTitlesPage = () => (
  <NamedMasterCrudPage
    title="Position Title"
    getAll={masterApiService.getPositionTitles}
    add={masterApiService.addPositionTitle}
    update={masterApiService.updatePositionTitle}
    remove={masterApiService.deletePositionTitle}
  />
);

export default PositionTitlesPage;

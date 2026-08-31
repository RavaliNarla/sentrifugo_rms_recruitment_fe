// src/modules/master/pages/Document/mappers/documentMapper.js
import { cleanData } from "../../../../../shared/utils/common-validations";
export const mapDocumentFromApi = (api) => ({
  id: api.documentTypeId,
  name: api.documentName,
  description: api.documentDesc,
  isRequiredConfirmed: api.isRequired,
  isActive: api.isActive,
});

// LIST
export const mapDocumentsFromApi = (apiData = []) => {
  if (!Array.isArray(apiData)) return [];
  return apiData.map(mapDocumentFromApi);
};

export const mapDocumentToApi = (formData) => ({
  documentName: cleanData(formData.name),
  documentDesc: cleanData(formData.description),
  isRequired: formData.isRequired,
  isEditable: true,
  isActive: true,
});

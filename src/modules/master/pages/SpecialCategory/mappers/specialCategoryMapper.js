import { cleanData } from "../../../../../shared/utils/common-validations";

export const mapSpecialCategoryFromApi = (api) => ({
  id: api.specialCategoryId,
  code: api.specialCategoryCode,
  name: api.specialCategoryName,
  description: api.specialCategoryDesc,
  createdDate: api.createdDate,
  isActive: api.isActive,
});

export const mapSpecialCategoriesFromApi = (list = []) =>
  list.map(mapSpecialCategoryFromApi);

export const mapSpecialCategoryToApi = (ui, options = {}) => {
  const { id = null } = options;

  return {
    specialCategoryId: id,
    isActive: true,
    specialCategoryCode: cleanData(ui.code),
    specialCategoryName: cleanData(ui.name),
    specialCategoryDesc: cleanData(ui.description),
  };
};

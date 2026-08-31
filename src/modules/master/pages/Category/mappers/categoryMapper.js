// src/modules/master/pages/Category/mappers/categoryMapper.js

import { cleanData } from "../../../../../shared/utils/common-validations";

/* =========================
   API → UI
========================= */
export const mapCategoryFromApi = (api) => ({
  id: api.reservationCategoriesId,
  code: api.categoryCode,
  name: api.categoryName,
  description: api.categoryDesc,
  createdDate: api.createdDate,
  isActive: api.isActive,
});

export const mapCategoriesFromApi = (list = []) => {
  if (!Array.isArray(list)) return [];
  return list.map(mapCategoryFromApi);
};

/* =========================
   UI → API
========================= */
export const mapCategoryToApi = (ui, options = {}) => {
  const { id = null } = options;

  return {
    reservationCategoriesId: id,
    isActive: true,
    categoryCode: cleanData(ui.code),
    categoryName: cleanData(ui.name),
    categoryDesc: cleanData(ui.description),
  };
};

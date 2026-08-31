import { cleanData } from "../../../../../shared/utils/common-validations";

// SINGLE
export const mapLocationFromApi = (apiLoc, cityMap = {}) => ({
  id: apiLoc.locationId, // UUID
  name: apiLoc.locationName,
  cityId: apiLoc.cityId, // UUID
  cityName: cityMap[apiLoc.cityId] || "—",
  createdDate: apiLoc.createdDate,
  isActive: apiLoc.isActive,
});

// LIST
export const mapLocationsFromApi = (apiData = [], cities = []) => {
  if (!Array.isArray(apiData)) return [];

  const cityMap = {};
  cities.forEach((c) => {
    cityMap[c.id] = c.name;
  });

  return apiData.map((loc) => mapLocationFromApi(loc, cityMap));
};

// UI → API
export const mapLocationToApi = (uiLoc) => ({
  cityId: cleanData(uiLoc.cityId), // UUID string (DO NOT Number())
  locationName: cleanData(uiLoc.name),
});

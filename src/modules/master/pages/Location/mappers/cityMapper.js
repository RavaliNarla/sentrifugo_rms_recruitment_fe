import { cleanData } from "../../../../../shared/utils/common-validations";

export const mapCitiesFromApi = (apiData = []) => {
  if (!Array.isArray(apiData)) return [];

  return apiData.map((city) => ({
    id: cleanData(city.cityId), // UUID
    name: cleanData(city.cityName),
  }));
};

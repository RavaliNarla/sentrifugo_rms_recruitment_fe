import { cleanData } from "../../../../../shared/utils/common-validations";

/* ---------- API → UI ---------- */
export const mapCertificationFromApi = (api) => ({
  id: api.certificationMasterId,
  name: api.certificationName,
  description: api.certificationDesc,
});

/* ---------- API LIST → UI LIST ---------- */
export const mapCertificationsFromApi = (list = []) =>
  list.map(mapCertificationFromApi);

/* ---------- UI → API ---------- */
export const mapCertificationToApi = (ui, options = {}) => {
  const { id = null } = options;

  return {
    certificationId: id,
    isActive: true,
    certificationCode: cleanData(ui.code),
    certificationName: cleanData(ui.name),
    certificationDesc: cleanData(ui.description),
  };
};

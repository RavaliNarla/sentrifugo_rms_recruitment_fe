export const mapJobPositionFromApi = (api = {}, positionMap = {}) => {
  return {
    positionId: api.id ?? api.positionId ?? null,
    vacancies: api.totalVacancies ?? api.vacancies ?? 0,
    minAge: api.eligibilityAgeMin ?? null,
    maxAge: api.eligibilityAgeMax ?? null,
    mandatoryEducation: api.mandatoryEducation ?? "",
    preferredEducation: api.preferredEducation ?? "",
    raw: api,
  };
};

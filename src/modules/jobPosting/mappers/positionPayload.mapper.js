/* ================= STATE DISTRIBUTION ================= */

export const mapStateDistribution = ({
  currentState,
  reservationCategories,
  disabilityCategories,
  isProficientInLocalLanguage,
}) => {
  const distributions = [];

  reservationCategories.forEach((cat) => {
    const count = Number(currentState.categories?.[cat.code] || 0);
    if (count > 0) {
      distributions.push({
        reservationCategoryId: cat.id,
        disabilityCategoryId: null,
        vacancyCount: count,
        isDisability: false,
      });
    }
  });

  disabilityCategories.forEach((dis) => {
    const count = Number(currentState.disabilities?.[dis.disabilityCode] || 0);
    if (count > 0) {
      distributions.push({
        reservationCategoryId: null,
        disabilityCategoryId: dis.id,
        vacancyCount: count,
        isDisability: true,
      });
    }
  });

  return {
    stateId: currentState.state,
    cityId: currentState.city,
    totalVacancies: Number(currentState.vacancies),
    localLanguage: currentState.language,
    isProficientInLocalLanguage:
      isProficientInLocalLanguage === true ? true : false,
    positionCategoryDistributions: distributions,
  };
};

/* ================= NATIONAL DISTRIBUTION ================= */

export const mapNationalCategoryDistribution = ({
  nationalCategories,
  nationalDisabilities,
  reservationCategories,
  disabilityCategories,
}) => {
  const distributions = [];

  reservationCategories.forEach((cat) => {
    const count = Number(nationalCategories[cat.code] || 0);
    if (count > 0) {
      distributions.push({
        reservationCategoryId: cat.id,
        disabilityCategoryId: null,
        vacancyCount: count,
        isDisability: false,
      });
    }
  });

  disabilityCategories.forEach((dis) => {
    const count = Number(nationalDisabilities[dis.disabilityCode] || 0);
    if (count > 0) {
      distributions.push({
        reservationCategoryId: null,
        disabilityCategoryId: dis.id,
        vacancyCount: count,
        isDisability: true,
      });
    }
  });

  return distributions;
};

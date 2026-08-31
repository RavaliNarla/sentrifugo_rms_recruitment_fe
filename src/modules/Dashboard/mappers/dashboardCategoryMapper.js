export const mapDashboardCategory = (data = {}) => {
  const categoryDistribution = data?.categoryDistribution || [];

  return categoryDistribution.map((item) => ({
    code: item.category_code,
    name: item.category_name,
    count: item.candidate_count,
  }));
};

export const mapStateVacancyDistribution = (data = {}) => {
  const stateColors = {
    high: "#059669",
    medium: "#d97706",
    low: "#d90429",
  };

  return (data?.stateVacancyDistribution || []).map((item) => {
    let color = stateColors.low;

    if (item.fill_rate_pct >= 60) {
      color = stateColors.high;
    } else if (item.fill_rate_pct >= 50) {
      color = stateColors.medium;
    }

    return {
      state: item.state,
      city: item.city,
      total: item.total_vacancies || 0,
      filled: item.filled_vacancies || 0,
      unfilled: item.unfilled_vacancies || 0,
      rate: item.fill_rate_pct || 0,
      color,
    };
  });
};
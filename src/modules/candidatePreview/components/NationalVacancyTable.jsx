
import React from "react";
import { useTranslation } from "react-i18next";

const NationalVacancyTable = ({
  nationalCategoryDistribution,
  reservationCategories = [],
  disabilityCategories = [],
}) => {
  const { t } = useTranslation(["candidateWorkflow", "common"]);

  if (!nationalCategoryDistribution) return null;

  const { categories, disabilities, totalVacancies } =
    nationalCategoryDistribution;

  return (
    <div className="category-reservation-card mt-3">
      <div className="category-title fs-14" style={{ fontWeight: 600 }}>
        {t("candidateWorkflow:category_wise_reservation")}
      </div>

      <div className="table-responsive">
        <table className="category-table">
          <thead>
            <tr>
              <th colSpan="6" className="text-center">
                {t("candidateWorkflow:category")}
              </th>
              <th colSpan="4" className="text-center">
                {t("candidateWorkflow:disability")}
              </th>
            </tr>
            <tr>
              {reservationCategories.map((cat) => (
                <th className="text-center" key={cat.reservationCategoriesId}>
                  {cat.categoryCode}
                </th>
              ))}
              <th className="text-center">{t("common:total")}</th>

              {disabilityCategories.map((d) => (
                <th className="text-center" key={d.disabilityCategoryId}>
                  {d.disabilityCode}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            <tr>
              {reservationCategories.map((cat) => (
                <td key={cat.reservationCategoriesId}>
                  {categories?.[cat.reservationCategoriesId] ?? 0}
                </td>
              ))}

              <td>{totalVacancies}</td>

              {disabilityCategories.map((d) => (
                <td key={d.disabilityCategoryId}>
                  {disabilities?.[d.disabilityCategoryId] ?? 0}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NationalVacancyTable;

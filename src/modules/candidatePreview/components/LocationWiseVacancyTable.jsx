import React from "react";
import { useTranslation } from "react-i18next";

const LocationWiseVacancyTable = ({
  positionStateDistributions = [],
  states = [],
  cities = [],
  reservationCategories = [], // ✅ ADD
  disabilityCategories = [],
}) => {
  const { t } = useTranslation(["candidateWorkflow", "common"]);

  if (!positionStateDistributions.length) return null;

  const stateMap = states.reduce((acc, s) => {
    acc[String(s.stateId)] = s.stateName;
    return acc;
  }, {});

  const cityMap = cities.reduce((acc, c) => {
    acc[String(c.cityId)] = c.cityName;
    return acc;
  }, {});

  return (
    <div
      className="mt-3 p-3"
      style={{ backgroundColor: "#f5f7fb", borderRadius: "10px" }}
    >
      <div className="category-title fs-14" style={{ fontWeight: 600 }}>
        {t("category_wise_reservation_state")}
      </div>

      <div className="table-responsive">
        <table className="table table-bordered small text-center mb-0">
          <thead>
            <tr>
              <th
                rowSpan="2"
                className="light_font fw-600 fs-13"
                style={{ textAlign: "left", width: "15%" }}
              >
                {t("state_name")}
              </th>
              <th
                rowSpan="2"
                className="light_font fw-600 fs-13"
                style={{ textAlign: "left", width: "15%" }}
              >
                {t("city_name")}
              </th>
              <th
                className="light_font fw-600 fs-13"
                colSpan={reservationCategories.length + 1}
              >
                {t("category")}
              </th>
              <th
                className="light_font fw-600 fs-13"
                colSpan={disabilityCategories.length}
              >
                {t("disability")}
              </th>
            </tr>
            <tr>
              {reservationCategories.map((cat) => (
                <th
                  className="light_font fw-600 fs-12"
                  key={cat.reservationCategoriesId}
                >
                  {cat.categoryCode}
                </th>
              ))}

              <th className="light_font fw-600 fs-12">{t("common:total")}</th>

              {disabilityCategories.map((d) => (
                <th
                  className="light_font fw-600 fs-12"
                  key={d.disabilityCategoryId}
                >
                  {d.disabilityCode}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {positionStateDistributions.map((state, idx) => (
              <tr key={idx}>
                <td
                  className="fw-400"
                  style={{ padding: "12px 6px", textAlign: "left" }}
                >
                  {stateMap[
                    String(state.stateId || state.zonalStateID).toLowerCase()
                  ] || t("unknown")}
                </td>
                <td
                  className="fw-400"
                  style={{ padding: "12px 6px", textAlign: "left" }}
                >
                  {cityMap[String(state.cityId).toLowerCase()] || "-"}
                </td>

                {reservationCategories.map((cat) => (
                  <td className="fw-500" key={cat.reservationCategoriesId}>
                    {state.categories?.[cat.reservationCategoriesId] ?? 0}
                  </td>
                ))}

                <td className="fw-600" style={{ backgroundColor: "#f1f3f9" }}>
                  {state.totalVacancies}
                </td>

                {disabilityCategories.map((d) => (
                  <td className="fw-500" key={d.disabilityCategoryId}>
                    {state.disabilities?.[d.disabilityCategoryId] ?? 0}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LocationWiseVacancyTable;

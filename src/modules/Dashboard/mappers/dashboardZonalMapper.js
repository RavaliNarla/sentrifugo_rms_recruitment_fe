// src/mappers/zonalHeatmapMapper.js

const zoneColors = [
  "#0b3d91",
  "#dc143c",
  "#1e88e5",
  "#00a86b",
  "#e67e00",
  "#8a4fff",
];

export const mapZonalHeatmap = (data = {}) => {
  const zones =
    data?.zonalHeatmap?.map((item, index) => {
      const zoneName = item.zone?.split(",")[0] || "";

      return {
        city: zoneName,
        state: item.zone,
        candidates: item.candidate_count || 0,
        offered: item.offered_count || 0,
        rejected: item.rejected_count || 0,
        conversion: item.offer_conversion_pct || 0,
        color: zoneColors[index % zoneColors.length],
      };
    }) || [];

  return zones;
};
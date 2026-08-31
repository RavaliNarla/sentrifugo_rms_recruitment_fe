import { useEffect, useState } from "react";
import dashboardService from "../service/dashboardService";
import { mapDashboardFilters } from "../mappers/dashboardFilterMapper";
import { toast } from "react-toastify";

const useDashboardFilters = () => {
  const [filters, setFilters] = useState({
    positions: [],
    departments: [],
    zones: [],
    recruiters: [],
    employmentTypes: [],
  });

  const [loading, setLoading] = useState(false);

  const fetchFilters = async () => {
    try {
      setLoading(true);

      const response =
        await dashboardService.getDashboardFilters();

      const mappedData =
        mapDashboardFilters(response.data);

      setFilters(mappedData);
    } catch (error) {
      console.error("Dashboard filter API failed", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilters();
  }, []);

  return {
    filters,
    loading,
    refreshFilters: fetchFilters,
  };
};

export default useDashboardFilters;
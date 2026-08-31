// useDashboardDetails.js

import { useEffect, useState } from "react";
import dashboardService from "../service/dashboardService";
import { mapDashboardDetails } from "../mappers/dashboardDetailsMapper";
import {
  mapDashboardCategory,
  mapStateVacancyDistribution,
} from "../mappers/dashboardCategoryMapper";
import { mapCandidatePipeline } from "../mappers/dashboardCandidateMapper";
import { mapZonalHeatmap } from "../mappers/dashboardZonalMapper";
import { mapCommitteeOverview } from "../mappers/dashboardCommitteeMapper";
import { mapRecruiterPerformance } from "../mappers/dashboardRecruiterMapper";
import { toast } from "react-toastify";

const useDashboardDetails = (filters = {}) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchDashboardDetails = async (payload = {}) => {
    try {
      setLoading(true);

      const response = await dashboardService.getDashboardDetails(payload);

      console.log("FULL RESPONSE", response);

      if (!response?.success) {
        toast.error(
          response?.message || response?.data || "Failed to load dashboard"
        );

        return;
      }

      const mappedData = mapDashboardDetails(response.data);
      const categoryData = mapDashboardCategory(response.data);
      const candidatePipeline = mapCandidatePipeline(response.data);
      const zonalHeatmap = mapZonalHeatmap(response.data);
      const stateVacancyDistribution = mapStateVacancyDistribution(
        response.data
      );
      const committeeOverview = mapCommitteeOverview(response.data);
      const recruiterPerformance = mapRecruiterPerformance(response.data);

      setDashboardData({
        ...mappedData,
        categoryDistribution: categoryData,
        candidatePipeline,
        zonalHeatmap,
        stateVacancyDistribution,
        committeeOverview,
        recruiterPerformance,
      });

     
    } catch (error) {
      console.error("Dashboard details API failed", error);

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to load dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardDetails({
      fromDate: null,
      toDate: null,
      departmentId: null,
      positionId: null,
      zone: null,
      stateId: null,
      cityId: null,
      recruiterId: null,
      employmentTypeId: null,
      isReinitialized: null,
    });
  }, []);

  return {
    dashboardData,
    loading,
    refreshDashboard: fetchDashboardDetails,
  };
};

export default useDashboardDetails;

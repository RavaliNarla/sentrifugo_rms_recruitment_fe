// src/modules/jobPosting/hooks/useMasterData.js
import { useEffect, useState } from "react";
import masterApiService from "../../master/services/masterApiService";
import { mapMasterResponse } from "../mappers/master.mapper";

export const useMasterData = () => {
  const [data, setData] = useState({
    departments: [],
    positions: [],
    jobGrades: [],
    employmentTypes: [],
    reservationCategories: [],
    disabilityCategories: [],
    educationTypes: [],
    qualifications: [],
    specializations: [],
    users: [],
    certifications: [],
    states: [],
    languages: [],
    stateLanguages: [],
    approvingAuthorities: [],
    cities: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMaster = async () => {
      setLoading(true);
      try {
        // 🔥 CALL BOTH APIS IN PARALLEL
        const [
          masterRes,
          approvingRes,
          certRes,
          stateLanguagesRes,
          documentTypesRes,
        ] = await Promise.all([
          masterApiService.getMasterDisplayAll(),
          masterApiService.getApprovingAuthorities(),
          masterApiService.getAllCertificates(),
          masterApiService.getStateLanguages(),
          masterApiService.getAllDocumentTypes(),
        ]);

        const mapped = mapMasterResponse(
          masterRes.data,
          certRes.data,
          //languagesRes.data,
          stateLanguagesRes.data,
          documentTypesRes.data
        );

        setData({
          departments: mapped.departments,
          positions: mapped.positions,
          jobGrades: mapped.jobGrades,
          employmentTypes: mapped.employmentTypes,
          reservationCategories: mapped.reservationCategories,
          disabilityCategories: mapped.disabilityCategories,
          educationTypes: mapped.educationTypes,
          qualifications: mapped.qualifications,
          specializations: mapped.specializations,
          certifications: mapped.certifications,
          states: mapped.states,
          languages: mapped.languages,
          cities: mapped.cities,

          approvingAuthorities: (approvingRes.data || []).map((a) => ({
            id: a.approvingAuthorityId,
            name: a.authorityName,
          })),

          // // NEW STATE-LANGUAGE MAPPING
          stateLanguages: (stateLanguagesRes.data || []).map((sl) => ({
            stateId: String(sl.stateId),
            languageId: String(sl.languageId),
            isPrimary: sl.isPrimary,
          })),
          documentTypes: (documentTypesRes.data || []).map((dt) => ({
            id: String(dt.documentTypeId),
            name: dt.documentName,
            docType: dt.docType,
          })),
        });
      } catch (err) {
        console.error(err);
        setError("Failed to load master data");
      } finally {
        setLoading(false);
      }
    };

    fetchMaster();
  }, []);

  return { ...data, loading, error };
};

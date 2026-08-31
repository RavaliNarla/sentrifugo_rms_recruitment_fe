// src/modules/jobPosting/mappers/master.mapper.js
export const mapMasterResponse = (masterData, certData) => {
  const certList = Array.isArray(certData)
    ? certData
    : Array.isArray(certData?.data)
      ? certData.data
      : [];
  return {
    departments: (masterData.departments || []).map((d) => ({
      id: String(d.departmentId),
      label: d.departmentName,
    })),

    positions: (masterData.masterPositions || []).map((p) => ({
      id: String(p.masterPositionsId),
      name: p.positionName,
      deptId: String(p.deptId),
      minAge: p.eligibilityAgeMin,
      maxAge: p.eligibilityAgeMax,
      gradeId: String(p.gradeId),
      mandatoryEducation: p.mandatoryEducation,
      preferredEducation: p.preferredEducation,
      mandatoryExperience: p.mandatoryExperience,
      preferredExperience: p.preferredExperience,
      rolesResponsibilities: p.rolesResponsibilities,
    })),

    jobGrades: (masterData.jobGrade || []).map((g) => ({
      id: String(g.jobGradeId),
      code: g.jobGradeCode,
      scale: g.jobScale,
      minSalary: g.minSalary,
      maxSalary: g.maxSalary,
    })),

    employmentTypes: (masterData.employementTypes || []).map((e) => ({
      id: String(e.employementTypeId),
      label: e.typeName,
    })),

    reservationCategories: (masterData.reservationCategories || []).map(
      (c) => ({
        id: String(c.reservationCategoriesId),
        code: c.categoryCode,
        label: c.categoryName,
      })
    ),

    disabilityCategories: (masterData.disabilityCategories || []).map((c) => ({
      id: String(c.disabilityCategoryId),
      disabilityCode: c.disabilityCode,
      disabilityName: c.disabilityName,
    })),

    /**  EDUCATION MASTER (NEW) */
    educationTypes: (masterData.educationTypeMaster || []).map((e) => ({
      id: e.educationTypeId,
      label: e.educationType,
    })),

    qualifications: (masterData.mandatoryQualification || []).map((q) => ({
      id: q.educationQualificationsId,
      code: q.qualificationCode,
      name: q.qualificationName,
      levelId: q.levelId,
    })),

    specializations: (masterData.specializationMaster || []).map((s) => ({
      id: s.specializationId,
      label: s.specializationName,
      educationQualificationsId: s.educationQualificationsId,
    })),

    certifications: certList.map((c) => ({
      id: c.certificationMasterId,
      name: c.certificationName,
      description: c.certificationDesc,
    })),

    states: (masterData.states || []).map((s) => ({
      id: String(s.stateId),
      name: s.stateName,
      localLanguage: s.localLanguage,
      cities: s.cities || [],
    })),
    cities: (masterData.cities || []).map((c) => ({
      id: String(c.cityId),
      name: c.cityName,
      stateId: String(c.stateId),
    })),

    languages: (masterData.languageMasters || []).map((l) => ({
      id: String(l.languageId),
      name: l.languageName,
      stateId: l.stateId ? String(l.stateId) : null,
    })),
  };
};

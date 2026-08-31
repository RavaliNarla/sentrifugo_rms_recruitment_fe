/* ================= MAP CONFIGURATION LIST ================= */

export const mapExaminationCutoffConfigurations = (apiData = []) => {
  return apiData.map((item) => ({
    id: item.id || item.configurationId || "",

    requisitionId: item.requisitionId || "",

    requisitionCode: item.requisitionCode || "",

    requisitionTitle: item.requisitionTitle || "",

    positionId: item.positionId || "",

    positionName: item.positionName || "",

    totalMarks: item.totalMarks || "",

    numberOfSections: item.numberOfSections || 0,

    sections: mapSections(item.sections || []),

    scstCutoff: item.scstCutoff || "",

    obcCutoff: item.obcCutoff || "",

    urCutoff: item.urCutoff || "",

    writtenExamWeightage: item.writtenExamWeightage || "",

    selectedWeightageSections: item.selectedWeightageSections || [],

    status: item.status || "Pending",

    createdAt: item.createdAt || "",

    updatedAt: item.updatedAt || "",

    raw: item,
  }));
};

/* ================= MAP SINGLE CONFIGURATION ================= */

export const mapSingleExaminationCutoffConfiguration = (item) => {
  if (!item) return null;

  return {
    id: item.id || item.configurationId || "",

    requisitionId: item.requisitionId || "",

    requisitionCode: item.requisitionCode || "",

    requisitionTitle: item.requisitionTitle || "",

    positionId: item.positionId || "",

    positionName: item.positionName || "",

    totalMarks: item.totalMarks || "",

    numberOfSections: item.numberOfSections || 0,

    sections: mapSections(item.sections || []),

    scstCutoff: item.scstCutoff || "",

    obcCutoff: item.obcCutoff || "",

    urCutoff: item.urCutoff || "",

    writtenExamWeightage: item.writtenExamWeightage || "",

    selectedWeightageSections: item.selectedWeightageSections || [],

    status: item.status || "Pending",

    createdAt: item.createdAt || "",

    updatedAt: item.updatedAt || "",

    raw: item,
  };
};

/* ================= MAP SECTIONS ================= */

export const mapSections = (sections = []) => {
  return sections.map((section, index) => ({
    id: section.id || `${index + 1}`,

    sectionName: section.sectionName || "",

    passMarks: section.passMarks || "",

    sectionWeightage: section.sectionWeightage || "",

    raw: section,
  }));
};

/* ================= MAP SAVE PAYLOAD ================= */

export const mapSavePayload = ({
  formData,
  selectedRequisition,
  selectedPosition,
}) => {
  return {
    requisitionId: selectedRequisition?.requisition?.id || "",

    positionId: selectedPosition?.position?.positionId || "",

    totalMarks: Number(formData.totalMarks),

    numberOfSections: Number(formData.numberOfSections),

    sections: formData.sections.map((section) => ({
      sectionName: section.sectionName,

      passMarks: Number(section.passMarks),
    })),

    scstCutoff: Number(formData.categoryWiseCutoff.scst),

    obcCutoff: Number(formData.categoryWiseCutoff.obc),

    urCutoff: Number(formData.categoryWiseCutoff.ur),

    writtenExamWeightage: Number(formData.writtenExamWeightage),

    selectedWeightageSections: formData.selectedWeightageSections,
  };
};

/* ================= MAP TABLE ROW ================= */

export const mapTableRow = (item) => {
  return {
    id: item.id,

    requisitionCode: item.requisitionCode,

    requisitionTitle: item.requisitionTitle,

    positionName: item.positionName,

    totalMarks: item.totalMarks,

    scstCutoff: item.scstCutoff,

    obcCutoff: item.obcCutoff,

    urCutoff: item.urCutoff,

    writtenExamWeightage: item.writtenExamWeightage,

    status: item.status,
  };
};

// departmentMapper.js

// SINGLE item (API → UI)
export const mapDepartmentFromApi = (apiDept) => ({
  id: apiDept.departmentId,
  name: apiDept.departmentName,
  description: apiDept.departmentDesc,
  createdDate: apiDept.createdDate,
});

// LIST (API → UI)
export const mapDepartmentsFromApi = (apiData = []) => {
  if (!Array.isArray(apiData)) return [];
  return apiData.map(mapDepartmentFromApi);
};

// UI → API (Add / Update)
export const mapDepartmentToApi = (uiDept) => ({
  departmentName: uiDept.name,
  departmentDesc: uiDept.description,
});

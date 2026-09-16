import { masterApi } from "./apiService";

const masterApiService = {
  // Users
  getUsers: () => masterApi.get("/user/all"),
  addUser: (payload) => masterApi.post("/user/add", payload),
  updateUser: (id, payload) => masterApi.put(`/user/update/${id}`, payload),
  deleteUser: (id) => masterApi.delete(`/user/delete/${id}`),

  // Departments
  getDepartments: () => masterApi.get("/departments/all"),
  addDepartment: (payload) => masterApi.post("/departments/add", payload),
  updateDepartment: (id, payload) => masterApi.put(`/departments/update/${id}`, payload),
  deleteDepartment: (id) => masterApi.delete(`/departments/delete/${id}`),

  // Locations
  getLocations: () => masterApi.get("/locations/all"),
  addLocation: (payload) => masterApi.post("/locations/add", payload),
  updateLocation: (id, payload) => masterApi.put(`/locations/update/${id}`, payload),
  deleteLocation: (id) => masterApi.delete(`/locations/delete/${id}`),

  // Position titles
  getPositionTitles: () => masterApi.get("/position-titles/all"),
  getPositionTitlesByDepartment: (departmentId) => masterApi.get(`/position-titles/by-department/${departmentId}`),
  addPositionTitle: (payload) => masterApi.post("/position-titles/add", payload),
  updatePositionTitle: (id, payload) => masterApi.put(`/position-titles/update/${id}`, payload),
  deletePositionTitle: (id) => masterApi.delete(`/position-titles/delete/${id}`),

  // Education qualifications
  getEducationQualifications: () => masterApi.get("/education-qualifications/all"),
  addEducationQualification: (payload) => masterApi.post("/education-qualifications/add", payload),
  updateEducationQualification: (id, payload) => masterApi.put(`/education-qualifications/update/${id}`, payload),
  deleteEducationQualification: (id) => masterApi.delete(`/education-qualifications/delete/${id}`),

  // Dropdown data
  getStates: () => masterApi.get("/master-dd-data/get/states"),
  getApprovedByRoles: () => masterApi.get("/master-dd-data/get/approved-by-roles"),
  getOfferTemplates: () => masterApi.get("/master-dd-data/get/offer-templates"),
  getPanelMembers: () => masterApi.get("/master-dd-data/get/panel-members"),
};

export default masterApiService;

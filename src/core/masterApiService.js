import { masterApi } from "./apiService";

// Search is always performed server-side - this just appends ?search= when a term is given.
const withSearch = (path, search) => (search && search.trim() ? `${path}?search=${encodeURIComponent(search.trim())}` : path);

// Paginated admin-list endpoints: search/page/size are always performed server-side.
const pagedQuery = (search, page, size) => {
  const params = new URLSearchParams();
  if (search && search.trim()) params.set("search", search.trim());
  params.set("page", page ?? 0);
  params.set("size", size ?? 10);
  return `?${params.toString()}`;
};

const masterApiService = {
  // Users (admin list is paginated - no dropdown elsewhere depends on the flat list)
  getUsers: (search, page, size) => masterApi.get(`/user/all${pagedQuery(search, page, size)}`),
  addUser: (payload) => masterApi.post("/user/add", payload),
  updateUser: (id, payload) => masterApi.put(`/user/update/${id}`, payload),
  deleteUser: (id) => masterApi.delete(`/user/delete/${id}`),

  // Departments
  getDepartments: (search) => masterApi.get(withSearch("/departments/all", search)),
  searchDepartments: (search, page, size) => masterApi.get(`/departments/search${pagedQuery(search, page, size)}`),
  addDepartment: (payload) => masterApi.post("/departments/add", payload),
  updateDepartment: (id, payload) => masterApi.put(`/departments/update/${id}`, payload),
  deleteDepartment: (id) => masterApi.delete(`/departments/delete/${id}`),

  // Locations
  getLocations: (search) => masterApi.get(withSearch("/locations/all", search)),
  searchLocations: (search, page, size) => masterApi.get(`/locations/search${pagedQuery(search, page, size)}`),
  addLocation: (payload) => masterApi.post("/locations/add", payload),
  updateLocation: (id, payload) => masterApi.put(`/locations/update/${id}`, payload),
  deleteLocation: (id) => masterApi.delete(`/locations/delete/${id}`),

  // Position titles (admin list is paginated - no dropdown elsewhere depends on the flat list)
  getPositionTitles: (search, page, size) => masterApi.get(`/position-titles/all${pagedQuery(search, page, size)}`),
  getPositionTitlesByDepartment: (departmentId) => masterApi.get(`/position-titles/by-department/${departmentId}`),
  addPositionTitle: (payload) => masterApi.post("/position-titles/add", payload),
  updatePositionTitle: (id, payload) => masterApi.put(`/position-titles/update/${id}`, payload),
  deletePositionTitle: (id) => masterApi.delete(`/position-titles/delete/${id}`),

  // Education qualifications
  getEducationQualifications: (search) => masterApi.get(withSearch("/education-qualifications/all", search)),
  searchEducationQualifications: (search, page, size) => masterApi.get(`/education-qualifications/search${pagedQuery(search, page, size)}`),
  addEducationQualification: (payload) => masterApi.post("/education-qualifications/add", payload),
  updateEducationQualification: (id, payload) => masterApi.put(`/education-qualifications/update/${id}`, payload),
  deleteEducationQualification: (id) => masterApi.delete(`/education-qualifications/delete/${id}`),

  // Specializations (optional, linked to an education level - e.g. "Computer Science and Engineering" for B.Tech)
  // Admin list is paginated - no dropdown elsewhere depends on the flat list (getSpecializationsByEducation is separate).
  getSpecializations: (search, page, size) => masterApi.get(`/specializations/all${pagedQuery(search, page, size)}`),
  getSpecializationsByEducation: (educationQualificationId) => masterApi.get(`/specializations/by-education/${educationQualificationId}`),
  addSpecialization: (payload) => masterApi.post("/specializations/add", payload),
  updateSpecialization: (id, payload) => masterApi.put(`/specializations/update/${id}`, payload),
  deleteSpecialization: (id) => masterApi.delete(`/specializations/delete/${id}`),

  // Certifications (optional, single-select field on Add Position)
  getCertifications: (search) => masterApi.get(withSearch("/certifications/all", search)),
  searchCertifications: (search, page, size) => masterApi.get(`/certifications/search${pagedQuery(search, page, size)}`),
  addCertification: (payload) => masterApi.post("/certifications/add", payload),
  updateCertification: (id, payload) => masterApi.put(`/certifications/update/${id}`, payload),
  deleteCertification: (id) => masterApi.delete(`/certifications/delete/${id}`),

  // Dropdown data
  getStates: () => masterApi.get("/master-dd-data/get/states"),
  getApprovedByRoles: () => masterApi.get("/master-dd-data/get/approved-by-roles"),
  getOfferTemplates: () => masterApi.get("/master-dd-data/get/offer-templates"),
  getPanelMembers: () => masterApi.get("/master-dd-data/get/panel-members"),
};

export default masterApiService;

export const mapUserFromApi = (api) => ({
  userId: api.userId,
  role: api.role,
  name: api.name,
  email: api.email,
  interviewCenterId: api.interviewCenterId,
});

export const mapUsersFromApi = (apiData = []) => {
  if (!Array.isArray(apiData)) return [];
  return apiData.map(mapUserFromApi);
};

export const mapUserToApi = (ui) => ({
  userId: ui.userId,
  role: ui.role,
  name: ui.fullName,
  email: ui.email,
  password: ui.password,
  interviewCenterId: ui.interviewCenterId,
});

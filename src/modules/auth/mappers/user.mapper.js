export const mapUserApiToState = (api = {}) => ({
  id: api.id,
  firstName: api.first_name,
  lastName: api.last_name,
  email: api.email ?? "",
  role: api.role ?? "",
  mobile: api.mobile ?? "",
  name: api.name ?? "",
});

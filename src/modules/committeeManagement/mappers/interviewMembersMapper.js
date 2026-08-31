export const mapInterviewMembersApi = (apiResponse) => {
  const list = Array.isArray(apiResponse?.data)
    ? apiResponse.data
    : Array.isArray(apiResponse)
      ? apiResponse
      : [];

  // ✅ Filter only required roles
  const filtered = list.filter((user) =>
    ["Committee_Member", "Recruiter"].includes(user.role)
  );
  const formatRole = (role) => role.replace(/_/g, " ");

  return filtered.map((user) => ({
    value: user.userId, // ✅ correct key
    label: `${user.name} - ${formatRole(user.role)}`, // Show both name and role
    email: user.email,
    role: user.role,
  }));
};

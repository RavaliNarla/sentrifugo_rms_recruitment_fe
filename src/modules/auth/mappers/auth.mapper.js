export const mapAuthApiToState = (api = {}) => ({
  access_token: api.access_token,
  refresh_token: api.refresh_token,
  expires_in: api.expires_in,
  mfaRequired: api.mfa_required ?? false,
  mfaToken: api.mfa_token ?? null,
});

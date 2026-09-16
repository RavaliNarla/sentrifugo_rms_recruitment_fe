# Sentrifugo RMS - Recruiter Portal Frontend (Preview)

React 19-style CRA app (recruiter/admin/committee-member only) for the new greenfield RMS.
Blue "Sagarsoft" theme/logo, same as the BOB demo. Login is Azure AD (Entra ID) via MSAL -
no local username/password.

## Running

```powershell
npm install
npm start
```

Opens at http://localhost:3000. Requires all 3 backend services running first (see the
backend repo's README): `auth-portal` (8085), `master-portal` (8080), `recruiter-portal` (8086).

## Configuration

| File | Used when |
|---|---|
| `.env` | Local `npm start` → localhost APIs + `http://localhost:3000/auth/callback` |
| `.env.production` | `npm run build` → bobdev APIs + `https://bobdev.recruitment.sentrifugo.com/auth/callback` |

No secrets beyond the public MSAL client id, which is not sensitive.

## Deploy to bobdev

```powershell
npm ci
npm run build
```

Copy the `build/` folder to the web root for https://bobdev.recruitment.sentrifugo.com
(same host the reverse proxy already uses for the recruitment UI).

Ensure Azure AD has redirect URI: `https://bobdev.recruitment.sentrifugo.com/auth/callback`.

API host used by the production build: `https://dev.bobjava.sentrifugo.com`.

## Structure

- `src/app` - App shell, routing guards (`PrivateRoute`, `PrivilegeRoute`), MSAL config, header/layout.
- `src/core` - Axios clients (auto-attach Azure AD bearer token) + one API service module per backend.
- `src/store` - Redux Toolkit + redux-persist (current user + privileges).
- `src/modules` - One folder per feature: `auth`, `dashboard`, `jobPosting`, `approvals`,
  `candidateWorkflow` (Candidate/Interview/Compensation/Offer pools), `committeeManagement`,
  `interviewer`, `admin` (master data screens).
- `src/shared` - Reusable UI: paginated table helper, generic named-master CRUD screen.

## Privileges

The signed-in user's screen privileges (`Admin`, `JobPostings`, `CandidatePool`, `InterviewPool`,
`CompensationPool`, `OfferPool`, `CommitteeManagement`, `Interview`, `L1Approval`, `L2Approval`,
`Dashboard`) come from `GET /auth-portal/api/v1/auth/getdetails/user` and drive both the
navigation menu and route guards.

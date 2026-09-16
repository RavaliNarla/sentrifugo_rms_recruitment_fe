# Recruiter Frontend — Handoff (Sentrifugo RMS Preview)

**Audience:** teammate with the same repos  
**Repo:** `sentrifugo_rms_recruitment_fe`  
**Branch:** `preview`  
**Purpose:** What we built in this effort, where we started, where we are now, and how to run/deploy it.

---

## 1. Where we started

Before this greenfield work, the team had:

| Artifact | Role |
|---|---|
| `RecruitmentPortalDemo` / older `RecruitmentPortal` | Full BOB-style recruiter UI (org-slug URLs like `/sagarsoft/login`, blue "Sagarsoft" theme, Entra + later email/password experiments) |
| `CandidatePortalDemo` / `sentrifugo_rms_candidate_fe` | Candidate self-service FE — **out of scope** for the new Sagar product |
| `BOB_JAVA` / `RMS_Backend_Demo` | Full multi-portal bank RMS backends |

**Client decision (Sagar Cements):** recruiter/admin/committee only. Recruiters add candidates into the pool manually. **No candidate portal.**

Around early September we wiped the `preview` branches on FE + BE and rebuilt **from scratch** as a single-tenant recruiter app (routes like `/login`, `/dashboard` — no `/:orgCode/` prefix).

---

## 2. Where we are now

A working CRA React app that:

- Signs in with **Microsoft (Azure AD / Entra)** via MSAL only  
- Talks to three new backends: **auth**, **master**, **recruiter**  
- Covers the hiring pipeline UI: requisitions → approvals → candidates → interviews → compensation → offers  
- Is themed like **Sagar Learning Hub (LMS)** (green sidebar/topbar)  
- Is deployed on bobdev at **https://bobdev.recruitment.sentrifugo.com** (static files under `/var/www/html/devrec`)

Latest push on `preview` includes bobdev `.env.production` and redirects from legacy `/sagarsoft/*` paths to `/login`.

---

## 3. Tech stack

| Layer | Choice |
|---|---|
| UI | React 18, Create React App (`react-scripts` 5) |
| Routing | React Router 6 |
| State | Redux Toolkit + redux-persist |
| HTTP | Axios (Bearer token from MSAL) |
| UI kit | Bootstrap 5, react-bootstrap, bootstrap-icons |
| Auth | `@azure/msal-browser` + `@azure/msal-react` |
| Toasts | react-toastify |
| Package name | `sentrifugo-rms-recruiter-app` |

---

## 4. Folder structure

```
src/
  app/           App shell, routes, PrivateRoute, PrivilegeRoute,
                 Layout, Sidebar, Topbar, Footer, msalConfig, pageMeta
  core/          Axios clients + auth/master/recruiter API modules
  store/         Redux store + userSlice (persisted)
  modules/
    auth/        Login, AuthCallback, Unauthorized
    dashboard/
    jobPosting/  JobPostings, CreateRequisition, AddPosition
    approvals/
    candidateWorkflow/   Candidate / Interview / Compensation / Offer pools + modals
    committeeManagement/
    interviewer/
    admin/       Users, Departments, Locations, PositionTitles, EducationQualifications
  shared/        PdfViewerModal, useFilePreview, Pagination, NamedMasterCrudPage
  assets/        mascot, Sagar Cement logo
```

---

## 5. Features built (UI)

### Auth & shell
- Login with Microsoft  
- Auth callback → load current user + privileges → dashboard  
- Privilege-gated navigation and routes  
- Layout evolved: two-row header → **LMS vertical sidebar + topbar**

### Dashboard
- Summary tiles + quick links (LMS-styled)

### Job postings
- Requisition list (search, status filter, cards/pills)  
- Create requisition  
- Add / edit / view positions (dept, location, education, experience, approval document, Approved By/On)  
- Submit for L1/L2; mark fulfilled  
- Pencil vs eye icons by editable vs read-only status  

### Approvals
- L1 / L2 approval screens (privilege-gated)

### Candidate workflow (tabbed, paginated)
- **Candidate Pool:** pick req+position → Add Candidate (resume, ID proof, optional photo) → Shortlist  
- **Interview Pool:** schedule from shortlist; interviewer scoring  
- **Compensation Pool:** enter salary; move to offer  
- **Offer Pool:** generate offer PDF, email accept/reject links; PDF viewer  

### Committee
- Manage panels (members, time window)  
- Assign panels to positions  

### Interviewer
- Scoring UI for committee members  

### Admin masters
- Users, Departments, Locations, Position Titles, Education Qualifications  
- Shared `NamedMasterCrudPage` pattern  

### File viewing
- Resumes / ID proofs / offer PDFs are **not** opened as raw URLs (that caused 401 without JWT)  
- Pattern: authenticated Axios download → blob URL → **`PdfViewerModal`** / **`useFilePreview`**  
- MIME/type inferred from original path so PDF viewers don't treat blobs as "unsupported format"

### Photo upload
- Optional circular photo preview on Add Candidate  
- Shown as avatar in candidate profile  
- Stored via BE under `photos/`

---

## 6. Privileges (drive menu + routes)

Loaded from auth `GET .../getdetails/user`:

`Admin`, `JobPostings`, `CandidatePool`, `InterviewPool`, `CompensationPool`, `OfferPool`, `CommitteeManagement`, `Interview`, `L1Approval`, `L2Approval`, `Dashboard`

---

## 7. Auth / MSAL flow (frontend side)

1. User opens `/login` → "Sign in with Microsoft"  
2. MSAL `loginRedirect` → Azure AD → return to `REACT_APP_MSAL_REDIRECT_URI` (`/auth/callback`)  
3. `AuthCallback` waits until MSAL finishes, then calls auth API, stores user in Redux, goes to `/dashboard`  
4. Every API call acquires a silent token and sends `Authorization: Bearer …`

### Important MSAL fix
- **Bug:** after Microsoft login, UI bounced straight back to `/login`  
- **Cause:** MSAL default `navigateToLoginRequestUrl: true` navigated away from `/auth/callback` before our callback logic ran  
- **Fix:** set `navigateToLoginRequestUrl: false` in `src/app/msalConfig.js`  
- Also clears stuck `msal.interaction.status` if a previous redirect left MSAL mid-flight  

### Azure AD (shared with BOB demo)
| Setting | Value |
|---|---|
| Client ID | `cd56da03-d902-480a-9036-2d86da88d54c` |
| Tenant | `f74c48c6-7f19-4f6e-95e9-83c6e1dfdbd0` |
| Scope | `api://cd56da03-d902-480a-9036-2d86da88d54c/access_as_user` |

**Register every redirect URI you use**, including:
- `http://localhost:3000/auth/callback`  
- `https://bobdev.recruitment.sentrifugo.com/auth/callback`  
- Any temporary LAN URL (e.g. `http://172.x.x.x:8081/auth/callback`) if teammates hit your machine  

### Legacy `/sagarsoft` paths (bobdev)
Old BOB FE used `/sagarsoft/login`. Bookmarks / Azure leftovers still hit that.  
We added routes:
- `/sagarsoft/login` → `/login`  
- `/sagarsoft/*` → `/login`  

---

## 8. Environment configuration

CRA **bakes env vars at build time**. Wrong file ⇒ broken production MSAL (`redirectUri` becomes `undefined` in the JS bundle).

| File | Used when | Points at |
|---|---|---|
| `.env` | `npm start` | Localhost APIs + `http://localhost:3000/auth/callback` |
| `.env.production` | `npm run build` | `https://dev.bobjava.sentrifugo.com/...` APIs + bobdev MSAL callback |

### Local `.env` (pattern)
```
REACT_APP_RECRUITER_API_URL=http://localhost:8086/recruiter-portal/api/v1/recruiter
REACT_APP_MASTER_API_URL=http://localhost:8080/master-portal/api/v1/master
REACT_APP_AUTH_API_URL=http://localhost:8085/auth-portal/api/v1/auth
REACT_APP_MSAL_CLIENT_ID=...
REACT_APP_MSAL_AUTHORITY=https://login.microsoftonline.com/...
REACT_APP_MSAL_REDIRECT_URI=http://localhost:3000/auth/callback
REACT_APP_MSAL_SCOPE=api://.../access_as_user
PORT=3000
HTTPS=false
```

### Production `.env.production` (bobdev)
```
REACT_APP_RECRUITER_API_URL=https://dev.bobjava.sentrifugo.com/recruiter-portal/api/v1/recruiter
REACT_APP_MASTER_API_URL=https://dev.bobjava.sentrifugo.com/master-portal/api/v1/master
REACT_APP_AUTH_API_URL=https://dev.bobjava.sentrifugo.com/auth-portal/api/v1/auth
REACT_APP_MSAL_REDIRECT_URI=https://bobdev.recruitment.sentrifugo.com/auth/callback
(+ same client / authority / scope)
```

### Public hosts
| Role | URL |
|---|---|
| Recruiter UI | https://bobdev.recruitment.sentrifugo.com |
| APIs | https://dev.bobjava.sentrifugo.com/{auth\|master\|recruiter}-portal/... |

---

## 9. UI theme evolution

1. **v1** — Blue demo / Sagarsoft look (login illustration, two-row header)  
2. **v2** — Closer match to RecruitmentPortalDemo Job Postings / Candidate Workflow / Committee  
3. **v3 (current)** — Sagar LMS green theme (sidebar, topbar, tokens from eLearning site / desktop screenshots)

---

## 10. How to run locally

```powershell
cd sentrifugo_rms_recruitment_fe
git checkout preview
git pull
npm install
npm start
```

Needs backends running (see backend handoff):
- auth `:8085`, master `:8080`, recruiter `:8086` locally  

---

## 11. How to build & deploy (bobdev)

```powershell
npm ci
npm run build
```

On the DEV VM, deploy `build/` contents to:

**`/var/www/html/devrec`**

(nginx for `bobdev.recruitment.sentrifugo.com` already uses that root.)

Then hard-refresh / clear site data and open:

https://bobdev.recruitment.sentrifugo.com/login

---

## 12. Notable commits on `preview` (FE)

| Commit | Meaning |
|---|---|
| Greenfield rebuild | Recruiter-only app from scratch |
| UI corrected | Demo-blue chrome / layout fixes |
| UI Synced with Sagar Cements LMS | LMS green theme |
| `.env.production` + `/sagarsoft` redirects | Bobdev production wiring |

Exact SHAs change with history; use `git log preview` on the repo.

---

## 13. Known gaps vs requirements doc

Not all of `Recruitment_Module_Requirements` was implemented. Major intentional simplifications / gaps:

- Interview scheduling is auto-slot style (not fixed 5 PM / 1h-only as in some docs)  
- Interview feedback = simplified score (not full competency matrix)  
- Compensation = single salary field  
- No separate offer-letter approval gate before email  
- Some requisition filters / position fields (Grade, Certifications, etc.) missing  
- Naming still "Candidate Workflow/Pool" in places  

---

## 14. Do not confuse with these repos

| Path | Role |
|---|---|
| **`sentrifugo_rms_recruitment_fe` / `preview`** | **This product** |
| `RecruitmentPortalDemo` | Frozen BOB/demo reference UI |
| `sentrifugo_rms_candidate_fe` | Candidate FE — not used for Sagar preview |
| Older `RecruitmentPortal` / SuperAdminPortal | Earlier multi-tenant / productizing experiments |

---

## 15. Quick troubleshooting

| Symptom | Check |
|---|---|
| Login returns to login page | `navigateToLoginRequestUrl: false`; Azure redirect URI registered; rebuild if using production |
| bobdev opens `/sagarsoft/login` | New build with redirect routes; hard refresh |
| APIs 401 | Token / MSAL scope / backend security |
| Resume "opens blank" or unsupported | Use in-app viewer (blob), not raw file URL |
| Production MSAL broken | Confirm build used `.env.production` (CRA bake-time) |

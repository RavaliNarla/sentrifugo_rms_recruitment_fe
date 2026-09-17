# SCL RMS — Frontend Bug Fixes (2026-09-17)

> Scope: `sentrifugo_rms_recruitment_fe` (`preview` branch)  
> Source: QA issues from `SCL_RMS_Issues` + FRS (`Recruitment_Module_Requirements v.2`)  
> Out of scope for this note: MCP/browser tooling, local env secrets, infra-only work

---

## Summary

Implemented a large QA/FRS pass on the recruiter portal UI: Position Master–driven Add Position flow, date inputs (DD-MM-YYYY), shortlist Yes/No/Hold, Compensation CTC, Offer joining date + preview + L1/L2 Offer Approvals screen, Specialization admin, Login bfcache fix, Undo Fulfilled, and label/autofill fixes for Roles & Responsibilities (SCL_16 / SCL_07 follow-ups).

Also reconciled with teammate FE pull on `origin/preview` earlier in the session, then continued local QA fixes.

---

## New files

| File | Purpose |
|------|---------|
| `src/shared/DateInput.js` | Shared DD-MM-YYYY date control used across requisition/position/offer/committee/interviewer screens |
| `src/shared/DateInput.css` | Styles for `DateInput` |
| `src/shared/ConfirmModal.js` | Reusable confirm dialog (e.g. Position Master autofill prompt on Add Position) |
| `src/modules/admin/SpecializationsPage.js` | Admin CRUD UI for Specialization master |
| `src/modules/offerApprovals/OfferApprovals.js` | L1/L2 Offer Approvals screen (pending offers approve/reject) |

---

## Modified files (what changed)

### App shell / navigation

**`src/app/App.js`**
- Registered routes for Offer Approvals and Specializations admin pages
- Privilege gates: Offer Approvals → `L1Approval` / `L2Approval`; Specializations → `Admin`

**`src/app/Sidebar.js`**
- Nav entries for Offer Approvals and Specializations

**`src/app/pageMeta.js`**
- Page titles/breadcrumbs for the new routes

### API clients

**`src/core/masterApiService.js`**
- Position titles by department: `getPositionTitlesByDepartment`
- Specialization APIs: list / by-education / add / update / delete
- Supporting master calls used by Add Position autofill and admin pages

**`src/core/recruiterApiService.js`**
- Shortlist decision (SHORTLIST / REJECT / HOLD)
- Offer preview, submit-for-approval, pending offer approvals, L1/L2 approve/reject
- Compensation details (CTC fields)
- Requisition unfulfill / undo fulfilled
- Related offer/candidate/position helper endpoints aligned with BE

### Auth

**`src/modules/auth/Login.js`**
- **SCL_01 / bfcache:** Reset `loggingIn` on mount and on `pageshow` when `event.persisted` so Back from Microsoft login does not leave the button stuck on “Redirecting…”
- Clears stale MSAL `interaction_in_progress` before `loginRedirect` when needed

### Job posting / requisitions / positions

**`src/modules/jobPosting/CreateRequisition.js`**
- Uses shared `DateInput` for date fields
- Validation aligned with FRS (no future where required, etc.)

**`src/modules/jobPosting/AddPosition.js`**
- Department → Position Title filtered by master (`getPositionTitlesByDepartment`)
- Position Master autofill prompt (`ConfirmModal`) for Roles & Responsibilities + Experience
- Specialization dropdown (enabled after Education Requirement)
- Mandatory fields, approval doc redisplay, Approved By “Others” text, Approved On max=today
- **SCL_16:** Single required field labeled **Roles & Responsibilities** (backed by `jobDescription`; also synced to `rolesResponsibilities` on save)
- Removed duplicate empty Roles textarea that made autofill look broken
- Autofill popup copy updated to say Roles & Responsibilities / Experience

**`src/modules/jobPosting/JobPostings.js`**
- View / edit / delete flows for positions where allowed
- **Undo Fulfilled** action for fulfilled requisitions
- Filters / submit-for-approval wiring retained/extended as part of QA pass

**`src/modules/admin/PositionTitlesPage.js`**
- Position Master UI: department, title, min experience, Roles & Responsibilities
- Labels renamed from “Job Description” → **Roles & Responsibilities** for consistency with Add Position / SCL_16

### Approvals

**`src/modules/approvals/Approvals.js`**
- Shows position-level detail in requisition approval flows (positions under requisitions)

**`src/modules/offerApprovals/OfferApprovals.js` (new)**
- Lists offers pending L1/L2 approval
- Approve / reject actions with joining date / accept-before display

### Candidate workflow

**`src/modules/candidateWorkflow/CandidateWorkflow.js`**
- Minor wiring/status label alignment with pool tabs

**`src/modules/candidateWorkflow/components/AddCandidateModal.js`**
- Email / phone validation before submit

**`src/modules/candidateWorkflow/components/CandidatePoolTab.js`**
- Shortlist decision plumbing: Yes / No / On Hold (`SHORTLIST` / `REJECT` / `HOLD`)

**`src/modules/candidateWorkflow/components/CandidateProfileModal.js`**
- Decision buttons for Yes / No / On Hold instead of a single Shortlist action (SCL_25)

**`src/modules/candidateWorkflow/components/CompensationPoolTab.js`**
- Rebuilt around FRS CTC / compensation details entry and display

**`src/modules/candidateWorkflow/components/OfferPoolTab.js`**
- Joining date (`DateInput`)
- Offer template preview
- Submit for approval flow
- Accept-before / joining date required for generate offer

### Committee / interviewer

**`src/modules/committeeManagement/AssignToPositionsTab.js`**
- Start/end date via `DateInput`; no past dates; end ≥ start

**`src/modules/interviewer/InterviewerSchedule.js`**
- Date filter
- Score / comments / decision (SELECT / REJECT / HOLD) redisplay after submit

---

## Issue / FRS mapping (FE-relevant)

| ID / theme | FE change |
|------------|-----------|
| SCL_01 | Login bfcache / stuck Sign-in button |
| SCL_07 / Position Master | Dept → titles dropdown; autofill Roles & Experience |
| SCL_16 | Job Description label → Roles & Responsibilities |
| SCL_25 | Shortlist Yes / No / On Hold |
| Compensation FRS | CompensationPoolTab CTC |
| Offer FRS | Joining date, preview, submit approval, Offer Approvals page |
| Specialization | Admin page + Add Position dropdown |
| Undo Fulfilled | JobPostings action |
| Dates | Shared `DateInput` DD-MM-YYYY |

---

## Data note (local QA, not code)

Existing `common.position_titles` rows that had `department_id = NULL` were linked to departments in `rms_dev` so the Position Title dropdown populated (e.g. ACCOUNTS & FINANCE → Accounts Executive). FE already called the by-department API correctly; empty dropdown was data, not a missing FE call.

---

## How to verify (FE)

1. Login → Sign in, use Back: button must not stay stuck.
2. Add Position: pick department → titles appear; pick title → confirm autofill → Roles & Responsibilities + Experience fill.
3. Candidate profile: Yes / No / On Hold.
4. Offer Pool: joining date, preview, submit for approval; Offer Approvals for L1/L2 users.
5. Admin → Specializations CRUD; Add Position specialization after education.
6. Job Postings: Undo Fulfilled on a fulfilled requisition.

---

## Commit / branch

- Branch: `preview`
- Commit message (this push): QA/FRS recruiter UI fixes — Position Master autofill, dates, offers, shortlist, specializations

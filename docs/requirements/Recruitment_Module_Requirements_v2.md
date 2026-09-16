# Recruitment Module — Requirements Document

| | |
|---|---|
| **Project** | Recruitment / Applicant Tracking Module |
| **Document Type** | Functional Requirements Specification |
| **Prepared By** | Ashwini Elati |
| **Reviewed By** | Harina Nethri (Client) |
| **Status** | Draft — Pending Client Review & Sign-off |
| **Version** | 1.0 (v.2 of the working doc) |

## Purpose & Scope

Functional requirements for the Recruitment / Applicant Tracking module, adapting the vendor's existing recruitment product — originally built for a public-sector/banking client — to Sagar Cements' private-sector, multi-plant manufacturing environment. Organised by screen/module in implementation order.

---

## 1. Requisition Listing Screen & Filters

- Existing filters: Year (with custom year-range), Month, Job Title, Department, Status.
- **Decision:** Add a **Location filter** to the requisition listing.
  - Business rule: location = the job/plant location, not the candidate's home location (e.g. a Hyderabad candidate applying to a Mattampally-plant job is tracked as "Mattampally").
  - Legacy product only filters location at candidate level, not position level — hence the new filter.
  - Location dropdown values: `HEAD OFFICE`, `MATTAMPALLY`, `JEERABAD`, `GUDIPADU`, `DACHEPALLI`, `BAYYAVARAM`, `JAJPUR`, `GBC`, `LIS`.

## 2. Create Requisition Screen

Original fields: Title, Job Description, Start Date, End Date, Cut-off Date.

- **Decision:** Remove **Cut-off Date** entirely — no candidate self-apply portal; recruiters manually upload candidates.
- **Decision:** Keep **Start Date** (internal tracking consistency only).
- **Decision/Rename:** "End Date" → **"Expected Fulfilment Date"** — target date to fill the requirement, distinct from actual candidate joining date (set later at offer stage).
- Requisition does **not** carry Department or Location — those live at Position level only (Section 4).

## 3. Requisition ↔ Position Structure

- Requisition is generic/high-level; Positions are created underneath it.
- A single Requisition can span **N departments** and **N positions**.
- Multiple openings for the same role (e.g. 3 Senior Managers) = a quantity/vacancy count on **one** position entry, not 3 separate records.

## 4. Create Position Screen (incl. Approval Upload)

- **Decision/Rename:** "Upload Indent" → **"Upload Approval Email/Document"** — proof of informal, email-based management approval. Scan, email attachment, or screenshot.
- **Decision:** Upload must support **image formats**, not just PDF/doc.
- "WRF" (Work Requirement Form) label rejected — no such formal document exists for this client.
- If an approval file already exists for the same department from a prior position, the system **auto-fetches and reuses** it; users can upload a new one for other departments.
- **Decision:** "Approved By" = configurable dropdown of approver roles (master-data driven).
  - Values: `JMD`, `Group President`, `Plant Head`, `Dept Head/HOD`, `Unit HR/Plant HR`, `Corporate HR`, `GM, HR`, `Others`.
- "Approved On" date field — fine as-is.
- **Decision:** Add a **Location (plant)** field beside/after Department on Position — this is what the plant-location filter (Section 1) is built on.

## 5. Position Master (Prefill Behaviour)

- Position Master pre-defines positions per department (e.g. HR → Senior Manager, AI Engineer, Developer).
- Selecting a Department auto-populates the Positions dropdown from that department's master data.
- Master-level position records carry pre-filled defaults (job description, min experience, education, grade) which auto-populate on selection; user can override.
- **Multiple Plant Locations:** separate Position records per location, same title/details, different Location value.
- Department dropdown values: `MARKETING`, `PROCESS & QC`, `MECHANICAL`, `HR & ADMIN`, `MINES & AUTOMOBILE`, `ELECTRICAL`, `INSTRUMENTATION`, `COMMERCIAL & PACKING`, `ACCOUNTS & FINANCE`, `PURCHASE & STORES`, `CAPTIVE POWER PLANT`, `WHRS & WTP`, `OPERATIONS`, `CIVIL`, `ENVIRONMENT & SAFETY`, `IT & EDP`, `PROJECTS & DEVELOPMENT`, `PLANT HEAD OFFICE`, `SECRETARIAL`, `SENIOR LEADERSHIP`.
- **Action item (client):** provide the Positions mapping list per department.

## 6. Position Detail Fields — Field-by-Field Decisions

| Field | Decision |
|---|---|
| Total Vacancies | Rename to "Total Positions" / "Number of Positions to be Hired" |
| Min Age / Max Age | Removed |
| Type of Employment (Contract vs Regular) | Keep; if Contract, also capture Contractual Period |
| Grade / Scale | Keep, usage pending client clarification (see business rule below) |
| Enable Location Preference (toggle) | Removed |
| Mandatory Education | Keep, simplified to 2 fields (dropdown/spec + description); sub-fields (10th/12th, full/part-time, duration, DRC) removed |
| Preferred Education | Removed entirely |
| Certifications | Keep, non-mandatory, must not block saving if blank |
| Mandatory Experience (Years & Months) | Simplify to **Years only** |
| Education-linked experience rule | Removed; replaced with simple "years of experience required" dropdown up to 30 |
| Roles & Responsibilities (free text) | Keep |
| "Medical" (mandatory checkbox) | Rename to **"Medical Fitness Required"** — confirmed applicable |
| Age Relaxation / Reservation Category block | Removed completely (public-sector-only concept) |

### Business Rule Needing Clarification — Grade & Compensation

Legacy system ties Grade to a fixed salary band regardless of experience. Unclear if Sagar's grades (Manager = Grade X, Supervisor = Grade Y) work the same way, or serve a different purpose (org hierarchy), since compensation is negotiated per-candidate post-interview.

- **Action item (client):** confirm whether Grade determines a fixed compensation band or serves another purpose.

## 7. Requisition/Position — Management Actions

- Positions added via "+" under a Requisition; editable afterward.
- **Business rule:** Edit allowed only **before approval**. Delete allowed only while status = "New" (not yet submitted/approved).
- **Business rule:** Once approved, all fields become **read-only** — only "View" remains.

### Close / Fulfil Requisition

- Purpose: mark closed once all/needed vacancies are filled — stops showing as open, feeds reporting.
- Does not need to be fully filled to close (can close early if remaining need is dropped).
- **Decision/Rename:** Do not label/colour as "Close" (red = implies cancellation). Rename to **"Fulfilled"**, recolour green/orange/mustard.
- Legacy "Re-initialization" feature — **not required, remove.**
- **Business rule:** Creating a requisition/position does **not** auto-route to approval — user must manually Submit.

## 8. Candidate Pool (renamed from "Candidate Management")

- **Decision/Rename:** "Candidate Workflow" → **"Candidate Management"** — candidates added manually, no automated portal feed.
- Flow: select Requisition + Position → "Add" → manually enter candidate details.
- Candidates default to status **"Applied."**

### Screening / Shortlisting

- HR manager reviews via "View Profile" (JD match, resume, email, phone).
- **Decision:** Simplify decision screen — remove extra fields (work criteria, age, eligibility). Keep resume view + 3-option shortlist decision: **Yes / No / On Hold**.
- Shortlisted → status "Shortlisted" → moves to Schedule step (Section 11).

## 9. Candidate Ranking / Auto-Match Score — Deferred

- Legacy auto-computes resume-to-JD match % ("70% match").
- **Decision:** Not implemented now (needs resume-parsing not yet built). Deferred; Rank button/column removed from UI, not mandatory for this release.

## 10. Interview Panel / Committee Management — Open Item

Legacy: separate Committee/Panel Management master screen (Panel Name + 1–N Panel Members from Users master), reusable across schedules, assignable to positions.

- **Decision:** Remove the "Panel Type" dropdown (Screening panel, Compensation panel, etc.) entirely — all panels are just "interview panels," distinguished only by name.
- **Fallback decision:** Implement a plain **"Add Interviewer"** option in the Schedule Interview screen (direct multi-select of users, no separate panel object) and **skip the panel master screen entirely**.
- **Action item (client):** confirm whether panel-style (multi-person) interviews are actually used and whether composition is static or varies.

## 11. Schedule Interview Screen — Simplified

Original complex design (panel/interviewers → Zone → date/start/end/duration → auto-calculated slots → "Interviews per day") was **rejected** — too tech-heavy for ground-level users.

### Final Simplified Design
- **Interview Date** and **Start Time** — entered manually per candidate.
- **End Time** — defaults automatically to **5:00 PM**, not user-entered.
- **Duration** — defaults automatically to **1 hour** per candidate, not user-entered.
- "Interviews per day" field — **removed**.
- Multiple candidates same day → each candidate's time entered manually, one at a time (no auto-calc).
- **Zone/Location** — represents plant location, auto-tied to the position's plant (same logic as Section 1).
- **Decision:** "Journal Office" physical verification step — **not applicable, remove entirely**.

## 12. Approval Workflow — Scope Reduced

Legacy has approval gates at many steps (Requisition, Extension, Zone Change, Committee, Exam, Interview, Offer Letter Request).

- **Decision:** Keep approval only for: **(1) Requisition creation**, and **(2) Offer Letter release**. Remove all other approval flows, including any interview-scheduling approval.

## 13. Interview Pool / Execution & Multiple Rounds

- No scheduling-approval gate → scheduled candidates go directly into Interview Pool with status **"Scheduled"**. Old "Schedule Pool" (needed pre-interview-pool approval) — **removed completely**.
- Interviewer logs in, sees candidate, conducts interview, enters feedback/scores, saves.
- Recruiter can view interview status + interviewer feedback/comments.
- **Decision:** Support **multiple interview rounds** — recruiter can re-select the same candidate and schedule another round, repeating the flow for N rounds.

### Notifications
- Interview invitation emails auto-sent to candidate **and** interviewer(s)/panel member(s) at scheduling time (one email per scheduled slot).
- No automatic system notification of interview outcome to candidates — remains a manual recruiter action.
- **Future enhancement (not built):** calendar invites alongside interview emails.

## 14. Interview Feedback Form & Scoring

Original: score out of 100, pass mark 60.

- **Decision:** Change scale to **1–10**, pass mark **5** (below 5 = disqualified/rejected; 5+ qualifies, but final selection not purely score-driven).
- **Decision:** Replace generic "Comment" with structured fields:
  - **Score** → rename to **"Rating (scale of 1-10)"**.
  - **Rationale for Score** (renamed from "Comment") — mandatory justification, always required alongside score.
  - Add **Decision** field: **Select / Reject / Hold**, plus possibly a 4th option **"Move to next round."**
- **Decision:** Use the **simpler** candidate feedback form (not the detailed one), with fields:
  - Candidate Name, Position, Department, Interview Date, Interviewer Name, Round
  - Competency Assessment (1=Poor, 5=Excellent): **Technical Knowledge, Relevant Experience, Communication, Problem Solving, Attitude & Approach**
  - Key Observations (free text)
  - Recommendation: **Strong Hire / Hire / Hold / Do Not Hire**
  - Comments

*(Note: this simpler form uses a 1–5 competency scale per criterion, distinct from the overall 1–10 candidate rating scale above — both were requested by the client.)*

## 15. Compensation Pool

- After interview qualification, before offer generation, HR discusses/negotiates compensation.
- Tracked fields: **Current CTC, Expected CTC/Hike requested, Fixed Pay, Variable Pay, Bonus (if any), free-text Comments, final Agreed CTC**.
- **Business rule (budget logic):** A compensation budget can be set per position. Final hiring favors candidates whose ask fits within budget, even among multiple qualified candidates.
- **Decision/Rename:** "Compensation Pool" → **"Compensation Management."**
- Current CTC, Expected CTC, Hike, Agreed CTC all confirmed necessary — **Agreed CTC feeds directly into the Offer Letter** salary field.

## 16. Offer Pool & Offer Letter Generation

- **Decision:** Remove **Signatory Designation** and **Digital Signature** fields — not required. A scanned/static signature image can be embedded in the letter template instead (no live e-signature/key infrastructure needed).
- **Decision:** Remove **"Merit List"** and **"Assign Locations"** fields — location is auto-pulled from the position's plant location, not manually assigned here.

### Offer Letter Flow
- User selects an offer template, previews it, sets an **"accept-before"** date and the candidate's **joining date**.
- **Agreed CTC** from Compensation Review auto-populates into the offer letter (not re-entered manually).
- On Submit/Send: offer routes through the **Offer Letter approval step** (one of the two retained approvals, Section 12). Only after approval is it **automatically emailed** to the candidate.

### Candidate Acceptance Flow
- Offer email includes **Accept / Reject** buttons directly in the template.
- **Business rule:** explicit accept-before deadline (e.g. 2–3 days). Accept clicked **after** deadline must **not** register as a valid acceptance.

## 17. Onboarding — Deferred

Identified as future scope; explicitly deferred to a separate future session so this phase could focus on finalizing recruitment flow first.

## 18. Admin / Master Data Screens

- **Confirmed/needed:** Users master, Departments master, Position master.
- **Removed:** Job Grade master screen (though "Grade" field remains on Position — pending clarification, Section 6).
- **Removed (likely):** Categories master — may be revisited if industry certifications need modelling as required-education entries; not committed.
- **Removed:** Documents, Annexures, General Statement, Languages sections — confirmed not used by client.
- **Kept:** Education Qualification master only.
- General principle: admin section built based on data-entry needs from finalized workflows; more master-data screens can be added later.

## 19. Dashboard — Not Yet Scoped

Dashboard requirements have not yet been captured; to be defined in a follow-up discussion.

## 20. Consolidated List of Open Action Items

| # | Owner | Action Item | Status |
|---|---|---|---|
| 1 | Client | Provide plant/location master data (Location dropdown on Position + Location filter on Requisition listing) | Shared by client |
| 2 | Client | Provide dropdown values/roles for "Approved By" field | Shared by Client |
| 3 | Client | Provide full Department → Position mapping/list to pre-populate Position Master | Dept dropdown shared; mapping to follow (requested from SCL team) |
| 4 | Client | Confirm whether Grade determines a fixed compensation band or serves a different purpose | To be confirmed with SCL team |
| 5 | Client | Confirm whether panel-style (multi-person) interviews are actually used, and whether panel composition is static or varies | To be confirmed with SCL team |
| 6 | Client | Share the referenced simplified interview feedback form | Shared by Client |
| 7 | Dev Team | Propose a better name than "Compensation Pool" | Compensation Management (proposed) |
| 8 | Dev Team | Finalize rename/recolour of requisition "Close" action → "Fulfilled," green/orange | — |
| 9 | Dev Team | Compile complete per-screen written requirements doc, circulate for client review before development | — |
| 10 | Both | Deferred to future session: Dashboard requirements, Onboarding module requirements | — |
| 11 | Both | Deferred (non-blocking): automatic resume-based candidate ranking/match-score | — |
| 12 | Both | Deferred (non-blocking): calendar-invite integration alongside interview invitation emails | — |

/**
 * Per-route breadcrumb/title/subtitle shown in the Topbar, styled after the
 * LMS's "Learning / Dashboard" breadcrumb + bold title + muted subtitle
 * pattern. The Topbar title stays a stable section label even on nested
 * create/edit pages (matching the LMS, e.g. "HR Policy Admin" stays in the
 * topbar while the page body itself shows "Create New Policy"); each page
 * body renders its own specific action title below.
 */
const ROUTES = [
  {
    prefix: "/dashboard",
    section: "Recruitment",
    title: (user) => `Welcome, ${user.name || "there"}`,
    subtitle: "Here's a quick look at your portal",
  },
  {
    prefix: "/job-postings",
    matchNested: true,
    section: "Recruitment",
    title: "Job Postings",
    subtitle: "Create, submit and track requisitions through approval",
  },
  {
    prefix: "/candidate-workflow",
    section: "Recruitment",
    title: "Candidate Workflow",
    subtitle: "Manage candidates through screening, interview, compensation and offer",
  },
  {
    prefix: "/committee-management",
    section: "Recruitment",
    title: "Committee Management",
    subtitle: "Manage interview panels and assign them to positions",
  },
  {
    prefix: "/approvals",
    section: "Approvals",
    title: "Requisition Approvals",
    subtitle: "Review and approve or reject requisition requests",
  },
  {
    prefix: "/interviewer",
    section: "Interviews",
    title: "My Interview Schedule",
    subtitle: "Score candidates assigned to your panel",
  },
  {
    prefix: "/admin/users",
    section: "Administration",
    title: "Users",
    subtitle: "Manage system users and their roles",
  },
  {
    prefix: "/admin/departments",
    section: "Administration",
    title: "Departments",
    subtitle: "Manage department master data",
  },
  {
    prefix: "/admin/locations",
    section: "Administration",
    title: "Locations",
    subtitle: "Manage plant and office locations",
  },
  {
    prefix: "/admin/position-titles",
    section: "Administration",
    title: "Position Titles",
    subtitle: "Manage position title master data",
  },
  {
    prefix: "/admin/education-qualifications",
    section: "Administration",
    title: "Education Qualifications",
    subtitle: "Manage education qualification master data",
  },
];

export function getPageMeta(pathname, user) {
  const match = ROUTES.find(
    (route) => pathname === route.prefix || (route.matchNested && pathname.startsWith(route.prefix + "/"))
  );

  if (!match) {
    return { section: "Sentrifugo RMS", title: "Sentrifugo RMS", subtitle: "" };
  }

  return {
    section: match.section,
    title: typeof match.title === "function" ? match.title(user) : match.title,
    subtitle: match.subtitle,
  };
}

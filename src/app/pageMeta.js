/**
 * Per-route title/subtitle shown in the Topbar, styled after the LMS's bold
 * title + muted subtitle pattern. The Topbar title stays a stable section
 * label even on nested create/edit pages (matching the LMS, e.g. "HR Policy
 * Admin" stays in the topbar while the page body itself shows "Create New
 * Policy"); each page body renders its own specific action title below.
 */
const ROUTES = [
  {
    prefix: "/dashboard",
    title: (user) => `Welcome, ${user.name || "there"}`,
    subtitle: "Here's a quick look at your portal",
  },
  {
    prefix: "/job-postings",
    matchNested: true,
    title: "Job Postings",
    subtitle: "Create, submit and track requisitions through approval",
  },
  {
    prefix: "/candidate-workflow",
    title: "Candidate Management",
    subtitle: "Manage candidates through screening, interview, compensation and offer",
  },
  {
    prefix: "/committee-management",
    title: "Committee Management",
    subtitle: "Manage interview panels and assign them to positions",
  },
  {
    prefix: "/approvals",
    title: "Requisition Approvals",
    subtitle: "Review and approve or reject requisition requests",
  },
  {
    prefix: "/offer-approvals",
    title: "Offer Approvals",
    subtitle: "Review and approve or reject offer letter requests before they're emailed",
  },
  {
    prefix: "/interviewer",
    title: "My Interview Schedule",
    subtitle: "Score candidates assigned to your panel",
  },
  {
    prefix: "/admin/users",
    title: "Users",
    subtitle: "Manage system users and their roles",
  },
  {
    prefix: "/admin/departments",
    title: "Departments",
    subtitle: "Manage department master data",
  },
  {
    prefix: "/admin/locations",
    title: "Locations",
    subtitle: "Manage plant and office locations",
  },
  {
    prefix: "/admin/position-titles",
    title: "Position Titles",
    subtitle: "Manage position title master data",
  },
  {
    prefix: "/admin/education-qualifications",
    title: "Education Qualifications",
    subtitle: "Manage education qualification master data",
  },
  {
    prefix: "/admin/specializations",
    title: "Specializations",
    subtitle: "Manage specialization master data (optional, linked to an education level)",
  },
];

export function getPageMeta(pathname, user) {
  const match = ROUTES.find(
    (route) => pathname === route.prefix || (route.matchNested && pathname.startsWith(route.prefix + "/"))
  );

  if (!match) {
    return { title: "Sentrifugo RMS", subtitle: "" };
  }

  return {
    title: typeof match.title === "function" ? match.title(user) : match.title,
    subtitle: match.subtitle,
  };
}

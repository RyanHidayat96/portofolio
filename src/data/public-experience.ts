import { experience } from "./experience";

const summaryByRoleId: Readonly<Record<string, string>> = {
  "jasa-marga-full-stack":
    "Current full-stack role building enterprise application workflows across frontend, backend, APIs, data, and delivery.",
  "jasa-marga-sdet":
    "SDET role focused on automation, API/mobile/web testing, reporting, performance checks, and delivery confidence.",
  "astra-sqa":
    "SQA role covering manual testing, automation, API validation, regression, smoke, SIT, UAT, and release support.",
  "adira-software-engineer":
    "Software engineering role building enterprise backend features, REST APIs, database workflows, and production support."
};

export const publicExperience = experience.map((role) => ({
  id: role.id,
  company: role.company,
  role: role.role,
  period: role.period,
  location: role.location,
  summary: summaryByRoleId[role.id] ?? role.impact[0] ?? "",
  technologies: role.technologies.slice(0, 6)
}));

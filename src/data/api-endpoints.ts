import type { ApiEndpointDefinition } from "./types";

export const apiEndpoints: readonly ApiEndpointDefinition[] = [
  {
    method: "GET",
    path: "/api/ryan",
    title: "Ryan Profile",
    description: "Portfolio-safe identity, role, and focus response.",
    responseShape: [
      "name",
      "role",
      "headline",
      "yearsOfExperience",
      "tagline",
      "location",
      "focus"
    ],
    relatedSkills: ["REST API", "Next.js", "TypeScript"]
  },
  {
    method: "GET",
    path: "/api/skills",
    title: "Skills",
    description: "Grouped technical capabilities from centralized data.",
    responseShape: [
      "skillGroups[].title",
      "skillGroups[].skills[].name",
      "skillGroups[].skills[].purpose"
    ],
    relatedSkills: ["API Testing", "Contract Validation", "TypeScript"]
  },
  {
    method: "GET",
    path: "/api/projects",
    title: "Projects",
    description: "Portfolio-safe engineering case studies from centralized data.",
    responseShape: ["projects[].title", "projects[].problem", "projects[].technologies"],
    relatedSkills: ["REST API", "Portfolio Data", "Content Safety"]
  },
  {
    method: "GET",
    path: "/api/experience",
    title: "Experience",
    description: "Verified professional timeline with role, period, impact, and technology data.",
    responseShape: [
      "experience[].company",
      "experience[].role",
      "experience[].period",
      "experience[].technologies"
    ],
    relatedSkills: ["API Testing", "Data Contracts", "TypeScript"]
  },
  {
    method: "GET",
    path: "/api/contact",
    title: "Contact",
    description: "Verified public contact channels for Ryan.",
    responseShape: ["contact[].label", "contact[].href", "contact[].isPrimary"],
    relatedSkills: ["REST API", "Privacy Safety", "Contract Validation"]
  }
] as const;

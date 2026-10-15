import { apiEndpoints } from "@/data/api-endpoints";
import { profile } from "@/data/profile";
import { publicExperience } from "@/data/public-experience";
import { projects as projectData } from "@/data/projects";
import { skillGroups as skillGroupData } from "@/data/skills";
import { GET as getContact } from "@/app/api/contact/route";
import { GET as getArchitecture } from "@/app/api/architecture/route";
import { GET as getCareer } from "@/app/api/career/route";
import { GET as getExperience } from "@/app/api/experience/route";
import { GET as getProjects } from "@/app/api/projects/route";
import { GET as getRyan } from "@/app/api/ryan/route";
import { GET as getSkills } from "@/app/api/skills/route";
import { architecturePresets } from "@/data/architecture";
import { isPortfolioValueConfigured } from "@/lib/portfolio-values";
import { describe, expect, it } from "vitest";

describe("portfolio API contracts", () => {
  it("defines portfolio-safe GET endpoints", () => {
    expect(apiEndpoints.length).toBeGreaterThan(0);
    expect(apiEndpoints.map((endpoint) => endpoint.path)).toEqual(
      expect.arrayContaining([
        "/api/ryan",
        "/api/skills",
        "/api/projects",
        "/api/experience",
        "/api/architecture",
        "/api/career",
        "/api/contact"
      ])
    );
    expect(apiEndpoints.every((endpoint) => endpoint.method === "GET")).toBe(true);
    expect(apiEndpoints.every((endpoint) => endpoint.responseShape.length > 0)).toBe(true);
  });

  it("returns configured profile contract", async () => {
    const response = getRyan();
    const body = (await response.json()) as {
      readonly name: string;
      readonly role: string;
      readonly headline: string;
      readonly yearsOfExperience: string;
      readonly tagline: string;
      readonly location: string;
      readonly focus: readonly string[];
    };

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("application/json");
    expect(Object.keys(body)).toEqual([
      "name",
      "role",
      "headline",
      "yearsOfExperience",
      "tagline",
      "location",
      "focus"
    ]);
    expect(body.name).toBe(profile.name);
    expect(body.role).toBe(profile.role);
    expect(body.focus).toEqual(profile.focusAreas);
  });

  it("returns skills, projects, experience, and contact contracts", async () => {
    const skills = (await getSkills().json()) as { readonly skillGroups: readonly unknown[] };
    const projects = (await getProjects().json()) as { readonly projects: readonly unknown[] };
    const experience = (await getExperience().json()) as {
      readonly experience: readonly unknown[];
    };
    const contact = (await getContact().json()) as { readonly contact: readonly unknown[] };

    expect(skills.skillGroups.length).toBeGreaterThan(0);
    expect(projects.projects.length).toBeGreaterThan(0);
    expect(experience.experience.length).toBeGreaterThan(0);
    expect(contact.contact.length).toBeGreaterThan(0);
  });

  it("returns architecture and career contracts for engineer exploration", async () => {
    const architectureResponse = getArchitecture();
    const architecture = (await architectureResponse.json()) as {
      readonly defaultPresetId: string | null;
      readonly architecture: typeof architecturePresets;
    };
    const careerResponse = getCareer();
    const career = (await careerResponse.json()) as {
      readonly journey: readonly { readonly role: string; readonly summary: string }[];
      readonly currentFocus: string;
      readonly engineeringProfile: string;
      readonly focusAreas: readonly string[];
      readonly detailSource: string;
    };

    expect(architectureResponse.status).toBe(200);
    expect(architecture.defaultPresetId).toBe(architecturePresets[0]?.id ?? null);
    expect(architecture.architecture).toHaveLength(architecturePresets.length);
    expect(careerResponse.status).toBe(200);
    // The career route is timeline-safe: it exposes focus labels, not dates or employers.
    expect(career.currentFocus).toBe(profile.role);
    expect(career.engineeringProfile).toBe(profile.headline);
    expect(career.focusAreas).toEqual(profile.focusAreas);
    expect(career.journey[0]).toMatchObject({
      role: publicExperience[0]?.role,
      summary: publicExperience[0]?.summary
    });
    // Timeline-safe: no employer, date range, or location fields on the journey entries.
    expect(Object.keys(career.journey[0] ?? {})).toEqual(
      expect.not.arrayContaining(["company", "period", "location", "startDate", "endDate"])
    );
    expect(career.detailSource).toContain("CV");
  });

  it("returns skills API contract with grouped skill metadata", async () => {
    const response = getSkills();
    const body = (await response.json()) as {
      readonly skillGroups: typeof skillGroupData;
    };

    expect(response.status).toBe(200);
    expect(body.skillGroups).toHaveLength(skillGroupData.length);
    expect(body.skillGroups[0]).toMatchObject({
      id: expect.any(String),
      title: expect.any(String),
      skills: expect.arrayContaining([
        expect.objectContaining({
          name: expect.any(String),
          purpose: expect.any(String),
          relatedProjects: expect.any(Array)
        })
      ])
    });
  });

  it("returns experience API contract with timeline-safe fields", async () => {
    const response = getExperience();
    const body = (await response.json()) as {
      readonly experience: typeof publicExperience;
    };
    const firstRole = body.experience[0];

    expect(response.status).toBe(200);
    expect(body.experience).toHaveLength(publicExperience.length);
    expect(firstRole).toMatchObject({
      id: expect.any(String),
      role: expect.any(String),
      summary: expect.any(String),
      technologies: expect.any(Array)
    });
    // The public contract deliberately stays timeline-safe.
    expect(firstRole).not.toHaveProperty("responsibilities");
    expect(firstRole).not.toHaveProperty("impact");
    expect(firstRole).not.toHaveProperty("company");
    expect(firstRole).not.toHaveProperty("period");
    expect(firstRole).not.toHaveProperty("location");
  });

  it("returns project API contract with portfolio-safe case studies", async () => {
    const response = getProjects();
    const body = (await response.json()) as {
      readonly projects: typeof projectData;
    };

    expect(response.status).toBe(200);
    expect(body.projects).toHaveLength(projectData.length);
    expect(body.projects.every((project) => project.status === "portfolio-safe")).toBe(true);
    expect(body.projects[0]).toMatchObject({
      slug: expect.any(String),
      title: expect.any(String),
      problem: expect.any(String),
      testingStrategy: expect.any(Array),
      technologies: expect.any(Array)
    });
  });

  it("returns only configured contact links", async () => {
    const response = getContact();
    const body = (await response.json()) as {
      readonly contact: readonly {
        readonly id: string;
        readonly href: string;
        readonly value: string;
      }[];
    };

    expect(response.status).toBe(200);
    expect(body.contact.map((link) => link.id)).toEqual(
      Object.values(profile.contact)
        .filter(
          (link) => isPortfolioValueConfigured(link.value) && isPortfolioValueConfigured(link.href)
        )
        .map((link) => link.id)
    );
    expect(body.contact.every((link) => link.href && link.value)).toBe(true);
    // The route serves whatever profile data is configured, so assert the
    // filtering rule rather than a fixed exclusion list.
    const expectedIds = Object.values(profile.contact)
      .filter(
        (link) => isPortfolioValueConfigured(link.value) && isPortfolioValueConfigured(link.href)
      )
      .map((link) => link.id);
    expect(body.contact.map((link) => link.id)).toEqual(expectedIds);
  });
});

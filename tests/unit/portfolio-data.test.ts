import { education } from "@/data/education";
import { experience } from "@/data/experience";
import { profile } from "@/data/profile";
import { projects } from "@/data/projects";
import { skillGroups } from "@/data/skills";
import { capabilities, fullCycleNodes } from "@/data/capabilities";
import { isPortfolioValueConfigured } from "@/lib/portfolio-values";
import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";

const forbiddenPlaceholderTokens = ["TO" + "DO_PORTFOLIO_DATA", "TO" + "DO", "FIX" + "ME"];

describe("verified portfolio data", () => {
  it("does not expose raw placeholder markers", () => {
    const serializedData = JSON.stringify({
      profile,
      experience,
      projects,
      skillGroups,
      education
    });

    for (const token of forbiddenPlaceholderTokens) {
      expect(serializedData).not.toContain(token);
    }
  });

  it("includes recruiter-critical identity, contact, experience, and education data", () => {
    expect(profile.name).not.toHaveLength(0);
    expect(profile.yearsOfExperience).not.toHaveLength(0);
    expect(profile.contact.email.href).toMatch(/^mailto:/);
    expect(profile.contact.linkedIn.href).toMatch(/^https:\/\//);
    expect(experience).toHaveLength(4);
    expect(education[0]?.institution).not.toHaveLength(0);
  });

  it("uses canonical Full Stack x SDET positioning", () => {
    const currentRole = experience.find((role) => role.id === "jasa-marga-full-stack");
    const sdetRole = experience.find((role) => role.id === "jasa-marga-sdet");

    expect(profile.headline).toBe("Full Stack Engineer × SDET");
    expect(profile.role).toBe("Full Stack Developer");
    expect(currentRole).toMatchObject({
      role: "Full Stack Developer",
      period: "Mar 2026 - Present"
    });
    expect(sdetRole).toMatchObject({
      role: "Software Development Engineer in Test (SDET)",
      period: "Jul 2025 - Feb 2026"
    });
  });

  it("models build, quality, data, delivery, and full-cycle nodes", () => {
    expect(capabilities.map((item) => item.domain)).toEqual([
      "build",
      "quality",
      "data",
      "delivery"
    ]);
    expect(fullCycleNodes.map((node) => node.id)).toEqual([
      "idea",
      "frontend",
      "api",
      "backend",
      "data",
      "quality",
      "cicd",
      "production"
    ]);
  });

  it("keeps unverified GitHub hidden and validates CV when configured", () => {
    expect(isPortfolioValueConfigured(profile.contact.github.href)).toBe(false);

    if (isPortfolioValueConfigured(profile.contact.cv.href)) {
      expect(profile.contact.cv.href).toBe("/cv.pdf");
      expect(profile.contact.cv.value).not.toHaveLength(0);
      expect(existsSync("public/cv.pdf")).toBe(true);
      return;
    }

    expect(profile.contact.cv.href).toBe("");
  });
});

import { education } from "@/data/education";
import { experience } from "@/data/experience";
import { profile } from "@/data/profile";
import { projects } from "@/data/projects";
import { skillGroups } from "@/data/skills";
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
    expect(experience).toHaveLength(3);
    expect(education[0]?.institution).not.toHaveLength(0);
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

import { education } from "@/data/education";
import { experience } from "@/data/experience";
import { profile } from "@/data/profile";
import { projects } from "@/data/projects";
import { skillGroups } from "@/data/skills";
import { isPortfolioValueConfigured } from "@/lib/portfolio-values";
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
    expect(profile.name).toBe("Ryan Hidayat");
    expect(profile.yearsOfExperience).toBe("4+ years");
    expect(profile.contact.email.href).toBe("mailto:ryanhidayat123456789@gmail.com");
    expect(profile.contact.linkedIn.href).toBe("https://linkedin.com/in/ryan-hi");
    expect(experience).toHaveLength(3);
    expect(education[0]?.institution).toBe("Universitas Dian Nusantara");
  });

  it("keeps unverified GitHub and CV links hidden until configured", () => {
    expect(isPortfolioValueConfigured(profile.contact.github.href)).toBe(false);
    expect(isPortfolioValueConfigured(profile.contact.cv.href)).toBe(false);
  });
});

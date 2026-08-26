"use client";

import { Button } from "@/components/ui/Button";
import { branding } from "@/data/branding";
import { experience } from "@/data/experience";
import { profile } from "@/data/profile";
import { EngineeringCore } from "@/features/workspace/components/EngineeringCore";
import { ScrollNarrative } from "@/features/workspace/components/ScrollNarrative";
import { isPortfolioValueConfigured } from "@/lib/portfolio-values";
import {
  ArrowDown,
  BriefcaseBusiness,
  ExternalLink,
  FileText,
  Power
} from "lucide-react";

const heroCapabilities = [
  {
    label: "Build",
    value: "Frontend, API, backend, data"
  },
  {
    label: "Quality",
    value: "Automation, API, mobile, performance"
  },
  {
    label: "Ship",
    value: "CI/CD, Docker, quality gates"
  }
] as const;

export function Landing({
  onInitialize
}: Readonly<{
  onInitialize: () => void;
}>): React.ReactElement {
  const cvLink = profile.contact.cv;
  const linkedInLink = profile.contact.linkedIn;
  const hasCv = isPortfolioValueConfigured(cvLink.value) && isPortfolioValueConfigured(cvLink.href);
  const hasLinkedIn =
    isPortfolioValueConfigured(linkedInLink.value) && isPortfolioValueConfigured(linkedInLink.href);
  const currentRole = experience.find((role) => role.id === "jasa-marga-full-stack");
  const ctaLinkClass = "action-link";

  return (
    <main className="landing-shell">
      <div aria-hidden="true" className="engineering-grid landing-grid" />
      <section className="content-container landing-hero" aria-labelledby="landing-title">
        <div className="landing-hero-grid">
          <div className="landing-copy">
            <div className="landing-eyebrow">
              <span>{branding.appName}</span>
              <span aria-hidden="true" />
              <span>Full Stack x SDET</span>
            </div>

            <p className="landing-role">{profile.role}</p>
            <h1 id="landing-title" className="landing-title">
              {profile.name}
            </h1>

            <p className="landing-statement">
              {branding.heroStatementLead}
              <span>{branding.heroStatementAccent}</span>
            </p>

            <p className="landing-summary">
              Full Stack Developer building enterprise applications across frontend, backend, APIs,
              databases, test automation, performance engineering, and CI/CD delivery.
            </p>

            <div className="landing-current" aria-label="Current role">
              <BriefcaseBusiness aria-hidden="true" size={18} />
              <span>{currentRole?.role ?? profile.role}</span>
              <span>{currentRole?.period ?? "Mar 2026 - Present"}</span>
            </div>

            <ol className="landing-pillars" aria-label="Build Quality Ship positioning">
              {heroCapabilities.map((item) => (
                <li key={item.label}>
                  <span>{item.label}</span>
                  <p>{item.value}</p>
                </li>
              ))}
            </ol>

            <div className="landing-actions">
              <Button
                variant="primary"
                icon={<Power aria-hidden="true" size={18} />}
                onClick={onInitialize}
                className="w-full sm:w-auto"
              >
                Open Portfolio
              </Button>
              {hasCv ? (
                <a href={cvLink.href} download="cv.pdf" className={ctaLinkClass}>
                  <FileText aria-hidden="true" size={18} />
                  <span>Download CV</span>
                </a>
              ) : null}
              {hasLinkedIn ? (
                <a
                  href={linkedInLink.href}
                  className={ctaLinkClass}
                  rel="noreferrer"
                  target="_blank"
                >
                  <ExternalLink aria-hidden="true" size={18} />
                  <span>LinkedIn</span>
                </a>
              ) : null}
            </div>

            <a className="landing-scroll-cue" href="#build-quality-ship">
              <ArrowDown aria-hidden="true" size={16} />
              <span>Follow Build Quality Ship</span>
            </a>
          </div>

          <EngineeringCore />
        </div>
      </section>
      <ScrollNarrative />
    </main>
  );
}

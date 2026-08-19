import type { Profile } from "./types";

export const profile: Profile = {
  name: "Ryan Hidayat",
  headline: "Software Development Engineer in Test (SDET) | QA Automation Engineer",
  role: "SDET",
  yearsOfExperience: "4+ years",
  tagline: "I don't just test software. I engineer confidence.",
  summary:
    "Ryan is a Software Development Engineer in Test and Software Quality Assurance Engineer with 4+ years of experience across enterprise web, mobile, API, and performance testing. He builds scalable automation frameworks with Playwright, WebDriverIO, Appium, and TypeScript, integrates automated quality gates into CI/CD pipelines, and brings backend engineering experience with Java Spring Boot, REST APIs, microservices, and enterprise data validation.",
  location: "Jakarta, Indonesia",
  availability: "Open to relevant SDET / QA Automation opportunities",
  focusAreas: [
    "Automation Engineering",
    "Web Testing",
    "Mobile Testing",
    "API Testing",
    "Performance Testing",
    "CI/CD Quality Engineering"
  ],
  contact: {
    email: {
      id: "email",
      label: "Email",
      value: "ryanhidayat123456789@gmail.com",
      href: "mailto:ryanhidayat123456789@gmail.com",
      isPrimary: true
    },
    linkedIn: {
      id: "linkedin",
      label: "LinkedIn",
      value: "linkedin.com/in/ryan-hi",
      href: "https://linkedin.com/in/ryan-hi",
      isPrimary: true
    },
    phone: {
      id: "phone",
      label: "Phone",
      value: "087775009393",
      href: "tel:087775009393"
    },
    github: {
      id: "github",
      label: "GitHub",
      value: "",
      href: ""
    },
    cv: {
      id: "cv",
      label: "CV",
      value: "",
      href: ""
    }
  }
} as const;

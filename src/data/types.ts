export interface ContactLink {
  readonly id: "email" | "linkedin" | "phone" | "github" | "cv";
  readonly label: string;
  readonly value: string;
  readonly href: string;
  readonly isPrimary?: boolean;
}

export interface Profile {
  readonly name: string;
  readonly headline: string;
  readonly role: string;
  readonly yearsOfExperience: string;
  readonly tagline: string;
  readonly summary: string;
  readonly location: string;
  readonly availability: string;
  readonly focusAreas: readonly string[];
  readonly contact: {
    readonly email: ContactLink;
    readonly linkedIn: ContactLink;
    readonly phone: ContactLink;
    readonly github: ContactLink;
    readonly cv: ContactLink;
  };
}

export interface Skill {
  readonly name: string;
  readonly purpose: string;
  readonly relatedProjects: readonly string[];
}

export interface SkillGroup {
  readonly id: string;
  readonly title: string;
  readonly skills: readonly Skill[];
}

export interface ExperienceRole {
  readonly id: string;
  readonly company: string;
  readonly role: string;
  readonly period: string;
  readonly location: string;
  readonly responsibilities: readonly string[];
  readonly impact: readonly string[];
  readonly technologies: readonly string[];
}

export interface EducationCredential {
  readonly institution: string;
  readonly degree: string;
  readonly period: string;
  readonly gpa: string;
  readonly location: string;
}

export interface ProjectCaseStudy {
  readonly slug: string;
  readonly title: string;
  readonly status: "content-needed" | "portfolio-safe";
  readonly problem: string;
  readonly context: string;
  readonly responsibility: string;
  readonly architecture: string;
  readonly engineeringDecisions: readonly string[];
  readonly testingStrategy: readonly string[];
  readonly outcome: string;
  readonly lessons: readonly string[];
  readonly technologies: readonly string[];
}

export interface ArchitectureNode {
  readonly id: string;
  readonly label: string;
  readonly layer: string;
  readonly purpose: string;
  readonly x: number;
  readonly y: number;
  readonly relatedSkills: readonly string[];
  readonly relatedProjects: readonly string[];
}

export interface ArchitectureEdge {
  readonly id: string;
  readonly source: string;
  readonly target: string;
  readonly label: string;
}

export interface ChallengeScenario {
  readonly id: string;
  readonly title: string;
  readonly domain: string;
  readonly difficulty: "baseline" | "intermediate" | "advanced";
  readonly prompt: string;
  readonly metrics: readonly string[];
  readonly choices: readonly {
    readonly id: string;
    readonly label: string;
    readonly isPreferred: boolean;
    readonly feedback: string;
  }[];
  readonly approach: readonly string[];
}

export interface ApiEndpointDefinition {
  readonly method: "GET";
  readonly path: string;
  readonly title: string;
  readonly description: string;
  readonly responseShape: readonly string[];
  readonly relatedSkills: readonly string[];
}

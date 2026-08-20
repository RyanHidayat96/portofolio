import { parseJsonEnv } from "./env";
import type { Profile } from "./types";

const fallbackProfile: Profile = {
  name: "Portfolio Owner",
  headline: "Portfolio profile not configured",
  role: "Portfolio Owner",
  yearsOfExperience: "",
  tagline: "Configure NEXT_PUBLIC_RYANOS_PROFILE_JSON in .env.",
  summary: "Portfolio profile data is loaded from environment configuration.",
  location: "",
  availability: "",
  focusAreas: [],
  contact: {
    email: {
      id: "email",
      label: "Email",
      value: "",
      href: ""
    },
    linkedIn: {
      id: "linkedin",
      label: "LinkedIn",
      value: "",
      href: ""
    },
    phone: {
      id: "phone",
      label: "Phone",
      value: "",
      href: ""
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
};

export const profile: Profile = parseJsonEnv<Profile>(
  process.env.NEXT_PUBLIC_RYANOS_PROFILE_JSON,
  "NEXT_PUBLIC_RYANOS_PROFILE_JSON",
  fallbackProfile
);

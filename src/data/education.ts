import type { EducationCredential } from "./types";

export const education: readonly EducationCredential[] = [
  {
    institution: "Universitas Dian Nusantara",
    degree: "Bachelor of Informatics Engineering",
    period: "March 2020 - June 2024",
    gpa: "3.77 / 4.00",
    location: "Jakarta, Indonesia"
  }
] as const;

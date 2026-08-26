import { experience } from "@/data/experience";
import { profile } from "@/data/profile";
import { NextResponse } from "next/server";

export const dynamic = "force-static";
export const revalidate = 3600;

export function GET(): NextResponse {
  return NextResponse.json({
    journey: experience.map((role) => ({
      role: role.role,
      company: role.company,
      period: role.period
    })),
    currentRole: profile.role,
    currentCompany: experience[0]?.company ?? "",
    engineeringProfile: profile.headline,
    focusAreas: profile.focusAreas
  });
}

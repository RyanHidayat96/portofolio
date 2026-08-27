import { publicExperience } from "@/data/public-experience";
import { profile } from "@/data/profile";
import { NextResponse } from "next/server";

export const dynamic = "force-static";
export const revalidate = 3600;

export function GET(): NextResponse {
  return NextResponse.json({
    journey: publicExperience.map((item) => ({
      role: item.role,
      summary: item.summary,
      focus: item.technologies
    })),
    currentFocus: profile.role,
    engineeringProfile: profile.headline,
    focusAreas: profile.focusAreas,
    detailSource: "Full company timeline, dates, and responsibilities are available in the CV."
  });
}
import { profile } from "@/data/profile";
import { NextResponse } from "next/server";

export function GET(): NextResponse {
  return NextResponse.json({
    name: profile.name,
    role: profile.role,
    headline: profile.headline,
    yearsOfExperience: profile.yearsOfExperience,
    tagline: profile.tagline,
    location: profile.location,
    focus: profile.focusAreas
  });
}

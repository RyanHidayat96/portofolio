import { publicExperience } from "@/data/public-experience";
import { NextResponse } from "next/server";

export function GET(): NextResponse {
  return NextResponse.json({ experience: publicExperience });
}

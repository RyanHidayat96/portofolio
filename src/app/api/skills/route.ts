import { skillGroups } from "@/data/skills";
import { NextResponse } from "next/server";

export function GET(): NextResponse {
  return NextResponse.json({ skillGroups });
}

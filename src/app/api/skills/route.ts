import { skillGroups } from "@/data/skills";
import { NextResponse } from "next/server";

export const dynamic = "force-static";
export const revalidate = 3600;

export function GET(): NextResponse {
  return NextResponse.json({ skillGroups });
}
